import { SCHEMA_VERSION } from './model.js';

const TEXT_PLAN_FIELDS = ['strategy', 'justification', 'interactions', 'adjustments', 'assessment'];
const PROTECTED_PLAN_FIELDS = ['in', 'out'];
const protectedPattern = /(```[\s\S]*?```|`[^`\n]*`|^\s*\d+\s+\[[^\]\n]+\](?:\s+\d+)?\s*$|!\[[^\]\n]+\]|\[(?=[^\]\n]+\]\(https?:\/\/)|\]\(https?:\/\/[^)]+\)|\[[^\]\n]+\](?!\()|https?:\/\/[^\s)]+|\*\*|__|~~|\*|_|(?<!\\)[#>]+(?=\s)|^\s*(?:[-+*]|\d+[.)])\s|\n)/gm;
const hashText = text => {
  let hash = 2166136261;
  for (const char of text) { hash ^= char.codePointAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(16).padStart(8, '0');
};
const paragraphParts = text => {
  const out = []; let cursor = 0, leading = '';
  const re = /\n[\t ]*\n+/g; let match;
  while ((match = re.exec(text))) {
    if (match.index > cursor) {
      out.push({ text: text.slice(cursor, match.index), separator: match[0], prefix: out.length === 0 ? leading : '' });
      leading = '';
    }
    else if (out.length) out.at(-1).separator += match[0];
    else leading += match[0];
    cursor = re.lastIndex;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), separator: '', prefix: leading });
  return out;
};

export function editorialSnapshot(guide) {
  const copy = structuredClone(guide);
  delete copy.translations; delete copy.updatedAt; delete copy.legalityCheck; delete copy.schemaVersion;
  copy.contentLanguage ||= 'pt-BR';
  return copy;
}

export function snapshotHash(snapshot) { const copy = { ...snapshot }; delete copy.schemaVersion; return hashText(JSON.stringify(copy)); }

function fencedRanges(text) {
  const ranges = []; let opening = null;
  for (const match of text.matchAll(/[^\n]*(?:\n|$)/g)) {
    const line = match[0].replace(/\r?\n$/, '');
    const fence = line.match(/^[ \t]{0,3}(`{3,}|~{3,})(.*)$/);
    if (!fence) continue;
    if (!opening) opening = { start: match.index, marker: fence[1][0], length: fence[1].length };
    else if (fence[1][0] === opening.marker && fence[1].length >= opening.length && !fence[2].trim()) { ranges.push({ start: opening.start, end: match.index + line.length }); opening = null; }
  }
  if (opening) ranges.push({ start: opening.start, end: text.length });
  return ranges;
}

function blockRanges(text) {
  const fences = fencedRanges(text), ranges = []; let cursor = 0;
  for (const match of text.matchAll(/\r?\n[\t ]*\r?\n(?:[\t ]*\r?\n)*/g)) {
    if (fences.some(range => match.index < range.end && match.index + match[0].length > range.start)) continue;
    if (text.slice(cursor, match.index).trim()) ranges.push({ start: cursor, end: match.index });
    cursor = match.index + match[0].length;
  }
  if (text.slice(cursor).trim()) ranges.push({ start: cursor, end: text.length });
  // Blank lines between list items belong to the same visible list block.
  const merged = [];
  for (const range of ranges) {
    const previous = merged.at(-1);
    if (previous && /^(?:[ \t]*)(?:[-+*][ \t]+|\d+[.)][ \t]*)(?=\S)/m.test(text.slice(previous.start, previous.end))
      && /^[ \t]*(?:[-+*][ \t]+|\d+[.)][ \t]*)(?=\S)/.test(text.slice(range.start, range.end))) previous.end = range.end;
    else merged.push({ ...range });
  }
  return merged;
}

export function protectText(text) {
  const tokens = [];
  const add = value => { const token = `⟦SM${String(tokens.length).padStart(4, '0')}X⟧`; tokens.push({ token, value }); return token; };
  let protectedText = '', cursor = 0;
  for (const range of fencedRanges(text)) {
    protectedText += text.slice(cursor, range.start).replace(protectedPattern, add) + add(text.slice(range.start, range.end));
    cursor = range.end;
  }
  protectedText += text.slice(cursor).replace(protectedPattern, add);
  return { protectedText, tokens, sourceHash: hashText(text) };
}

export function restoreProtected(text, tokens) {
  let result = text;
  const expected = tokens.map(item => item.token);
  const found = result.match(/⟦SM\d{4,}X⟧/g) || [];
  if (found.length !== expected.length || found.join('|') !== expected.join('|')) {
    return { ok: false, error: 'A tradução alterou referências ou formatação protegida.', text: result };
  }
  for (const item of tokens) result = result.replace(item.token, item.value);
  return { ok: true, text: result };
}

function addTextUnits(units, path, text, limit) {
  if (typeof text !== 'string' || !text.trim()) return;
  blockRanges(text).forEach((range, paragraphIndex) => {
    const source = text.slice(range.start, range.end), value = protectText(source);
    const needsTranslation = /[\p{L}\p{N}]/u.test(value.protectedText.replace(/⟦SM\d{4,}X⟧/g, ''));
    units.push({ unitId: crypto.randomUUID(), path: structuredClone(path), paragraphIndex, chunkIndex: 0, chunkCount: 1,
      rangeStart: range.start, rangeEnd: range.end, source, protectedSource: value.protectedText, tokens: value.tokens,
      sourceHash: hashText(source), unitLimit: limit, separator: '', chunkSeparator: '', manualOnly: false,
      status: needsTranslation ? 'pending' : 'translated', error: '', translatedText: needsTranslation ? '' : value.protectedText,
      reviewed: false, history: [] });
  });
}

export function inventoryGuide(snapshot, limit = 1200) {
  if (!Number.isSafeInteger(limit) || limit < 100 || limit > 4000) throw new Error('Limite por unidade deve ficar entre 100 e 4.000 caracteres');
  const units = [];
  addTextUnits(units, { kind: 'guide', key: 'title' }, snapshot.title, limit);
  function walk(nodes) {
    for (const node of nodes || []) {
      const knownFields = node.type === 'hand' ? ['cards', 'turn', 'phase', 'decision', 'justification']
        : node.type === 'plan' ? ['strategy', 'in', 'out', 'interactions', 'adjustments', 'justification', 'assessment', 'rating']
          : node.type === 'variant' ? ['overrides'] : [];
      addTextUnits(units, { kind: 'node', nodeId: node.id, key: 'title' }, node.title, limit);
      if (typeof node.fields?.markdown === 'string') addTextUnits(units, { kind: 'node', nodeId: node.id, key: 'markdown' }, node.fields.markdown, limit);
      if (node.type === 'plan') {
        for (const key of TEXT_PLAN_FIELDS) addTextUnits(units, { kind: 'node', nodeId: node.id, key }, node.fields?.[key], limit);
        for (const key of PROTECTED_PLAN_FIELDS) {
          const value = node.fields?.[key];
          if (typeof value === 'string' && value.trim()) addTextUnits(units, { kind: 'node', nodeId: node.id, key }, value, limit);
        }
      }
      if (node.type === 'variant' && node.fields?.overrides) {
        for (const [key, value] of Object.entries(node.fields.overrides)) {
          if (TEXT_PLAN_FIELDS.includes(key) && typeof value === 'string') addTextUnits(units, { kind: 'node', nodeId: node.id, key: 'overrides', subkey: key }, value, limit);
        }
      }
      if (node.type === 'hand') addTextUnits(units, { kind: 'node', nodeId: node.id, key: 'justification' }, node.fields?.justification, limit);
      for (const key of Object.keys(node.fields || {})) {
        if (key !== 'markdown' && !knownFields.includes(key) && typeof node.fields[key] === 'string' && node.fields[key].trim()) {
          units.push({ unitId: crypto.randomUUID(), path: { kind: 'unknown', nodeId: node.id, key }, source: node.fields[key], sourceHash: hashText(node.fields[key]), status: 'error', error: 'Campo de texto ainda sem regra de tradução.', translatedText: '', reviewed: false, tokens: [], history: [] });
        }
      }
      walk(node.children);
    }
  }
  walk(snapshot.sections);
  return units;
}


function unitAddress(path) { return JSON.stringify(path); }

function priorVersion(entry, model, savedAt) {
  return {
    source: entry.source,
    sourceHash: entry.sourceHash,
    tokens: structuredClone(entry.tokens || []),
    translatedText: entry.translatedText || '',
    status: entry.status,
    reviewed: Boolean(entry.reviewed),
    model: model || '',
    savedAt
  };
}

export function reconcileTranslation(item, guide, limit = item?.unitLimit || 1200) {
  const snapshot = editorialSnapshot(guide);
  const sourceHash = snapshotHash(snapshot);
  if (item.sourceHash === sourceHash) return false;

  const previousSourceHash = item.sourceHash;
  const oldUnits = item.units || [];
  const remaining = new Set(oldUnits);
  const exact = new Map();
  for (const old of oldUnits) {
    const key = JSON.stringify([unitAddress(old.path), old.source]);
    if (!exact.has(key)) exact.set(key, []);
    exact.get(key).push(old);
  }
  const nextUnits = inventoryGuide(snapshot, limit);
  const unmatchedNext = [];
  for (const fresh of nextUnits) {
    const bucket = exact.get(JSON.stringify([unitAddress(fresh.path), fresh.source]));
    const previous = bucket?.find(entry => remaining.has(entry));
    if (!previous) { unmatchedNext.push(fresh); continue; }
    remaining.delete(previous);
    Object.assign(fresh, previous, {
      path: fresh.path,
      paragraphIndex: fresh.paragraphIndex,
      chunkIndex: fresh.chunkIndex,
      chunkCount: fresh.chunkCount,
      rangeStart: fresh.rangeStart,
      rangeEnd: fresh.rangeEnd,
      source: fresh.source,
      sourceHash: fresh.sourceHash,
      protectedSource: fresh.protectedSource,
      tokens: fresh.tokens,
      unitLimit: fresh.unitLimit
    });
    if (fresh.segments?.length && fresh.protectedSource !== previous.protectedSource) {
      delete fresh.segments;
      delete fresh.segmenterVersion;
    }
  }

  const changedAt = new Date().toISOString();
  for (const fresh of unmatchedNext) {
    const address = unitAddress(fresh.path);
    const candidates = [...remaining].filter(old => unitAddress(old.path) === address);
    const newAtAddress = unmatchedNext.filter(entry => unitAddress(entry.path) === address);
    if (candidates.length !== 1 || newAtAddress.length !== 1) continue;
    candidates.sort((a, b) => Math.abs((a.paragraphIndex || 0) - (fresh.paragraphIndex || 0)) - Math.abs((b.paragraphIndex || 0) - (fresh.paragraphIndex || 0)));
    const previous = candidates[0];
    if (!previous) continue;
    remaining.delete(previous);
    const history = [...(previous.history || [])];
    if (previous.translatedText || ['translated', 'reviewed'].includes(previous.status)) history.push(priorVersion(previous, item.model, changedAt));
    fresh.history = history.slice(-20);
    fresh.sourceChanged = true;
  }

  item.removedUnits ||= [];
  for (const removed of remaining) item.removedUnits.push({ removedAt: changedAt, unit: structuredClone(removed) });
  item.sourceSnapshot = snapshot;
  item.sourceHash = sourceHash;
  item.units = nextUnits;
  item.updatedAt = changedAt;
  if (item.generatedGuideId) {
    item.generatedGuideHistory ||= [];
    item.generatedGuideHistory.push({ guideId: item.generatedGuideId, sourceHash: previousSourceHash, savedAt: changedAt });
    delete item.generatedGuideId;
  }
  item.reconciliationUncommitted = true;
  if (nextUnits.every(entry => ['translated', 'reviewed'].includes(entry.status)) && nextUnits.length) item.status = 'complete';
  else if (nextUnits.some(entry => entry.status === 'error')) item.status = 'error';
  else item.status = 'paused';
  return true;
}

export function validateTranslation(unit, candidate) {
  if (typeof candidate !== 'string' || !candidate.trim()) return { ok: false, error: 'A tradução está vazia.' };
  const preamble = /^(?:(?:claro|com certeza|segue abaixo|sure|of course)[,!\s.:-]*)?(?:aqui (?:está|vai) a tradução(?: para [^\n:.]+)?|segue a tradução(?: para [^\n:.]+)?|a tradução(?: para [^\n:.]+)?(?: é| segue)?|here(?:'s| is) the translation(?: into [^\n:.]+)?|the translation(?: into [^\n:.]+)?(?: is)?|translation)\s*(?:[:：–—-]|[.!?]\s*)\s*/i;
  if (preamble.test(candidate.trim())) return { ok: false, error: 'O modelo acrescentou um preâmbulo. Remova a introdução ou tente novamente; aceite somente o texto traduzido.' };
  if (unit.chunkCount > 1 && candidate.length > unit.source.length * 5 + 300) return { ok: false, error: 'A resposta parece truncada ou excede o tamanho esperado.' };
  return restoreProtected(candidate, unit.tokens || []);
}

export function assembleGuide(snapshot, units, targetLanguage, translationId = '') {
  const guide = structuredClone(snapshot); const grouped = new Map(), ranged = new Map();
  for (const unit of units) {
    const checked = validateTranslation(unit, unit.translatedText);
    if (!checked.ok) throw new Error(checked.error);
    if (Number.isInteger(unit.rangeStart) && Number.isInteger(unit.rangeEnd)) {
      const address = JSON.stringify(unit.path);
      if (!ranged.has(address)) ranged.set(address, []);
      ranged.get(address).push({ ...unit, text: checked.text }); continue;
    }
    const key = `${unit.path.kind}:${unit.path.nodeId || ''}:${unit.path.key}:${unit.path.subkey || ''}:${unit.paragraphIndex}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push({ ...unit, text: checked.text });
  }
  const nodes = new Map();
  const walk = list => (list || []).forEach(node => { nodes.set(node.id, node); walk(node.children); });
  walk(guide.sections);
  for (const entries of grouped.values()) {
    entries.sort((a, b) => a.chunkIndex - b.chunkIndex);
    const first = entries[0], path = first.path;
    const field = path.kind === 'guide' ? guide : path.kind === 'node' && path.key === 'title' ? nodes.get(path.nodeId) : nodes.get(path.nodeId)?.fields;
    if (!field) throw new Error('O campo de origem da tradução não existe mais.');
    const key = path.key;
    if (path.kind === 'unknown') { field[key] = first.text; continue; }
    const original = path.kind === 'guide' ? guide[key] : (path.subkey ? field[key]?.[path.subkey] : field[key]);
    const parts = paragraphParts(typeof original === 'string' ? original : '');
    const chunks = entries.map(entry => entry.text + (entry.chunkSeparator || '')).join('');
    const paragraph = parts[first.paragraphIndex];
    if (!paragraph) throw new Error('A unidade não corresponde ao parágrafo de origem.');
    parts[first.paragraphIndex] = { ...paragraph, text: chunks };
    const value = parts.map(part => (part.prefix || '') + part.text + part.separator).join('');
    if (path.kind === 'guide') guide[key] = value;
    else if (path.subkey) field[key][path.subkey] = value;
    else field[key] = value;
  }
  for (const entries of ranged.values()) {
    const path = entries[0].path;
    const field = path.kind === 'guide' ? guide : path.kind === 'node' && path.key === 'title' ? nodes.get(path.nodeId) : nodes.get(path.nodeId)?.fields;
    if (!field) throw new Error('O campo de origem da tradução não existe mais.');
    let value = path.subkey ? field[path.key]?.[path.subkey] : field[path.key];
    if (typeof value !== 'string') throw new Error('O texto de origem do bloco é inválido.');
    let boundary = value.length;
    for (const entry of entries.sort((a, b) => b.rangeStart - a.rangeStart)) {
      if (entry.rangeStart < 0 || entry.rangeEnd > boundary || value.slice(entry.rangeStart, entry.rangeEnd) !== entry.source) throw new Error('O intervalo do bloco não corresponde ao texto de origem.');
      value = value.slice(0, entry.rangeStart) + entry.text + value.slice(entry.rangeEnd); boundary = entry.rangeStart;
    }
    if (path.subkey) field[path.key][path.subkey] = value; else field[path.key] = value;
  }
  guide.schemaVersion = SCHEMA_VERSION; guide.contentLanguage = targetLanguage; guide.translations = [];
  guide.provenance ||= {};
  guide.provenance = { sourceGuideId: snapshot.guideId, sourceLanguage: snapshot.contentLanguage || 'pt-BR', translationId, sourceHash: snapshotHash(snapshot) };
  function renew(list) { for (const node of list || []) { node.id = `section_${crypto.randomUUID()}`; renew(node.children); } }
  renew(guide.sections); guide.guideId = `guide_${crypto.randomUUID()}`;
  guide.versionLabel = `${snapshot.versionLabel || 'V1'} · ${targetLanguage}`;
  guide.title = `${guide.title} (${targetLanguage})`;
  guide.createdAt = new Date().toISOString(); guide.updatedAt = null;
  return guide;
}

export { SCHEMA_VERSION, paragraphParts as legacyParagraphParts };
