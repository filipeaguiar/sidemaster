const { app, BrowserWindow, dialog, ipcMain, protocol, shell, screen, Menu } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { createGuideStore, validId } = require('./guide-store.cjs');
const ollama = require('./ollama-client.cjs');

protocol.registerSchemesAsPrivileged([{ scheme: 'sidemaster', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }]);

const DEV = !app.isPackaged;
const APP_ROOT = path.resolve(__dirname, '..');
const APP_ORIGIN = 'sidemaster://app';
const APP_DATA = path.join(app.getPath('appData'), DEV ? 'SideMaster-dev' : 'SideMaster');
app.setName(DEV ? 'SideMaster-dev' : 'SideMaster');
if (process.platform === 'win32') app.setAppUserModelId('io.sidemaster.app');
app.setPath('userData', APP_DATA);
app.setPath('sessionData', path.join(APP_DATA, 'session'));

const MAX_FILE_BYTES = 12 * 1024 * 1024;
const cleanName = value => String(value || 'guia').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').trim().slice(0, 100) || 'guia';
let mainWindow;
let closeInProgress = false;
let closeAllowed = false;
let closeWaiter;
let pendingHtml = new Map();
const guideStore = createGuideStore(APP_DATA);
const pendingSnapshots = new Map();
let boundsTimer;
let settingsQueue = Promise.resolve();
const translationRequests = new Map();
function updateSettings(patch) {
  const operation = settingsQueue.catch(() => {}).then(async () => {
    let existing = {};
    try { existing = JSON.parse(await fs.readFile(path.join(APP_DATA, 'settings.json'), 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    await guideStore.atomicWrite(path.join(APP_DATA, 'settings.json'), JSON.stringify({ ...existing, ...patch }, null, 2));
  });
  settingsQueue = operation;
  return operation;
}
function senderAllowed(event) {
  try { return event.senderFrame.url.startsWith(`${APP_ORIGIN}/`) && event.sender === mainWindow?.webContents; }
  catch { return false; }
}
function requireSender(event) { if (!senderAllowed(event)) throw new Error('Origem da solicitação não permitida'); }
function safeSettings(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Preferências inválidas');
  const text = JSON.stringify(value);
  if (Buffer.byteLength(text) > 64 * 1024) throw new Error('Preferências excedem o limite permitido');
  return value;
}
async function saveDialog(options) {
  const result = await dialog.showSaveDialog(mainWindow, options);
  if (result.canceled || !result.filePath) return { canceled: true };
  return { filePath: result.filePath };
}
async function writeChosenFile(options, content) {
  const chosen = await saveDialog(options);
  if (chosen.canceled) return chosen;
  await guideStore.atomicWrite(chosen.filePath, content);
  return { canceled: false, filePath: chosen.filePath };
}
function createWindow() {
  let saved = {};
  try { saved = JSON.parse(require('node:fs').readFileSync(path.join(APP_DATA, 'settings.json'), 'utf8')).window || {}; } catch {}
  const displays = screen.getAllDisplays();
  const display = displays.find(item => saved.x >= item.workArea.x && saved.x < item.workArea.x + item.workArea.width && saved.y >= item.workArea.y && saved.y < item.workArea.y + item.workArea.height) || screen.getPrimaryDisplay();
  const bounds = {
    x: Math.max(display.workArea.x, Math.min(Number(saved.x) || display.workArea.x + 40, display.workArea.x + display.workArea.width - 420)),
    y: Math.max(display.workArea.y, Math.min(Number(saved.y) || display.workArea.y + 40, display.workArea.y + display.workArea.height - 320)),
    width: Math.min(Math.max(Number(saved.width) || 1500, 980), display.workArea.width),
    height: Math.min(Math.max(Number(saved.height) || 940, 650), display.workArea.height),
  };
  mainWindow = new BrowserWindow({
    ...bounds, minWidth: 980, minHeight: 650,
    icon: path.join(__dirname, 'assets', process.platform === 'win32' ? 'sidemaster-icon.ico' : 'sidemaster-icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true, spellcheck: true },
  });
  mainWindow.removeMenu();
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const target = new URL(url);
      if (target.protocol === 'https:' && target.hostname && !target.username && !target.password) shell.openExternal(target.href);
    } catch {}
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(`${APP_ORIGIN}/`)) event.preventDefault();
  });
  mainWindow.webContents.on('will-redirect', (event, url) => {
    if (!url.startsWith(`${APP_ORIGIN}/`)) event.preventDefault();
  });
  mainWindow.webContents.on('will-frame-navigate', (event, details) => {
    if (!details.url.startsWith(`${APP_ORIGIN}/`)) event.preventDefault();
  });
  mainWindow.webContents.on('will-attach-webview', event => event.preventDefault());
  mainWindow.webContents.on('will-prevent-unload', event => event.preventDefault());
  mainWindow.on('close', event => {
    if (closeAllowed) return;
    event.preventDefault();
    beginClose();
  });
  const persistBounds = () => {
    clearTimeout(boundsTimer);
    boundsTimer = setTimeout(async () => {
      if (!mainWindow || mainWindow.isMaximized() || mainWindow.isFullScreen()) return;
      const current = mainWindow.getBounds();
      await updateSettings({ window: { ...current, maximized: mainWindow.isMaximized() } }).catch(() => {});
    }, 400);
  };
  mainWindow.on('resize', persistBounds);
  mainWindow.on('move', persistBounds);
  if (saved.maximized) mainWindow.maximize();
  mainWindow.on('closed', () => { mainWindow = undefined; });
  mainWindow.loadURL(`${APP_ORIGIN}/index.html`);
}
function beginClose() {
  if (closeInProgress || !mainWindow) return;
  closeInProgress = true;
  let timeout;
  let resolveWait;
  const waiting = new Promise(resolve => { resolveWait = resolve; timeout = setTimeout(() => resolve({ ok: false, error: 'O editor não respondeu a tempo.' }), 15000); });
  closeWaiter = result => resolveWait(result);
  mainWindow.webContents.send('close:prepare');
  waiting.then(async result => {
    clearTimeout(timeout); closeWaiter = undefined; closeInProgress = false;
    for (const item of result?.snapshots || []) if (item?.guide?.guideId && validId(item.guide.guideId)) pendingSnapshots.set(item.guide.guideId, item);
    if (result?.ok) {
      try {
        await guideStore.flush();
        if (mainWindow && !mainWindow.isFullScreen()) await updateSettings({ window: { ...mainWindow.getBounds(), maximized: mainWindow.isMaximized() } });
        pendingSnapshots.clear();
        closeAllowed = true; mainWindow?.close(); return;
      } catch (error) { result = { ok: false, error: `Falha ao concluir o salvamento: ${error.message}` }; }
    }
    const answer = await dialog.showMessageBox(mainWindow, {
      type: 'warning', title: 'Há alterações que não foram salvas', message: result?.error || 'Não foi possível concluir o salvamento.',
      buttons: ['Tentar novamente', 'Exportar edições pendentes', 'Voltar ao editor', 'Descartar e sair'], defaultId: 0, cancelId: 2, noLink: true,
    });
    if (answer.response === 0) beginClose();
    else if (answer.response === 1) await exportPendingSnapshots();
    else if (answer.response === 3) { closeAllowed = true; mainWindow?.close(); }
    else mainWindow?.webContents.send('close:failed', 'O fechamento foi cancelado. Suas alterações continuam no editor.');
  });
}
async function exportPendingSnapshots() {
  const snapshots = [...pendingSnapshots.values()];
  if (!snapshots.length) { mainWindow?.webContents.send('close:failed', 'Não há snapshots pendentes para exportar. O editor continua aberto.'); return; }
  try {
    for (const item of snapshots) {
      const guide = item.guide;
      const result = await writeChosenFile({ title: `Exportar edição pendente — ${guide.title || 'guia'}`, defaultPath: `${cleanName(guide.title)}-pendente.json`, filters: [{ name: 'JSON', extensions: ['json'] }] }, JSON.stringify({ schemaVersion: 2, exportedAt: new Date().toISOString(), guides: [guide] }, null, 2));
      if (result.canceled) { mainWindow?.webContents.send('close:failed', 'Exportação cancelada. O editor continua aberto.'); return; }
    }
    mainWindow?.webContents.send('close:failed', `Exportada(s) ${snapshots.length} cópia(s) de guia. O editor continua aberto.`);
  } catch (error) { mainWindow?.webContents.send('close:failed', `Falha ao exportar edições pendentes: ${error.message}`); }
}

async function registerProtocol() {
  await protocol.handle('sidemaster', async request => {
    const url = new URL(request.url);
    if (url.hostname !== 'app' || request.method !== 'GET') return new Response('Not found', { status: 404 });
    if (url.pathname.startsWith('/print/')) {
      const token = url.pathname.slice('/print/'.length);
      const html = pendingHtml.get(token);
      if (!html) return new Response('Expired', { status: 404 });
      return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'content-security-policy': "default-src 'none'; img-src data: blob: https://cards.scryfall.io https://c1.scryfall.com; style-src 'unsafe-inline'; font-src data:; script-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" } });
    }
    const relative = decodeURIComponent(url.pathname.slice(1) || 'index.html');
    const resolved = path.resolve(APP_ROOT, relative);
    if (!resolved.startsWith(`${APP_ROOT}${path.sep}`) || !/^(index\.html|src\/[a-zA-Z0-9_.-]+\.(?:js|css)|electron\/assets\/sidemaster-icon\.(?:svg|png|ico))$/.test(relative)) return new Response('Not found', { status: 404 });
    let body;
    try { body = await fs.readFile(resolved); } catch { return new Response('Not found', { status: 404 }); }
    const ext = path.extname(resolved);
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' }[ext];
    const headers = { 'content-type': `${mime}${['.png', '.ico'].includes(ext) ? '' : '; charset=utf-8'}`, 'x-content-type-options': 'nosniff' };
    if (relative === 'index.html') headers['content-security-policy'] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://cards.scryfall.io https://c1.scryfall.com; connect-src 'self' https://api.scryfall.com https://cards.scryfall.io https://c1.scryfall.com; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'";
    return new Response(body, { headers });
  });
}

async function registerIpc() {
  ipcMain.handle('guides:list', async event => { requireSender(event); return guideStore.list(); });
  ipcMain.handle('guides:save', async (event, guide, revision) => {
    requireSender(event);
    if (!guide || !validId(guide.guideId) || !Array.isArray(guide.sections) || !guide.sections.length || !Number.isSafeInteger(revision) || revision < 1 || Buffer.byteLength(JSON.stringify(guide)) > MAX_FILE_BYTES) throw new Error('Snapshot de guia inválido');
    const result = await guideStore.save(guide, revision);
    pendingSnapshots.delete(guide.guideId);
    return result;
  });
  ipcMain.handle('guides:delete', async (event, id) => {
    requireSender(event);
    return guideStore.remove(id);
  });
  ipcMain.handle('settings:load', async event => {
    requireSender(event);
    try { return JSON.parse(await fs.readFile(path.join(APP_DATA, 'settings.json'), 'utf8')); } catch (error) { if (error.code === 'ENOENT') return {}; throw error; }
  });
  ipcMain.handle('settings:save', async (event, value) => {
    requireSender(event); const safe = safeSettings(value);
    await updateSettings(safe);
    return { ok: true };
  });
  ipcMain.handle('ollama:discover', async event => { requireSender(event); return { models: await ollama.discover() }; });
  ipcMain.handle('ollama:inspect', async (event, model) => {
    requireSender(event);
    if (typeof model !== 'string' || model.length > 256) throw new Error('Modelo inválido');
    return ollama.inspect(model);
  });
  ipcMain.handle('ollama:generate', async (event, request) => {
    requireSender(event);
    if (!request || typeof request.id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(request.id) || translationRequests.has(request.id)) throw new Error('Identificador de operação inválido ou duplicado');
    const inspected = await ollama.inspect(request.model);
    if (!inspected.compatible || inspected.remote || !inspected.capabilities.includes('completion')) throw new Error('Os metadados do modelo não confirmam uma execução local compatível com geração de texto');
    const controller = new AbortController();
    translationRequests.set(request.id, { controller, sender: event.sender });
    try { return await ollama.generate({ ...request, signal: controller.signal }); }
    finally { translationRequests.delete(request.id); }
  });
  ipcMain.handle('ollama:cancel', async (event, id) => {
    requireSender(event);
    const operation = translationRequests.get(id);
    if (operation?.sender === event.sender) operation.controller.abort();
    return { ok: true };
  });
  ipcMain.handle('files:import-guide', async event => {
    requireSender(event);
    const result = await dialog.showOpenDialog(mainWindow, { title: 'Importar guia', properties: ['openFile'], filters: [{ name: 'JSON', extensions: ['json'] }] });
    if (result.canceled || !result.filePaths[0]) return { canceled: true };
    const stats = await fs.stat(result.filePaths[0]); if (stats.size > MAX_FILE_BYTES * 20) throw new Error('Arquivo excede o limite permitido');
    return { canceled: false, data: JSON.parse(await fs.readFile(result.filePaths[0], 'utf8')) };
  });
  ipcMain.handle('files:export-guide', async (event, guide, format, content) => {
    requireSender(event);
    if (!guide || !validId(guide.guideId) || !['json', 'html', 'patreon'].includes(format) || typeof content !== 'string' || Buffer.byteLength(content) > MAX_FILE_BYTES * 2) throw new Error('Pedido de exportação inválido');
    const ext = format === 'json' ? 'json' : 'html';
    const label = format === 'json' ? 'JSON' : 'HTML';
    const result = await writeChosenFile({ title: `Exportar ${label}`, defaultPath: `${cleanName(guide.title)}${format === 'patreon' ? '-patreon' : ''}.${ext}`, filters: [{ name: label, extensions: [ext] }] }, content);
    return { canceled: result.canceled, filePath: result.filePath };
  });
  ipcMain.handle('files:export-pdf', async (event, guide, html) => {
    requireSender(event);
    if (!guide || !validId(guide.guideId) || typeof html !== 'string' || Buffer.byteLength(html) > MAX_FILE_BYTES * 4) throw new Error('Pedido de PDF inválido');
    const chosen = await saveDialog({ title: 'Salvar guia em PDF', defaultPath: `${cleanName(guide.title)}.pdf`, filters: [{ name: 'PDF', extensions: ['pdf'] }] });
    if (chosen.canceled) return { canceled: true };
    const token = crypto.randomUUID(); pendingHtml.set(token, html);
    const printWindow = new BrowserWindow({ show: false, width: 1000, height: 1400, webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true } });
    try {
      printWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
      printWindow.webContents.on('will-navigate', e => e.preventDefault());
      await printWindow.loadURL(`${APP_ORIGIN}/print/${token}`);
      await Promise.race([
        printWindow.webContents.executeJavaScript("Promise.all([document.fonts?.ready, ...[...document.images].map(img => img.decode().catch(() => {}))])"),
        new Promise(resolve => setTimeout(resolve, 8000)),
      ]);
      const pdf = await printWindow.webContents.printToPDF({ pageSize: 'A4', printBackground: true, preferCSSPageSize: true, margins: { top: 0.63, bottom: 0.63, left: 0.63, right: 0.63 } });
      await guideStore.atomicWrite(chosen.filePath, pdf);
      return { canceled: false, filePath: chosen.filePath };
    } finally { pendingHtml.delete(token); if (!printWindow.isDestroyed()) printWindow.destroy(); }
  });
  ipcMain.handle('close:complete', (event, result) => { requireSender(event); closeWaiter?.(result); return { ok: true }; });
  ipcMain.handle('close:retry', event => { requireSender(event); beginClose(); return { ok: true }; });
  ipcMain.handle('close:discard', event => { requireSender(event); closeAllowed = true; mainWindow?.close(); return { ok: true }; });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
else {
  app.on('second-instance', () => { if (!mainWindow) return; if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.show(); mainWindow.focus(); });
  app.whenReady().then(async () => { Menu.setApplicationMenu(null); await fs.mkdir(APP_DATA, { recursive: true }); await registerProtocol(); await registerIpc(); createWindow(); });
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
