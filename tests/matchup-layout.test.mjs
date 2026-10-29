import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyGuide,createNode } from '../src/model.js';
import { renderGuide } from '../src/reading.js';

function fixture() {
  const guide=emptyGuide(), matchup=createNode('matchup','UB Faeries');
  guide.sections.find(n=>n.type==='matchups').children.push(matchup);
  const plan=matchup.children.find(n=>n.type==='plan');
  plan.fields={...plan.fields,rating:'Favorável',strategy:'Plano do confronto.',in:'2 [Hydroblast]',out:'2 [Galvanic Blast]',interactions:'   \n',adjustments:''};
  return {guide,matchup,plan};
}
test('matchup heading contains its rating and transfers have distinct cards and directions',()=>{
  const {guide}=fixture(); const html=renderGuide(guide);
  assert.match(html,/<div class="matchup-heading"><h3>UB Faeries<\/h3><span class="matchup-rating" data-tone="favorable"/);
  assert.ok(html.includes('sideboard-transfer--in'));
  assert.ok(html.includes('sideboard-transfer--out'));
  assert.ok(html.includes('>↗</span>'));
  assert.ok(html.includes('>↘</span>'));
  assert.equal((html.match(/class="transfer-count">2 cartas/g)||[]).length,2);
  assert.ok(!html.includes('class="plan-rating"'));
});
test('empty and whitespace-only optional fields are omitted but filled content is retained',()=>{
  const {guide,plan}=fixture();
  let html=renderGuide(guide);
  assert.ok(!html.includes('Interações e cuidados'));
  assert.ok(!html.includes('Ajustes sugeridos'));
  plan.fields.interactions='Cuidado com [Spellstutter Sprite].';
  plan.fields.adjustments='Ajuste para o metagame.';
  html=renderGuide(guide);
  assert.ok(html.includes('Interações e cuidados'));
  assert.ok(html.includes('Ajustes sugeridos'));
  assert.ok(html.includes('Ajuste para o metagame.'));
});
test('variants use effective fields, may explicitly hide optional text and have their own rating badge',()=>{
  const {guide,matchup,plan}=fixture();
  plan.fields.interactions='Texto herdado.';
  const variant=createNode('variant','Draw');
  variant.fields.overrides={interactions:'',rating:'Desfavorável'};
  matchup.children.find(n=>n.type==='variants').children.push(variant);
  const html=renderGuide(guide);
  const variantHtml=html.slice(html.indexOf(`id="preview-${variant.id}"`));
  assert.match(variantHtml,/<h5>Draw<\/h5><span class="matchup-rating" data-tone="unfavorable"/);
  assert.ok(!variantHtml.includes('Texto herdado.'));
  assert.ok(variantHtml.includes('Hydroblast'));
});
