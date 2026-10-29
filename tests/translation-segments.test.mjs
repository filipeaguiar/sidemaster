import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { emptyGuide, createNode, normalizeGuide, SCHEMA_VERSION } from '../src/model.js';
import { editorialSnapshot, inventoryGuide, assembleGuide, protectText, restoreProtected, snapshotHash } from '../src/translation-engine.js';
import { prepareBlock, translateBlock, composeBlock, acceptManualBlock } from '../src/translation-segments.js';
const {createGuideStore}=createRequire(import.meta.url)('../electron/guide-store.cjs');
const list='1. Posso me dar ao luxo de "perder" um turno de desenvolvimento?\n2. Consigo executar meu plano de jogo se comprar apenas mais um terreno?\n3.Tenho recursos imediatos para "cavar" o deck em busca de mais cartas?';
const translations=['Can I afford to "lose" a turn of development?','Can I execute my game plan if I draw just one more land?','Do I have resources to dig through my deck for more cards?'];
function fixture(text=list, limit=1200){const guide=emptyGuide(),node=createNode('custom','Mãos iniciais');node.fields.markdown=text;guide.sections=[node];const snapshot=editorialSnapshot(guide),units=inventoryGuide(snapshot,limit);return {guide,node,snapshot,units,block:units.find(u=>u.path.key==='markdown')};}
function record(f){return {translationId:'translation_test',sourceGuideId:f.guide.guideId,sourceLanguage:'pt-BR',targetLanguage:'en',status:'paused',sourceSnapshot:f.snapshot,sourceHash:snapshotHash(f.snapshot),units:f.units};}

test('reported three-item list stays one block; numbering and line breaks never reach the model',async()=>{
 const f=fixture(),sent=[];assert.equal(f.units.filter(u=>u.path.key==='markdown').length,1);
 const result=await translateBlock(f.block,{generate:async part=>{sent.push(part.protectedSource);return translations[sent.length-1];}});
 assert.equal(result.complete,true);assert.equal(sent.length,3);for(const prompt of sent){assert.doesNotMatch(prompt,/⟦SM|^\d+[.)]|\n/);}
 assert.equal(restoreProtected(f.block.translatedText,f.block.tokens).text,`1. ${translations[0]}\n2. ${translations[1]}\n3.${translations[2]}`);
 assert.equal(f.block.source,list);
});

test('a failed part and a JSON reload retain confirmed parts; retrying one part never regenerates its siblings',async()=>{
 const f=fixture('1. Preserve [Myr Enforcer].\n2. Remova [Island].\n3. Espere.'),checkpoints=[];let calls=0;
 await translateBlock(f.block,{generate:async part=>{calls++;return calls===2?'Remove another card.':part.protectedSource.replace('Preserve','Keep');},checkpoint:async block=>checkpoints.push(JSON.stringify(block))});
 assert.equal(f.block.status,'error');assert.deepEqual(f.block.segments.map(p=>p.status),['translated','error','pending']);
 const guide=normalizeGuide({...f.guide,translations:[record(f)]});const loaded=JSON.parse(JSON.stringify(guide));const block=loaded.translations[0].units.find(u=>u.unitId===f.block.unitId),sent=[];
 await translateBlock(block,{onlySegmentId:'part_1',generate:async part=>{sent.push(part.segmentId);return part.protectedSource.replace('Remova','Remove');}});
 assert.deepEqual(sent,['part_1']);assert.equal(block.status,'pending');assert.equal(block.segments[0].translatedText,f.block.segments[0].translatedText);
 await translateBlock(block,{generate:async part=>{sent.push(part.segmentId);return 'Wait.';}});
 assert.deepEqual(sent,['part_1','part_2']);assert.equal(block.status,'translated');assert.ok(checkpoints.some(text=>JSON.parse(text).segments[0].status==='translated'));
});

test('pause and a failed checkpoint stop before submitting the next part without discarding accepted output',async()=>{
 const f=fixture();let pause=false,calls=0;
 await translateBlock(f.block,{generate:async()=>translations[calls++],checkpoint:async block=>{if(block.segments[0].status==='translated')pause=true;},stopped:()=>pause});
 assert.equal(calls,1);assert.equal(f.block.status,'pending');assert.equal(f.block.segments[0].status,'translated');
 pause=false;let saves=0;
 await assert.rejects(()=>translateBlock(f.block,{generate:async part=>translations[Number(part.segmentId.split('_')[1])],checkpoint:async block=>{saves++;if(block.segments[1].status==='translated')throw new Error('disk full');}}),/disk full/);
 assert.equal(f.block.segments[1].status,'translated');assert.equal(f.block.segments[2].status,'pending');assert.ok(saves>0);
});

test('headings, nested lists, blank list separators, CRLF and RTL remain literal outside generated prose',async()=>{
 const text='  ## Título\r\n  1. Primeiro\r\n\r\n    - Segundo\r\n  3.Terceiro שלום'; const f=fixture(text);
 for(const unit of f.units.filter(u=>u.path.key!=='markdown')){unit.translatedText=unit.protectedSource;unit.status='translated';}
 for(const block of f.units.filter(u=>u.path.key==='markdown'))await translateBlock(block,{generate:async part=>part.protectedSource.replace('Título','Heading').replace('Primeiro','First').replace('Segundo','Second').replace('Terceiro','Third')});
 const copy=assembleGuide(f.snapshot,f.units,'en');assert.equal(copy.sections[0].fields.markdown,text.replace('Título','Heading').replace('Primeiro','First').replace('Segundo','Second').replace('Terceiro','Third'));
});

test('table cells are translated independently while alignment, quantities, pipes, URLs and card references stay intact',async()=>{
 const text='| Carta | Comentário | Qtde |\n| :--- | ---: | --- |\n| [Myr Enforcer] | Bom plano | 4 |\n| [Link](https://example.org) | Use `a|b` aqui | 2 |'; const f=fixture(text),sent=[];
 await translateBlock(f.block,{generate:async part=>{sent.push(part.protectedSource);return part.protectedSource.replace('Carta','Card').replace('Comentário','Comment').replace('Qtde','Qty').replace('Bom plano','Good plan').replace('Link','Link').replace('Use','Use').replace('aqui','here');}});
 assert.equal(f.block.status,'translated');assert.equal(sent.some(text=>text.includes('|')||text.includes('\n')||text.includes('https:')),false);
 const output=restoreProtected(f.block.translatedText,f.block.tokens).text;assert.match(output,/\| :--- \| ---: \| --- \|/);assert.match(output,/\[Myr Enforcer\]/);assert.match(output,/https:\/\/example.org/);assert.match(output,/`a\|b`/);assert.match(output,/\| 4 \|/);
});

test('fenced code containing blank lines and unterminated code are copied without model calls',async()=>{
 const text='```js\nconst title = "Não traduza";\n\nconsole.log(title);\n```\n\n~~~\nMais código\n\nsem fechar';const f=fixture(text);let calls=0;
 for(const block of f.units.filter(u=>u.path.key==='markdown'))await translateBlock(block,{generate:async()=>{calls++;return 'wrong';}});
 assert.equal(calls,0);for(const block of f.units.filter(u=>u.path.key!=='markdown')){block.status='translated';block.translatedText=block.protectedSource;}
 assert.equal(assembleGuide(f.snapshot,f.units,'en').sections[0].fields.markdown,text);
});

test('long paragraphs stay one visible block, use bounded requests and reassemble all original separators',async()=>{
 const text=('Uma frase longa com espaços e acentos. ').repeat(30).trim(),f=fixture(text,100),sent=[];
 assert.equal(f.units.filter(u=>u.path.key==='markdown').length,1);
 await translateBlock(f.block,{limit:100,generate:async part=>{sent.push(part.protectedSource);return part.protectedSource;}});
 assert.ok(sent.length>1);assert.ok(sent.every(text=>text.length<=100));assert.equal(restoreProtected(f.block.translatedText,f.block.tokens).text,text);
});

test('an existing schema-3 failed block upgrades lazily without changing its source, identity or confirmed siblings',async()=>{
 const f=fixture();delete f.block.rangeStart;delete f.block.rangeEnd;f.block.status='error';f.block.translatedText='Broken old output';const id=f.block.unitId;
 const oldSnapshot={...f.snapshot,schemaVersion:3};assert.equal(snapshotHash(oldSnapshot),snapshotHash(f.snapshot));let index=0;
 await translateBlock(f.block,{generate:async()=>translations[index++]});assert.equal(f.block.status,'translated');assert.equal(f.block.unitId,id);assert.equal(f.block.source,list);
 acceptManualBlock(f.block);assert.equal(f.block.segments,undefined);assert.equal(f.block.translatedText.includes('⟦SM'),true);
});

test('schema-4 partial plans survive atomic storage and reject changed or overlapping segment ranges',async()=>{
 const f=fixture();prepareBlock(f.block);f.guide.translations=[record(f)];f.guide.schemaVersion=SCHEMA_VERSION;
 const directory=await mkdtemp(path.join(tmpdir(),'sidemaster-parts-'));
 try{const store=createGuideStore(directory);await store.save(f.guide,1);const read=await store.list();assert.deepEqual(read.guides[0].translations[0].units.find(u=>u.unitId===f.block.unitId).segments,f.block.segments);
 const bad=structuredClone(f.guide);bad.translations[0].units.find(u=>u.unitId===f.block.unitId).segments[1].start=0;
 assert.throws(()=>normalizeGuide(bad),/Unidade/);await assert.rejects(()=>store.save(bad,2),/Unidade/);
 assert.equal((await store.list()).guides[0].translations[0].units.find(u=>u.unitId===f.block.unitId).segments[1].start,f.block.segments[1].start);
 }finally{await rm(directory,{recursive:true,force:true});}
});

test('an indivisible part stays visibly pending for human resolution and cannot silently complete',async()=>{
 const f=fixture('UmaPalavra'+('ExtremamenteLonga'.repeat(20)),100);prepareBlock(f.block,100);
 assert.equal(f.block.status,'error');assert.equal(f.block.manualOnly,true);assert.equal(f.block.segments[0].manualOnly,true);
 let called=false;await translateBlock(f.block,{limit:100,generate:async()=>{called=true;return 'Wrong';}});assert.equal(called,false);assert.equal(f.block.status,'error');
});

test('a plan with an out-of-bounds range or future version is rejected on import',()=>{
 const f=fixture();prepareBlock(f.block);f.guide.translations=[record(f)];
 const bad=structuredClone(f.guide),unit=bad.translations[0].units.find(u=>u.unitId===f.block.unitId);unit.segments.at(-1).end+=20;
 assert.throws(()=>normalizeGuide(bad),/Unidade/);unit.segments.at(-1).end-=20;unit.segmenterVersion=99;assert.throws(()=>normalizeGuide(bad),/Unidade/);
});

test('model-added list markers, line breaks and table separators cannot escape a generated fragment',async()=>{
 for(const output of ['1. Translation','- Translation','Translation\nAnother line']){
  const f=fixture('1. Pergunta?\n2. Outra?');await translateBlock(f.block,{generate:async()=>output});assert.equal(f.block.status,'error');assert.equal(f.block.segments[1].status,'pending');
 }
 const f=fixture('| Nome | Texto |\n| --- | --- |\n| Um | Dois |');await translateBlock(f.block,{generate:async()=>'New | column'});assert.equal(f.block.status,'error');assert.match(f.block.error,/separador/);
});
