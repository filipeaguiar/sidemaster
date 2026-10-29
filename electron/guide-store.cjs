const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const STORAGE_VERSION = 1;
const MAX_FILE_BYTES = 12 * 1024 * 1024;
const validId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(value);

async function atomicWrite(file, data, beforeRename) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`;
  const handle = await fs.open(temp, 'wx', 0o600);
  try { await handle.writeFile(data); await handle.sync(); }
  finally { await handle.close(); }
  try {
    if (beforeRename) await beforeRename(temp, file);
    await fs.rename(temp, file);
  } catch (error) { await fs.rm(temp, { force: true }).catch(() => {}); throw error; }
}

function createGuideStore(root, options = {}) {
  const maxBytes = options.maxBytes || MAX_FILE_BYTES;
  const paths = {
    root,
    guides: path.join(root, 'guides'),
    recovery: path.join(root, 'recovery'),
    corrupt: path.join(root, 'recovery', 'corrupt'),
  };
  const queues = new Map();
  const revisions = new Map();
  const accepted = new Map();
  const guideFile = id => {
    if (!validId(id)) throw new Error('ID de guia inválido');
    return path.join(paths.guides, `${id}.json`);
  };
  const backupFile = id => path.join(paths.recovery, `${id}.bak.json`);
  const ensure = () => Promise.all([paths.guides, paths.recovery].map(dir => fs.mkdir(dir, { recursive: true })));
  const write = (file, data) => atomicWrite(file, data, options.beforeRename ? (_temp, destination) => options.beforeRename(destination) : undefined);
  const validateGuide = guide => {
    if (!guide || typeof guide !== 'object' || !validId(guide.guideId) || !Number.isSafeInteger(guide.schemaVersion) || guide.schemaVersion > 4) throw new Error('Estrutura ou versão de guia inválida');
    if (typeof guide.title !== 'string' || typeof guide.archetypeName !== 'string' || !guide.deck || typeof guide.deck.main !== 'string' || typeof guide.deck.sideboard !== 'string') throw new Error('Metadados ou listas do guia inválidos');
    let count = 0;
    const walk = (nodes, depth = 0) => {
      if (!Array.isArray(nodes) || depth > 30) throw new Error('Hierarquia de seções inválida');
      for (const node of nodes) {
        if (++count > 5000 || !node || typeof node !== 'object' || !validId(node.id) || typeof node.type !== 'string' || typeof node.title !== 'string' || !node.fields || typeof node.fields !== 'object' || Array.isArray(node.fields)) throw new Error('Seção inválida');
        walk(node.children || [], depth + 1);
      }
    };
    walk(guide.sections);
    if (guide.schemaVersion >= 3) {
      const language = value => typeof value === 'string' && /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(value);
      const validSnapshot = snapshot => {
        if (!snapshot || snapshot.guideId !== guide.guideId || !Array.isArray(snapshot.sections) || snapshot.translations?.length) return false;
        let snapshotCount = 0;
        const visit = (nodes, depth = 0) => Array.isArray(nodes) && depth <= 30 && nodes.every(node => {
          if (++snapshotCount > 5000 || !node || typeof node !== 'object' || !validId(node.id) || typeof node.type !== 'string'
            || typeof node.title !== 'string' || !node.fields || typeof node.fields !== 'object' || Array.isArray(node.fields)) return false;
          return visit(node.children || [], depth + 1);
        });
        return visit(snapshot.sections);
      };
      if (!language(guide.contentLanguage || 'pt-BR') || !Array.isArray(guide.translations) || guide.translations.length > 5) throw new Error('Idioma ou registros de tradução inválidos');
      const validSegments = unit => {
        if (unit.segments === undefined && unit.segmenterVersion === undefined) return true;
        if (unit.segmenterVersion !== 1 || !Array.isArray(unit.segments) || unit.segments.length > 10000 || typeof unit.protectedSource !== 'string') return false;
        let end = 0; const ids = new Set();
        return unit.segments.every(part => {
          if (!part || !validId(part.segmentId) || ids.has(part.segmentId) || !['pending','running','translated','reviewed','error'].includes(part.status)
            || !Number.isInteger(part.start) || !Number.isInteger(part.end) || part.start < end || part.end <= part.start
            || part.end > unit.protectedSource.length || unit.protectedSource.slice(part.start, part.end) !== part.protectedSource || typeof part.source !== 'string' || part.source.length > 200000
            || typeof part.translatedText !== 'string' || part.translatedText.length > 200000 || !Array.isArray(part.tokens)
            || part.tokens.some(token => !token || typeof token.token !== 'string' || typeof token.value !== 'string')) return false;
          end = part.end; ids.add(part.segmentId); return true;
        });
      };
      const ids = new Set();
      for (const run of guide.translations) {
        if (!run || typeof run !== 'object' || !validId(run.translationId) || ids.has(run.translationId)
          || run.sourceGuideId !== guide.guideId || !language(run.sourceLanguage) || !language(run.targetLanguage)
          || run.sourceLanguage.toLowerCase() === run.targetLanguage.toLowerCase()
          || !['draft', 'running', 'paused', 'interrupted', 'error', 'canceled', 'complete'].includes(run.status)
          || !validSnapshot(run.sourceSnapshot) || !Array.isArray(run.units) || run.units.length > 10000) throw new Error('Registro de tradução incompatível');
        ids.add(run.translationId);
        for (const unit of run.units) {
          if (!unit || typeof unit !== 'object' || !validId(unit.unitId) || !validSegments(unit)
            || (unit.rangeStart !== undefined && (!Number.isInteger(unit.rangeStart) || !Number.isInteger(unit.rangeEnd) || unit.rangeStart < 0 || unit.rangeEnd - unit.rangeStart !== unit.source?.length)) || !unit.path || typeof unit.path !== 'object'
            || !['guide', 'node', 'unknown'].includes(unit.path.kind) || typeof unit.path.key !== 'string'
            || (['node', 'unknown'].includes(unit.path.kind) && !validId(unit.path.nodeId))
            || !['pending', 'running', 'translated', 'reviewed', 'error'].includes(unit.status)
            || typeof unit.source !== 'string' || unit.source.length > 200000
            || typeof unit.translatedText !== 'string' || unit.translatedText.length > 200000
            || !Array.isArray(unit.tokens) || unit.tokens.length > 20000 || unit.tokens.some(token => !token || typeof token.token !== 'string' || typeof token.value !== 'string')
            || (unit.history !== undefined && (!Array.isArray(unit.history) || unit.history.length > 20 || unit.history.some(version => !version || typeof version.translatedText !== 'string' || version.translatedText.length > 200000)))) throw new Error('Unidade de tradução incompatível');
        }
      }
    }
  };
  const decode = (raw, id) => {
    if (Buffer.byteLength(raw) > maxBytes) throw new Error('Arquivo de guia excede o limite permitido');
    const record = JSON.parse(raw);
    if (!record || record.storageVersion !== STORAGE_VERSION || !Number.isSafeInteger(record.revision) || !record.guide || record.guide.guideId !== id) throw new Error('Formato de armazenamento incompatível');
    validateGuide(record.guide);
    if (!record.guide.sections.length) throw new Error('Estrutura de guia inválida');
    return record;
  };
  const read = async (file, id) => decode(await fs.readFile(file, 'utf8'), id);
  async function commit(guide, revision) {
    const file = guideFile(guide.guideId);
    const json = JSON.stringify({ storageVersion: STORAGE_VERSION, revision, guide }, null, 2);
    if (Buffer.byteLength(json) > maxBytes) throw new Error('Guia excede o tamanho máximo de armazenamento');
    try {
      const current = await read(file, guide.guideId);
      await write(backupFile(guide.guideId), JSON.stringify(current, null, 2));
    } catch (error) {
      if (error.code !== 'ENOENT') throw new Error(`Arquivo existente inválido; gravação bloqueada: ${error.message}`);
    }
    await write(file, json);
    revisions.set(guide.guideId, revision);
    accepted.set(guide.guideId, { guide, revision });
    return { guide, revision };
  }
  async function list() {
    await ensure();
    const entries = await fs.readdir(paths.guides, { withFileTypes: true });
    const guides = [], problems = [], currentRevisions = {};
    for (const entry of entries) {
      const match = entry.isFile() && entry.name.match(/^([a-zA-Z0-9_-]{1,128})\.json$/);
      if (!match) continue;
      const id = match[1], file = path.join(paths.guides, entry.name);
      try {
        const record = await read(file, id);
        guides.push(record.guide); revisions.set(id, record.revision); currentRevisions[id] = record.revision;
      } catch (error) {
        if (error.code === 'ENOENT') continue;
        try {
          const backup = await read(backupFile(id), id);
          await fs.mkdir(paths.corrupt, { recursive: true });
          await fs.copyFile(file, path.join(paths.corrupt, `${id}.${Date.now()}.corrupt.json`), fs.constants.COPYFILE_EXCL);
          await write(file, JSON.stringify(backup, null, 2));
          guides.push(backup.guide); revisions.set(id, backup.revision); currentRevisions[id] = backup.revision;
          problems.push(`O guia “${backup.guide.title || id}” foi recuperado da cópia anterior; o arquivo inválido foi preservado.`);
        } catch (backupError) {
          problems.push(`O guia ${id} não pôde ser lido: ${error.message}. Cópia de recuperação: ${backupError.message}`);
        }
      }
    }
    return { guides, problems, revisions: currentRevisions };
  }
  function save(guide, revision) {
    const id = guide.guideId;
    if (!validId(id)) return Promise.reject(new Error('ID de guia inválido'));
    const previous = queues.get(id) || Promise.resolve();
    const current = previous.catch(() => {}).then(async () => {
      const latest = revisions.get(id) || 0;
      if (revision <= latest) return { guide, revision: latest, stale: true };
      validateGuide(guide);
      return commit(guide, revision);
    });
    queues.set(id, current);
    return current.finally(() => { if (queues.get(id) === current) queues.delete(id); });
  }
  async function remove(id) {
    const file = guideFile(id);
    await (queues.get(id) || Promise.resolve());
    await fs.rm(file, { force: true });
    accepted.delete(id); revisions.delete(id);
    return { ok: true };
  }
  return {
    paths, validId, atomicWrite, list, save, remove, validateGuide,
    flush: async () => Promise.all([...queues.values()]),
    get acceptedSnapshots() { return new Map(accepted); },
    getRevision: id => revisions.get(id) || 0,
  };
}

module.exports = { createGuideStore, atomicWrite, validId, STORAGE_VERSION };
