import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardGroup, deckComposition, renderDeckBoard } from '../src/deck-visual.js';

const cards = {
  'Myr Enforcer': { status:'found',identity:'myr',name:'Myr Enforcer',type:'Artifact Creature — Myr',manaValue:7,colors:[],image:'https://example.test/myr.jpg',art:'https://example.test/myr-art.jpg' },
  'Seat of the Synod': { status:'found',identity:'seat',name:'Seat of the Synod',type:'Artifact Land',manaValue:0,colors:['U'],image:'https://example.test/seat.jpg' },
  'Galvanic Blast': { status:'found',identity:'blast',name:'Galvanic Blast',type:'Instant',manaValue:1,colors:['R'],image:'https://example.test/blast.jpg' },
  'Island': { status:'found',identity:'island',name:'Island',type:'Basic Land — Island',manaValue:0,colors:['U'],image:'https://example.test/island.jpg' }
};
const lookup = name => cards[name];
test('artifact lands and creatures each appear in one primary type group',()=>{
  assert.equal(cardGroup(cards['Myr Enforcer']),'Criaturas');
  assert.equal(cardGroup(cards['Seat of the Synod']),'Terrenos');
  assert.equal(cardGroup(cards['Galvanic Blast']),'Mágicas Instantâneas');
  const composition=deckComposition('4 [Myr Enforcer]\n4 [Seat of the Synod]\n2 [Galvanic Blast]',lookup);
  assert.equal(composition.total,10);
  assert.equal(composition.groups.reduce((n,g)=>n+g.count,0),10);
  assert.equal(composition.curve[7],4);
  assert.equal(composition.curve[1],2);
  assert.equal(composition.curve.reduce((n,c)=>n+c,0),6);
  assert.deepEqual(composition.colors,['U','R']);
});
test('copies form stacks with exact quantity labels and a bounded number of visible sheets',()=>{
  const html=renderDeckBoard({zone:'main',archetypeName:'Grixis',versionLabel:'V1',list:'4 [Myr Enforcer]\n20 [Island]'},lookup);
  assert.equal((html.match(/class="deck-copy"/g)||[]).length,8);
  assert.ok(html.includes('24 cartas'));
  assert.ok(html.includes('20×'));
  assert.ok(html.includes('até quatro cópias visíveis'));
  assert.ok(html.includes('data-view-card="Myr Enforcer"'));
});
test('aliases of one stable identity merge into a single stack',()=>{
  const data=deckComposition('2 [Myr Enforcer]\n2 [Versão PT]',name=>name==='Versão PT'?cards['Myr Enforcer']:lookup(name));
  assert.equal(data.entries.length,1);
  assert.equal(data.total,4);
  assert.equal(data.groups[0].entries[0].quantity,4);
});
test('missing cards remain identifiable without counting as resolved mana or type data',()=>{
  const html=renderDeckBoard({zone:'sideboard',archetypeName:'Teste',list:'2 [Desconhecida]'},()=>({status:'notfound'}));
  assert.ok(html.includes('SIDEBOARD'));
  assert.ok(html.includes('Carta não encontrada'));
  assert.ok(html.includes('A identificar'));
  assert.ok(html.includes('2×'));
  assert.ok(!html.includes('data-view-card='));
  assert.equal(cardGroup({status:'error'}),'A identificar');
});
test('empty lists have an editable-list hint and names are escaped in the board',()=>{
  assert.ok(renderDeckBoard({zone:'main',list:''}).includes('Sua lista ganha forma aqui'));
  const html=renderDeckBoard({zone:'main',list:'1 [<script>]',archetypeName:'<unsafe>'});
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;unsafe&gt;'));
});
