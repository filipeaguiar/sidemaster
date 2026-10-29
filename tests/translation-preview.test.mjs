import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyGuide, createNode } from '../src/model.js';
import { editorialSnapshot, inventoryGuide, assembleGuide } from '../src/translation-engine.js';
import { prepareBlock, translateBlock } from '../src/translation-segments.js';
import { renderProgressiveGuide } from '../src/translation-preview.js';
import { renderGuide } from '../src/reading.js';

function fixture(text = 'Primeiro parágrafo.\n\nSegundo parágrafo.') {
  const guide = emptyGuide(), node = createNode('custom', 'Apresentação');
  guide.title = 'Guia em português'; node.fields.markdown = text; guide.sections = [node];
  const snapshot = editorialSnapshot(guide), units = inventoryGuide(snapshot);
  return { snapshot, units, node, blocks: units.filter(unit => unit.path.key === 'markdown') };
}
const accept = (unit, text) => Object.assign(unit, { status: 'translated', translatedText: text });

test('the complete source is readable before starting; target prose is pending and both documents have distinct section IDs', () => {
  const f = fixture(), before = structuredClone(f.snapshot);
  const source = renderGuide(f.snapshot, { idPrefix: 'translation-source-' });
  const target = renderProgressiveGuide(f.snapshot, f.units, 'en');
  assert.match(source, /Primeiro parágrafo/); assert.match(source, /Segundo parágrafo/);
  assert.doesNotMatch(target, /Primeiro parágrafo|Segundo parágrafo|Guia em português|Apresentação|SMREAD/);
  assert.match(target, /Aguardando tradução/);
  assert.match(source, new RegExp(`id="translation-source-${f.node.id}"`));
  assert.match(target, new RegExp(`id="translation-target-${f.node.id}"`));
  assert.match(target, /lang="en" dir="ltr"/); assert.deepEqual(f.snapshot, before);
});

test('only accepted translations appear; invalid output, failed attempts and unconfirmed edits remain visibly pending', () => {
  const f = fixture('Preserve [Myr Enforcer].\n\nTexto ainda pendente.'), [first, second] = f.blocks;
  accept(first, first.protectedSource.replace('Preserve', 'Keep'));
  second.status = 'error'; second.translatedText = 'UNACCEPTED RESPONSE';
  let html = renderProgressiveGuide(f.snapshot, f.units, 'en');
  assert.match(html, /Keep/); assert.match(html, /Myr Enforcer/); assert.match(html, /Falha na tradução/);
  assert.doesNotMatch(html, /UNACCEPTED RESPONSE|Texto ainda pendente|⟦SM/);
  assert.throws(() => assembleGuide(f.snapshot, f.units, 'en'), /concluídas|pendente|tradução/);
  accept(first, 'INVALID MISSING CARD');
  html = renderProgressiveGuide(f.snapshot, f.units, 'en'); assert.doesNotMatch(html, /INVALID MISSING CARD/);
  second.status = 'pending'; second.manuallyEdited = true; second.translatedText = 'UNCONFIRMED EDIT';
  html = renderProgressiveGuide(f.snapshot, f.units, 'en');
  assert.match(html, /Edição aguardando confirmação/); assert.doesNotMatch(html, /UNCONFIRMED EDIT/);
});

test('a partially translated list shows accepted parts and structural references without leaking pending source prose', async () => {
  const f = fixture('1. Preserve [Myr Enforcer].\n2. Remova [Island].\n3. Espere.'), block = f.blocks[0];
  await translateBlock(block, { generate: async part => part.segmentId === 'part_0' ? part.protectedSource.replace('Preserve', 'Keep') : 'Broken response' });
  const before = structuredClone(block), html = renderProgressiveGuide(f.snapshot, f.units, 'en');
  assert.match(html, /Keep/); assert.match(html, /Myr Enforcer/); assert.match(html, /Parte 2 · Falha na tradução/);
  assert.match(html, /Parte 3 · Aguardando tradução/); assert.match(html, /data-state="partial"/);
  assert.doesNotMatch(html, /Remova|Espere|Broken response|⟦SM|SMREAD/); assert.deepEqual(block, before);
});

test('partial long titles expand pending parts safely and RTL documents retain Portuguese UI labels', () => {
  const f = fixture(); f.snapshot.title = 'Uma descrição longa do guia com palavras suficientes para várias partes. '.repeat(5).trim();
  f.units = inventoryGuide(f.snapshot, 100);
  const title = f.units.find(unit => unit.path.kind === 'guide');
  prepareBlock(title, 100); title.status = 'running';
  accept(title.segments[0], 'A translated introduction'); title.segments[1].status = 'running';
  const html = renderProgressiveGuide(f.snapshot, f.units, 'ar');
  assert.match(html, /lang="ar" dir="rtl"/); assert.match(html, /A translated introduction/); assert.match(html, /Traduzindo…/);
  assert.match(html, /lang="pt-BR" dir="ltr"/); assert.doesNotMatch(html, /SMREAD/);
});

test('legacy paragraph/chunk drafts project progressively without modifying their saved format', () => {
  const f = fixture(), before = structuredClone(f.snapshot);
  f.units.forEach(unit => { delete unit.rangeStart; delete unit.rangeEnd; });
  const first = f.blocks[0]; first.chunkCount = 2; first.chunkSeparator = ' ';
  accept(first, 'First');
  const chunk = { ...structuredClone(first), unitId: 'legacy-chunk', chunkIndex: 1, chunkSeparator: '', translatedText: 'paragraph.' };
  f.units.splice(f.units.indexOf(first) + 1, 0, chunk);
  const html = renderProgressiveGuide(f.snapshot, f.units, 'en');
  assert.match(html, /First/); assert.match(html, /paragraph\./); assert.doesNotMatch(html, /Primeiro|Segundo|SMREAD/);
  assert.deepEqual(f.snapshot, before);
});

test('inherited plans reuse progressive parent results while explicit empty overrides stay empty', () => {
  const guide = emptyGuide(), matchup = createNode('matchup', 'Confronto'), variant = createNode('variant', 'Variante');
  const plan = matchup.children[0]; plan.fields.strategy = 'Preserve recursos.';
  matchup.children[1].children.push(variant); guide.sections = [matchup];
  const snapshot = editorialSnapshot(guide), units = inventoryGuide(snapshot), strategy = units.find(unit => unit.path.key === 'strategy');
  accept(strategy, 'Keep resources.');
  let html = renderProgressiveGuide(snapshot, units, 'en');
  assert.equal((html.match(/Keep resources\./g) || []).length, 2); assert.doesNotMatch(html, /Preserve recursos/);
  snapshot.sections[0].children[1].children[0].fields.overrides.strategy = '';
  html = renderProgressiveGuide(snapshot, units, 'en');
  assert.equal((html.match(/Keep resources\./g) || []).length, 1);
});
