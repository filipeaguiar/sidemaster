import { renderGuide } from './reading.js';
import { renderMarkdown, escapeHtml as esc } from './markdown.js';
import { validateTranslation, legacyParagraphParts } from './translation-engine.js';

// This projection is read-only and never replaces persisted results or final export validation.
export function renderProgressiveGuide(snapshot, units, language, { idPrefix = 'translation-target-' } = {}) {
  const guide = structuredClone(snapshot), nodes = new Map(), fields = new Map(), slots = [];
  const prefix = `\uE000SMREAD${crypto.randomUUID().replaceAll('-', '')}`;
  const token = index => `${prefix}X${index}X\uE001`;
  const marker = new RegExp(`${prefix}X(\\d+)X\uE001`, 'g');
  const walk = list => (list || []).forEach(node => { nodes.set(node.id, node); walk(node.children); });
  walk(guide.sections); guide.contentLanguage = language;
  const done = part => ['translated', 'reviewed'].includes(part.status) && validateTranslation(part, part.translatedText).ok;
  const slot = value => { slots.push(value); return token(slots.length - 1); };
  const pending = (unit, state, kind, index = null) => slot({ type: 'pending', unitId: unit.unitId, state, kind, index });
  const restore = (text, tokens) => tokens.reduce((value, item) => value.replaceAll(item.token, item.value), text);

  function blockValue(unit, inline = false) {
    let value, state = unit.status;
    if (done(unit)) value = validateTranslation(unit, unit.translatedText).text;
    else if (unit.manuallyEdited) return pending(unit, 'manual', inline ? 'title' : 'block');
    else if (unit.segmenterVersion === 1 && unit.segments?.length) {
      if (!unit.segments.some(done)) return pending(unit, unit.status, inline ? 'title' : 'block');
      value = unit.protectedSource;
      for (const [index, part] of unit.segments.map((part, index) => [index, part]).reverse()) {
        const text = done(part) ? part.translatedText : pending(unit, part.status, 'part', index + 1);
        value = value.slice(0, part.start) + text + value.slice(part.end);
      }
      value = restore(value, unit.tokens || []);
      state = unit.segments.some(done) ? 'partial' : unit.status;
    } else return pending(unit, unit.status, inline ? 'title' : 'block');
    return slot({ type: inline ? 'title' : 'block', unitId: unit.unitId, state, value });
  }

  for (const unit of units) {
    const key = JSON.stringify(unit.path);
    if (!fields.has(key)) fields.set(key, []);
    fields.get(key).push(unit);
  }
  for (const entries of fields.values()) {
    const address = entries[0].path, title = address.key === 'title';
    const field = address.kind === 'guide' ? guide : title && address.kind === 'node' ? nodes.get(address.nodeId) : nodes.get(address.nodeId)?.fields;
    if (!field) continue;
    const original = address.subkey ? field[address.key]?.[address.subkey] : field[address.key];
    if (typeof original !== 'string') continue;
    let value = original;
    if (address.kind === 'unknown') value = blockValue(entries[0], title);
    else if (entries.every(unit => Number.isInteger(unit.rangeStart) && Number.isInteger(unit.rangeEnd))) {
      for (const unit of entries.slice().sort((a, b) => b.rangeStart - a.rangeStart)) {
        const replacement = original.slice(unit.rangeStart, unit.rangeEnd) === unit.source ? blockValue(unit, title) : pending(unit, 'error', title ? 'title' : 'block');
        value = value.slice(0, unit.rangeStart) + replacement + value.slice(unit.rangeEnd);
      }
    } else {
      const paragraphs = legacyParagraphParts(original), groups = new Map();
      for (const unit of entries) {
        if (!groups.has(unit.paragraphIndex)) groups.set(unit.paragraphIndex, []);
        groups.get(unit.paragraphIndex).push(unit);
      }
      for (const [index, group] of groups) if (paragraphs[index]) {
        paragraphs[index].text = group.sort((a, b) => a.chunkIndex - b.chunkIndex).map(unit => blockValue(unit, title) + (unit.chunkSeparator || '')).join('');
      }
      value = paragraphs.map(part => (part.prefix || '') + part.text + part.separator).join('');
    }
    if (address.subkey) field[address.key][address.subkey] = value; else field[address.key] = value;
  }

  function expand(text) {
    // Unwrap Markdown paragraphs containing only a block slot before inserting its rendered body.
    const paragraph = new RegExp(`<p>(${prefix}X\\d+X\uE001(?:\\s*${prefix}X\\d+X\uE001)*)</p>`, 'g');
    return text.replace(paragraph, (_whole, contents) => contents).replace(marker, (_whole, index) => {
      const item = slots[Number(index)]; if (!item) return '';
      if (item.type === 'pending') {
        const label = item.state === 'error' ? 'Falha na tradução' : item.state === 'running' ? 'Traduzindo…' : item.state === 'manual' ? 'Edição aguardando confirmação' : item.kind === 'title' ? 'Título aguardando tradução' : 'Aguardando tradução';
        return `<span class="translation-document-placeholder" lang="pt-BR" dir="ltr" data-state="${esc(item.state)}" data-kind="${item.kind}"><button type="button" data-review-unit="${esc(item.unitId)}" aria-label="Revisar ${item.index ? `parte ${item.index}` : 'trecho'}: ${esc(label)}">${item.index ? `Parte ${item.index} · ` : ''}${label}</button></span>`;
      }
      const action = `<button type="button" class="translation-document-edit" data-review-unit="${esc(item.unitId)}" aria-label="Revisar este trecho" title="Revisar este trecho">✎</button>`;
      if (item.type === 'title') return `<span class="translation-document-title" data-state="${esc(item.state)}">${expand(esc(item.value))}${action}</span>`;
      const body = expand(renderMarkdown(item.value));
      return `<div class="translation-document-block" data-preview-unit="${esc(item.unitId)}" data-state="${esc(item.state)}">${action}${body}</div>`;
    });
  }
  return expand(renderGuide(guide, { idPrefix }));
}
