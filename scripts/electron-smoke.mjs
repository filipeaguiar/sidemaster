import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const [mode = 'edit-close'] = process.argv.slice(2);
const rendererPort = Number(process.env.SIDEMASTER_RENDERER_PORT || 9222);
const mainPort = Number(process.env.SIDEMASTER_MAIN_PORT || 9223);
const profile = process.env.SIDEMASTER_PROFILE_DIR;
const appExe = process.env.SIDEMASTER_APP_EXE;
const outputDir = path.join(profile || '.', 'smoke-exports');
const marker = 'Desktop smoke guide survives immediate close and update';

async function target(port, choosePage = false) {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const items = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json());
      const item = choosePage ? items.find(value => value.type === 'page') : items[0];
      if (item?.webSocketDebuggerUrl) return item;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error(`Electron debug target on port ${port} did not start`);
}
async function attach(port, choosePage = false) {
  const item = await target(port, choosePage);
  const socket = new WebSocket(item.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let serial = 0;
  const pending = new Map();
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
  };
  return {
    socket,
    async send(method, params = {}) {
      const id = ++serial;
      const response = new Promise(resolve => pending.set(id, resolve));
      socket.send(JSON.stringify({ id, method, params }));
      return response;
    },
    async evaluate(expression) {
      const response = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (response.result?.exceptionDetails) throw new Error(response.result.exceptionDetails.exception?.description || response.result.exceptionDetails.text);
      return response.result?.result?.value;
    }
  };
}

assert.ok(profile, 'SIDEMASTER_PROFILE_DIR is required');
assert.ok(appExe, 'SIDEMASTER_APP_EXE is required');
const renderer = await attach(rendererPort, true);
let pageInfo;
for (let attempt = 0; attempt < 100; attempt++) {
  const raw = await renderer.evaluate("JSON.stringify({url:location.href,title:document.querySelector('#metadata input[name=title]')?.value,guideId:document.querySelector('#guide-select')?.value})");
  pageInfo = JSON.parse(raw);
  if (typeof pageInfo.title === 'string') break;
  await new Promise(resolve => setTimeout(resolve, 200));
}
assert.equal(typeof pageInfo.title, 'string', 'the guide editor should finish loading');
assert.equal(pageInfo.url, 'sidemaster://app/index.html');
const main = await attach(mainPort);
assert.equal(await main.evaluate("process.mainModule.require('electron').BrowserWindow.getAllWindows()[0].isMenuBarVisible()"), false, 'the native Electron menu bar should be hidden');

if (mode === 'verify-update') {
  assert.equal(pageInfo.title, marker, 'the updated installation should reopen the previous guide');
  await main.evaluate("(()=>{process.mainModule.require('electron').BrowserWindow.getAllWindows()[0].close();return true})()");
  renderer.socket.close(); main.socket.close();
}
else {
  await mkdir(outputDir, { recursive: true });
  await main.evaluate(`(()=>{const req=process.mainModule.require;const dialog=req('electron').dialog;const p=req('node:path');let serial=0;dialog.showSaveDialog=async(_window,options)=>({canceled:false,filePath:p.join(${JSON.stringify(outputDir)},'export-'+(++serial)+'.'+(options.filters?.[0]?.extensions?.[0]||'bin'))});dialog.showOpenDialog=async()=>({canceled:false,filePaths:[globalThis.__sideMasterImportPath]});return true})()`);
  const second = spawnSync(appExe, [`--remote-debugging-port=${rendererPort}`], { timeout: 10000, windowsHide: true });
  assert.equal(second.error, undefined, `second launch should exit under the single-instance lock: ${second.error?.message}`);
  assert.equal(second.status, 0, 'second launch should exit normally');
  assert.ok(await fetch(`http://127.0.0.1:${rendererPort}/json/version`), 'the first instance should remain available');
  const guideFiles = (await readdir(path.join(profile, 'guides'))).filter(name => name.endsWith('.json'));
  assert.ok(guideFiles.length, 'the initial guide should be present on disk');
  const originalRecord = JSON.parse(await readFile(path.join(profile, 'guides', guideFiles[0]), 'utf8'));
  const legacyA = structuredClone(originalRecord.guide);
  legacyA.guideId = 'guide_smoke_legacy_a'; legacyA.title = 'Legacy import A';
  const legacyB = structuredClone(originalRecord.guide);
  legacyB.guideId = 'guide_smoke_legacy_b'; legacyB.title = 'Legacy import B';
  const legacyFile = path.join(outputDir, 'legacy-library.json');
  await writeFile(legacyFile, JSON.stringify({ schemaVersion: 2, guides: [legacyA, legacyB] }));
  await writeFile(path.join(outputDir, 'invalid.json'), '{invalid');
  await writeFile(path.join(outputDir, 'duplicate.json'), JSON.stringify({ schemaVersion: 2, guides: [legacyA] }));
  await main.evaluate(`globalThis.__sideMasterImportPath=${JSON.stringify(legacyFile)}`);
  await renderer.evaluate("document.querySelector('#import-guide').click()");
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await renderer.evaluate("Array.from(document.querySelectorAll('#tree-dialog[open] [data-import-index]')).some(item=>item.dataset.importIndex==='0')")) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(await renderer.evaluate("Array.from(document.querySelectorAll('#tree-dialog[open] [data-import-index]')).some(item=>item.dataset.importIndex==='0')"), true, 'legacy libraries should ask for one guide');
  await renderer.evaluate("document.querySelector('#tree-dialog [data-import-index=\"0\"]').click()");
  for (let attempt = 0; attempt < 100; attempt++) { if (await renderer.evaluate("document.querySelector('#status-text').textContent.includes('Guia importado e salvo')")) break; await new Promise(resolve => setTimeout(resolve, 100)); }
  assert.equal(await renderer.evaluate("document.querySelector('#header-guide-title').textContent"), 'Legacy import A');

  for (const [file, expected] of [['duplicate.json', 'Importação inválida'], ['invalid.json', 'Importação inválida']]) {
    await main.evaluate(`globalThis.__sideMasterImportPath=${JSON.stringify(path.join(outputDir, file))}`);
    await renderer.evaluate("document.querySelector('#import-guide').click()");
    for (let attempt = 0; attempt < 100; attempt++) { if (await renderer.evaluate(`document.querySelector('#status-text').textContent.startsWith(${JSON.stringify(expected)})`)) break; await new Promise(resolve => setTimeout(resolve, 100)); }
    assert.equal(await renderer.evaluate(`document.querySelector('#status-text').textContent.startsWith(${JSON.stringify(expected)})`), true, `${file} should be rejected without replacing a guide`);
  }

  await renderer.evaluate(`(()=>{const select=document.querySelector('#guide-select');select.value=${JSON.stringify(pageInfo.guideId)};select.dispatchEvent(new Event('change',{bubbles:true}));const field=document.querySelector('#metadata input[name=title]');field.value=${JSON.stringify(marker)};field.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
  await renderer.evaluate("document.querySelector('#export-json').click()");
  await renderer.evaluate("document.querySelector('#export-html').click()");
  await renderer.evaluate("document.querySelector('#export-patreon').click()");
  await renderer.evaluate("document.querySelector('#export-pdf').click()");
  for (let attempt = 0; attempt < 100; attempt++) { try { if ((await readdir(outputDir)).filter(name => name.startsWith('export-')).length >= 4) break; } catch {} await new Promise(resolve => setTimeout(resolve, 150)); }
  const exports = (await readdir(outputDir)).filter(name => name.startsWith('export-'));
  assert.equal(exports.length, 4, 'JSON, HTML, Patreon HTML and PDF should all be written');
  const jsonFile = exports.find(name => name.endsWith('.json'));
  const json = JSON.parse(await readFile(path.join(outputDir, jsonFile), 'utf8'));
  assert.equal(json.guides.length, 1, 'JSON export should include only the active guide');
  assert.equal(json.guides[0].title, marker, 'JSON export should include edits before the save debounce');
  const htmlFiles = exports.filter(name => name.endsWith('.html'));
  for (const name of htmlFiles) assert.match(await readFile(path.join(outputDir, name), 'utf8'), /Desktop smoke guide survives immediate close and update/);
  const pdf = await readFile(path.join(outputDir, exports.find(name => name.endsWith('.pdf'))));
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-', 'PDF export should create a PDF file');

  await main.evaluate("process.mainModule.require('electron').dialog.showSaveDialog=async()=>({canceled:true})");
  await renderer.evaluate("document.querySelector('#export-json').click()");
  await new Promise(resolve => setTimeout(resolve, 200));
  assert.equal((await readdir(outputDir)).filter(name => name.startsWith('export-')).length, 4, 'canceling an export should not create a file');
  await main.evaluate(`process.mainModule.require('electron').dialog.showSaveDialog=async()=>({canceled:false,filePath:${JSON.stringify(profile)}})`);
  await renderer.evaluate("document.querySelector('#export-json').click()");
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await renderer.evaluate("document.querySelector('#status-text').textContent.startsWith('Falha ao exportar JSON:')")) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(await renderer.evaluate("document.querySelector('#status-text').textContent.startsWith('Falha ao exportar JSON:')"), true, 'a failed write should be reported without closing the editor');

  await main.evaluate("(()=>{process.mainModule.require('electron').BrowserWindow.getAllWindows()[0].close();return true})()");
  renderer.socket.close(); main.socket.close();
  const profileGuides = path.join(profile, 'guides');
  let written;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const files = (await readdir(profileGuides)).filter(name => name.endsWith('.json'));
      const persisted = await Promise.all(files.map(async name => JSON.parse(await readFile(path.join(profileGuides, name), 'utf8'))));
      written = persisted.find(record => record.guide?.title === marker);
      if (written) break;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert.ok(written, 'the last edit must be saved before the window closes');
  assert.equal(written.storageVersion, 1);
}
console.log(`SideMaster ${mode} smoke passed`);
