import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCHEMA_VERSION, normalizeGuide, emptyGuide, createNode, cloneNode, walkNodes, moveNode, removeNode, locateNode, effectivePlan, envelope, canContain } from '../src/model.js';
import { renderGuide } from '../src/reading.js';
import { validateGuide } from '../src/validation.js';

function legacyGuide() {
  return { schemaVersion: 1, guideId: 'legacy-guide', title: 'Guia legado', sections: [{id:'deck', type:'deck', title:'Sobre o deck', fields:{markdown:'Texto original **preservado**'}}, {id:'matchups', type:'matchups', title:'Matchups', fields:{markdown:'Introdução'}}], deck:{main:'4 [Myr Enforcer]\n56 [Island]', sideboard:'2 [Hydroblast]'}, matchups:[{matchupId:'ub',archetype:'UB Faeries',general:{strategy:'Plano original',in:'2 [Hydroblast]',out:'2 [Myr Enforcer]',rating:'Favorável'},variants:[{variantId:'v',name:'Draw',overrides:{strategy:''}}],hands:[{handId:'h',label:'Exemplo',cards:'2 [Myr Enforcer]\n5 [Island]',turn:'Draw',phase:'Pré-side',decision:'Manter',justification:'Justificativa original'}]}] };
}
test('v1 migration preserves content, ids, explicit empty overrides and JSON round trip', () => {
  const original = legacyGuide(), guide = normalizeGuide(original);
  assert.equal(original.schemaVersion, 1);
  assert.equal(guide.schemaVersion, SCHEMA_VERSION);
  assert.equal(locateNode(guide,'deck').node.fields.markdown, 'Texto original **preservado**');
  assert.equal(locateNode(guide,'h').node.fields.justification, 'Justificativa original');
  assert.equal(effectivePlan(locateNode(guide,'ub').node,locateNode(guide,'v').node).strategy, '');
  assert.deepEqual(normalizeGuide(JSON.parse(JSON.stringify(envelope([guide]))).guides[0]), guide);
  assert.equal(guide.matchups, undefined);
});
test('moving a subtree preserves descendants and rejects cycles or incompatible parents', () => {
  const guide = emptyGuide(), about = guide.sections.find(s => s.type === 'deck');
  const a = createNode('custom','A'), b = createNode('custom','B');
  about.children.push(a); a.children.push(b);
  assert.throws(() => moveNode(guide, a.id, b.id), /próprio item/);
  const group = about.children.find(n=>n.type==='hands');
  assert.throws(() => moveNode(guide, a.id, group.id), /incompatível/);
  moveNode(guide, a.id, guide.sections[0].id);
  assert.equal(locateNode(guide,b.id).parent.id,a.id);
  assert.equal(locateNode(guide,a.id).parent.id,guide.sections[0].id);
});
test('duplication assigns every descendant a new id and does not share fields', () => {
  const original = createNode('matchup','UB Faeries');
  const copy = cloneNode(original);
  const ids = new Set(walkNodes([original]).map(({node})=>node.id));
  assert.ok(walkNodes([copy]).every(({node})=>!ids.has(node.id)));
  copy.children[0].fields.strategy = 'Alteração';
  assert.equal(original.children[0].fields.strategy,'');
});
test('general and matchup hands validate independently and export all structured content', () => {
  const guide = normalizeGuide(legacyGuide());
  const group = createNode('hands','Mãos gerais'), hand = createNode('hand','Geral');
  hand.fields.cards = '7 [Island]'; group.children.push(hand); guide.sections[0].children.push(group);
  assert.ok(!validateGuide(guide).problems.some(p=>p.includes('7/7')));
  hand.fields.cards = '6 [Island]';
  assert.ok(validateGuide(guide).issues.some(i=>i.nodeId===hand.id && i.message.includes('6/7')));
  const html = renderGuide(guide);
  assert.ok(html.includes('<h2>Sobre o deck</h2>'));
  assert.ok(html.includes('<h3>Mãos gerais</h3>'));
  assert.ok(html.includes('<h4>Geral</h4>'));
  assert.ok(html.includes('Plano original'));
  assert.ok(html.includes('Justificativa original'));
  assert.equal((html.match(/class="card-slot"/g)||[]).length,13);
  assert.equal(canContain(null,createNode('hand')),false);
});
test('malformed or future documents cannot silently overwrite the supported schema',()=>{
  assert.throws(()=>normalizeGuide({...legacyGuide(),schemaVersion:99}),/não suportada/);
  const guide = legacyGuide(); guide.sections.push(guide.sections[0]);
  assert.throws(()=>normalizeGuide(guide),/duplicados/);
});
test('deletion can preserve compatible descendants and rejects orphaned typed children',()=>{
  const guide = emptyGuide(), about=guide.sections.find(n=>n.type==='deck');
  const text=createNode('custom','Texto'), nested=createNode('custom','Subseção'); text.children.push(nested); about.children.push(text);
  const snapshot=structuredClone(guide);
  removeNode(guide,text.id,true);
  assert.equal(locateNode(guide,nested.id).parent.id,about.id);
  assert.equal(locateNode(guide,text.id),null);
  assert.equal(locateNode(snapshot,text.id).node.children[0].id,nested.id);
  const hands=about.children.find(n=>n.type==='hands'); hands.children.push(createNode('hand'));
  assert.throws(()=>removeNode(guide,hands.id,true),/compatível/);
  removeNode(guide,hands.id); assert.equal(locateNode(guide,hands.id),null);
  const matchup=createNode('matchup'); guide.sections.find(n=>n.type==='matchups').children.push(matchup);
  assert.throws(()=>removeNode(guide,matchup.children[0].id),/não pode/);
});
test('local repository retains the original v1 payload before writing the current schema',async()=>{
  const values = new Map([['sidemaster.guides.v1',JSON.stringify([legacyGuide()])]]);
  globalThis.localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
  const { repository } = await import('../src/storage.js');
  const guides = await repository.list();
  assert.equal(JSON.parse(values.get(`sidemaster.guides.v1.backup-before-schema-${SCHEMA_VERSION}`))[0].schemaVersion,1);
  await repository.replace(guides);
  assert.equal(JSON.parse(values.get('sidemaster.guides.v1'))[0].schemaVersion, SCHEMA_VERSION);
  assert.equal(JSON.parse(values.get(`sidemaster.guides.v1.backup-before-schema-${SCHEMA_VERSION}`))[0].schemaVersion,1);
});
