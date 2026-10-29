import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseList } from '../src/deck.js';
import { afterTyping } from '../src/after-typing.js';
import { clearCardStorage } from '../src/card-storage.js';

beforeEach(async () => {
  await clearCardStorage();
});

const response = (status = 200) => ({ok: status === 200, status, json: async () => ({name:'Myr Enforcer',id:'test',image_uris:{normal:'https://example.test/card.jpg'},legalities:{pauper:'legal'}})});
test('opening hands accept both reference and direct-image notation without changing quantities', () => {
  const parsed = parseList('2 ![Myr Enforcer]\n3 [Island]\n2 Thoughtcast');
  assert.deepEqual(parsed.map(e=>[e.quantity,e.name]),[[2,'Myr Enforcer'],[3,'Island'],[2,'Thoughtcast']]);
  assert.equal(parsed.reduce((n,e)=>n+e.quantity,0),7);
  assert.ok(parsed.every(e=>!e.error));
});
test('failed lookups stay cached until a different normalized card name is supplied', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { if (++calls === 1) throw new TypeError('Network unavailable'); return response(); };
  try {
    const {findCard} = await import('../src/cards.js?network-recovery');
    assert.equal((await findCard('Myr Enforce')).status,'error');
    assert.equal((await findCard('Myr Enforce')).status,'error');
    assert.equal((await findCard('  MYR ENFORCE  ')).status,'error');
    assert.equal(calls,1);
    assert.equal((await findCard('Myr Enforcer')).status,'found');
    assert.equal(calls,2);
  } finally { globalThis.fetch = originalFetch; }
});
test('API throttling is not retried and concurrent repeated cards share one failed lookup', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => response(++calls === 1 ? 429 : 200);
  try {
    const {findCard} = await import('../src/cards.js?throttle-recovery');
    const results = await Promise.all([findCard('Myr Enforcer'),findCard('Myr Enforcer')]);
    assert.ok(results.every(r=>r.status==='error'));
    assert.equal((await findCard('Myr Enforcer')).status,'error');
    assert.equal(calls,1);
  } finally { globalThis.fetch = originalFetch; }
});
test('temporary failure in fallback search is not misreported as a missing card',async()=>{
  const originalFetch = globalThis.fetch;
  let calls=0;
  globalThis.fetch = async url => { calls++; return response(url.includes('/named?') ? 404 : 503); };
  try {
    const {findCard} = await import('../src/cards.js?fallback-error');
    assert.equal((await findCard('Carta')).status,'error');
    assert.equal((await findCard('Carta')).status,'error');
    assert.equal(calls,2);
  } finally {globalThis.fetch=originalFetch;}
});
test('not-found results do not repeat either endpoint on subsequent renders',async()=>{
  const originalFetch=globalThis.fetch; let calls=0;
  globalThis.fetch=async()=>{calls++;return response(404);};
  try {
    const {findCard}=await import('../src/cards.js?notfound-cache');
    assert.equal((await findCard('Carta inexistente')).status,'notfound');
    for(let i=0;i<10;i++) assert.equal((await findCard('Carta inexistente')).status,'notfound');
    assert.equal(calls,2);
  } finally {globalThis.fetch=originalFetch;}
});
test('rapid name edits perform only one lookup after the typing pause',async()=>{
  const originalFetch=globalThis.fetch; const requests=[];
  globalThis.fetch=async url=>{requests.push(url);return response();};
  try {
    const {findCard}=await import('../src/cards.js?typing-pause');
    let complete;
    const finished=new Promise(resolve=>{complete=resolve;});
    const schedule=afterTyping(async name=>complete(await findCard(name)),30);
    schedule('M'); schedule('Myr'); schedule('Myr Enforcer');
    assert.equal(requests.length,0);
    assert.equal((await finished).status,'found');
    assert.equal(requests.length,1);
    assert.ok(requests[0].includes('Myr%20Enforcer'));
  } finally {globalThis.fetch=originalFetch;}
});
