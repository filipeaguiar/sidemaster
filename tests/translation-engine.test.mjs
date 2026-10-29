import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyGuide, createNode, effectivePlan, locateNode } from '../src/model.js';
import { editorialSnapshot, inventoryGuide, assembleGuide, validateTranslation } from '../src/translation-engine.js';

const accepted = units => units.map(unit => ({...unit, status:'translated', translatedText:unit.protectedSource || unit.source}));

test('translation assembles guide and node titles at their structural addresses, preserving paragraphs and independent IDs',()=>{
 const guide=emptyGuide(), node=createNode('custom','Apresentação');
 node.fields.markdown='Primeiro parágrafo.\n\nSegundo parágrafo.';
 guide.sections=[node];
 const snapshot=editorialSnapshot(guide), units=accepted(inventoryGuide(snapshot));
 units.find(u=>u.path.kind==='guide').translatedText='Test guide';
 units.find(u=>u.path.nodeId===node.id&&u.path.key==='title').translatedText='Introduction';
 const paragraphs=units.filter(u=>u.path.key==='markdown'); paragraphs[0].translatedText='First paragraph.'; paragraphs[1].translatedText='Second paragraph.';
 const copy=assembleGuide(snapshot,units,'en','translation_test');
 assert.equal(copy.title,'Test guide (en)'); assert.equal(copy.sections[0].title,'Introduction');
 assert.equal(copy.sections[0].fields.markdown,'First paragraph.\n\nSecond paragraph.');
 assert.notEqual(copy.guideId,guide.guideId); assert.notEqual(copy.sections[0].id,node.id);
 assert.equal(copy.archetypeId,guide.archetypeId); assert.equal(copy.contentLanguage,'en'); assert.deepEqual(copy.translations,[]);
 assert.equal(guide.sections[0].fields.markdown,node.fields.markdown); assert.equal(guide.sections[0].title,'Apresentação');
});

test('translation preserves protected references and explicit empty variant overrides',()=>{
 const guide=emptyGuide(), matchup=createNode('matchup','Confronto'), variant=createNode('variant','No draw');
 matchup.children[0].fields.strategy='Preserve [Myr Enforcer].'; variant.fields.overrides={strategy:''}; matchup.children[1].children=[variant]; guide.sections=[matchup];
 const units=accepted(inventoryGuide(editorialSnapshot(guide)));
 const strategy=units.find(u=>u.path.key==='strategy');
 assert.equal(validateTranslation(strategy,'Keep '+strategy.tokens[0].token+'.').text,'Keep [Myr Enforcer].');
 assert.equal(validateTranslation(strategy,'Keep another card.').ok,false);
 const copy=assembleGuide(editorialSnapshot(guide),units,'en');
 assert.equal(copy.sections[0].children[0].fields.strategy,'Preserve [Myr Enforcer].');
 assert.equal(effectivePlan(copy.sections[0],copy.sections[0].children[1].children[0]).strategy,'');
 assert.equal(locateNode(guide,variant.id).node.fields.overrides.strategy,'');
});

test('manual resolution of an unknown field remains a complete field, including paragraph breaks',()=>{
 const guide=emptyGuide(), node=createNode('custom','Custom'); node.fields.additional='Um.\n\nDois.';guide.sections=[node];
 const units=accepted(inventoryGuide(editorialSnapshot(guide)));
 const unknown=units.find(u=>u.path.kind==='unknown');unknown.translatedText='One.\n\nTwo.';
 const copy=assembleGuide(editorialSnapshot(guide),units,'en');
 assert.equal(copy.sections[0].fields.additional,'One.\n\nTwo.');
});

test('preambles and missing structural placeholders require correction before a unit is accepted',()=>{
 const unit={tokens:[],source:'Texto'};
 for(const output of ['Aqui está a tradução: Text','Claro! A tradução para inglês é: Text','Here is the translation: Text']) assert.equal(validateTranslation(unit,output).ok,false);
 assert.equal(validateTranslation(unit,'Text').ok,true);
});
