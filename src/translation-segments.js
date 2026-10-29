import { protectText, validateTranslation } from './translation-engine.js';

export const SEGMENTER_VERSION = 1;
const tokenPattern = /⟦SM\d{4,}X⟧/g;
const done = part => ['translated', 'reviewed'].includes(part.status);
const readable = (text, tokens) => tokens.reduce((value, token) => value.replaceAll(token.token, token.value), text);
const prose = (text, tokens) => /\p{L}/u.test(text.replace(tokenPattern, ''));

function sourceOf(block) {
  if (typeof block.protectedSource !== 'string') {
    const value = protectText(block.source);
    block.protectedSource = value.protectedText; block.tokens = value.tokens;
  }
  if (readable(block.protectedSource, block.tokens) !== block.source) throw new Error('A estrutura salva deste bloco não corresponde ao original. Crie uma nova tradução para este guia.');
  return block.protectedSource;
}

function segmentRanges(block, limit) {
  const source = sourceOf(block), tokens = new Map(block.tokens.map(token => [token.token, token]));
  const lines = []; let cursor = 0;
  for (const match of source.matchAll(tokenPattern)) {
    if ((tokens.get(match[0])?.value || '').includes('\n')) { lines.push([cursor, match.index]); cursor = match.index + match[0].length; }
  }
  lines.push([cursor, source.length]);
  const rawLines = block.source.split(/\r?\n/);
  const table = rawLines.some(line => /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line));
  const indentedCode = rawLines.filter(line => line.trim()).every(line => /^(?: {4}|\t)/.test(line) && !/^\s*(?:[-+*]|\d+[.)])\s/.test(line));
  if (indentedCode) return [];
  const ranges = [];
  function add(start, end, kind = 'text') {
    // Structural prefixes and whitespace stay outside the generated span.
    while (start < end) {
      const text = source.slice(start, end);
      const whitespace = text.match(/^\s+/);
      if (whitespace) { start += whitespace[0].length; continue; }
      const marker = text.match(/^⟦SM\d{4,}X⟧/);
      if (marker && /^(?:[ \t]*(?:[-+*]|\d+[.)])[ \t]+|#+|>+|\[[ xX]\]|\*\*|__|~~|\*|_)$/.test(tokens.get(marker[0])?.value || '')) { start += marker[0].length; continue; }
      const literal = text.match(/^(?:\d+[.)][ \t]*(?=\S)|[-+*][ \t]+|#{1,6}[ \t]+|>[ \t]*)/);
      if (literal) { start += literal[0].length; continue; }
      break;
    }
    while (end > start) {
      const text = source.slice(start, end), whitespace = text.match(/\s+$/);
      if (whitespace) { end -= whitespace[0].length; continue; }
      const marker = text.match(/⟦SM\d{4,}X⟧$/);
      if (marker && /^(?:\*\*|__|~~|\*|_)$/.test(tokens.get(marker[0])?.value || '')) { end -= marker[0].length; continue; }
      break;
    }
    const text = source.slice(start, end);
    if (!text || !prose(text, block.tokens)) return;
    let position = start;
    while (end - position > limit) {
      let boundary = -1, gap = 0;
      for (const match of source.slice(position, position + limit + 1).matchAll(/\s+/g)) if (match.index > 0) { boundary = match.index; gap = match[0].length; }
      if (boundary < 1) { ranges.push({ start: position, end, manualOnly: true, kind }); return; }
      ranges.push({ start: position, end: position + boundary, kind }); position += boundary + gap;
    }
    if (position < end && prose(source.slice(position, end), block.tokens)) ranges.push({ start: position, end, kind });
  }
  for (const [start, end] of lines) {
    const raw = readable(source.slice(start, end), block.tokens);
    if (/^\s*(?:(?:[-*_]\s*){3,}|\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?)\s*$/.test(raw)) continue;
    if (table) {
      let cell = start;
      for (let index = start; index < end; index++) {
        if (source[index] === '|' && source[index - 1] !== '\\') { add(cell, index, 'cell'); cell = index + 1; }
      }
      add(cell, end, 'cell');
    } else add(start, end);
  }
  return ranges;
}

export function prepareBlock(block, limit = block.unitLimit || 1200) {
  if (!Number.isInteger(limit) || limit < 100 || limit > 4000) throw new Error('O limite por parte deve ficar entre 100 e 4.000 caracteres.');
  const source = sourceOf(block);
  // A stored plan is tied to the immutable source and its original character limit.
  if (block.segmenterVersion === SEGMENTER_VERSION && Array.isArray(block.segments)) {
    let end = 0;
    for (const part of block.segments) {
      if (!Number.isInteger(part.start) || !Number.isInteger(part.end) || part.start < end || part.end <= part.start || part.end > source.length || source.slice(part.start, part.end) !== part.protectedSource) throw new Error('O plano salvo de tradução deste bloco é inválido.');
      end = part.end;
    }
    return block.segments;
  }
  block.segmenterVersion = SEGMENTER_VERSION; block.unitLimit = limit;
  block.segments = segmentRanges(block, limit).map((range, index) => {
    const protectedSource = source.slice(range.start, range.end), tokens = block.tokens.filter(token => protectedSource.includes(token.token));
    return { segmentId: `part_${index}`, start: range.start, end: range.end, kind: range.kind, source: readable(protectedSource, tokens), protectedSource, tokens,
      status: range.manualOnly ? 'error' : 'pending', manualOnly: Boolean(range.manualOnly), translatedText: '', error: range.manualOnly ? 'Esta parte não pode ser dividida com segurança. Edite a tradução do bloco manualmente.' : '' };
  });
  block.manualOnly = block.segments.length > 0 && block.segments.every(part => part.manualOnly);
  if (block.manualOnly) { block.status = 'error'; block.error = block.segments[0].error; block.translatedText = composeBlock(block, true); }
  return block.segments;
}

export function composeBlock(block, partial = false) {
  let text = sourceOf(block);
  for (const part of [...(block.segments || [])].reverse()) {
    if (!done(part) && !partial) throw new Error('O bloco ainda contém partes pendentes ou com erro.');
    const value = done(part) ? part.translatedText : part.protectedSource;
    text = text.slice(0, part.start) + value + text.slice(part.end);
  }
  return text;
}

export function blockProgress(block) {
  const parts = block.segments || [];
  return { total: parts.length, done: parts.filter(done).length, current: parts.findIndex(part => part.status === 'running'), failed: parts.filter(part => part.status === 'error') };
}

export function acceptManualBlock(block) {
  // Human editing is accepted as one block. Future regeneration requires an explicit new plan.
  delete block.segments; delete block.segmenterVersion; delete block.activeSegmentId;
  block.manuallyEdited = false; block.manualOnly = false;
}

export async function translateBlock(block, { generate, checkpoint = async () => {}, stopped = () => false, limit = block.unitLimit || 1200, onlySegmentId = null } = {}) {
  const parts = prepareBlock(block, limit);
  block.status = 'running'; block.error = ''; block.manuallyEdited = false;
  for (const part of parts) {
    if (onlySegmentId && part.segmentId !== onlySegmentId) continue;
    if (done(part) || part.manualOnly) continue;
    if (stopped()) break;
    part.status = 'running'; part.error = ''; block.activeSegmentId = part.segmentId;
    await checkpoint(block);
    let candidate;
    try {
      candidate = await generate(part);
      if (stopped()) { part.status = 'pending'; break; }
      part.translatedText = candidate.trim();
      if (/[\r\n]/.test(candidate)) throw new Error('O modelo adicionou quebras de linha dentro de uma parte. Repita somente esta parte ou corrija o bloco manualmente.');
      if (/^\s*(?:[-+*][ \t]+|\d+[.)][ \t]+|#{1,6}[ \t]+)/.test(candidate)) throw new Error('O modelo adicionou numeração ou um marcador que será inserido pelo aplicativo. Repita esta parte sem o marcador.');
      if (part.kind === 'cell' && /(^|[^\\])\|/.test(candidate)) throw new Error('O modelo adicionou um separador de coluna dentro da célula. Repita somente esta parte.');
      const checked = validateTranslation(part, candidate);
      if (!checked.ok) throw new Error(checked.error);
      part.status = 'translated'; part.error = '';
    } catch (error) {
      if (stopped() || error.name === 'AbortError') { part.status = 'pending'; break; }
      part.status = 'error'; part.error = error.message;
      block.status = 'error'; block.error = `Parte ${parts.indexOf(part) + 1} de ${parts.length}: ${error.message}`;
      block.translatedText = composeBlock(block, true); delete block.activeSegmentId;
      await checkpoint(block);
      return { complete: false, failed: part.segmentId };
    }
    block.translatedText = composeBlock(block, true);
    // Confirm this part before submitting the next one. Disk failures propagate with the result intact.
    await checkpoint(block);
  }
  delete block.activeSegmentId;
  block.translatedText = composeBlock(block, true);
  if (parts.every(done)) {
    const checked = validateTranslation(block, block.translatedText);
    if (!checked.ok) { block.status = 'error'; block.error = checked.error; }
    else { block.status = 'translated'; block.error = ''; }
  } else if (parts.some(part => part.status === 'error')) {
    block.status = 'error'; const failed = parts.find(part => part.status === 'error');
    block.error = `Parte ${parts.indexOf(failed) + 1} de ${parts.length}: ${failed.error}`;
  } else block.status = 'pending';
  await checkpoint(block);
  return { complete: block.status === 'translated', stopped: stopped() };
}
