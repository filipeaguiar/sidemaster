export const SCHEMA_VERSION = 4;
export const RATINGS = ['Muito favorável', 'Favorável', 'Levemente favorável', 'Equilibrado', 'Levemente desfavorável', 'Desfavorável', 'Muito desfavorável'];

const id = (prefix) => `${prefix}_${crypto.randomUUID()}`;

export function emptyGuide() {
  const sections = [
    ['presentation', 'Apresentação'], ['deck', 'Sobre o deck'], ['main', 'Main deck'],
    ['sideboard', 'Sideboard'], ['choices', 'Escolhas e base de mana'],
    ['maybeboard', 'Maybeboard'], ['matchups', 'Matchups'], ['closing', 'Encerramento']
  ].map(([type, title]) => createNode(type, title));
  sections[1].children = [createNode('custom', 'Plano de jogo'), createNode('custom', 'Mulligan'), createNode('hands', 'Mãos iniciais')];
  return { schemaVersion: SCHEMA_VERSION, guideId: id('guide'), archetypeId: id('archetype'), archetypeName: 'Novo arquétipo', versionLabel: 'V1', referenceDate: '', contentLanguage: 'pt-BR', translations: [], title: 'Novo guia', author: '', sections, deck: { main: '', sideboard: '' }, legalityCheck: { status: 'pending', checkedAt: null }, createdAt: new Date().toISOString(), updatedAt: null };
}

export function envelope(guides) { return { schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), guides }; }

export function emptyMatchup() {
  return { matchupId: `matchup_${crypto.randomUUID()}`, archetype: 'Novo confronto', general: { strategy: '', in: '', out: '', interactions: '', adjustments: '', rating: 'Equilibrado', justification: '' }, variants: [], hands: [] };
}

export function effectivePlan(matchup, variant) {
  const base = matchup?.children?.find(n => n.type === 'plan')?.fields || matchup?.general || {};
  const overrides = variant?.fields?.overrides || variant?.overrides || {};
  return Object.fromEntries(Array.from(new Set([...Object.keys(base), ...Object.keys(overrides)]), (key) => [key, Object.prototype.hasOwnProperty.call(overrides, key) ? overrides[key] : base[key]]));
}

function validateTranslations(records, guideId) {
  const runStates = new Set(['draft', 'running', 'paused', 'interrupted', 'error', 'canceled', 'complete']);
  const unitStates = new Set(['pending', 'running', 'translated', 'reviewed', 'error']);
  const validSegments = unit => {
    if (unit.segments === undefined && unit.segmenterVersion === undefined) return true;
    if (unit.segmenterVersion !== 1 || !Array.isArray(unit.segments) || unit.segments.length > 10000 || typeof unit.protectedSource !== 'string') return false;
    let end = 0; const ids = new Set();
    return unit.segments.every(part => {
      if (!part || typeof part.segmentId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(part.segmentId) || ids.has(part.segmentId)
        || !unitStates.has(part.status) || !Number.isInteger(part.start) || !Number.isInteger(part.end) || part.start < end || part.end <= part.start
        || part.end > unit.protectedSource.length || unit.protectedSource.slice(part.start, part.end) !== part.protectedSource || typeof part.source !== 'string' || part.source.length > 200000
        || typeof part.translatedText !== 'string' || part.translatedText.length > 200000 || !Array.isArray(part.tokens)
        || part.tokens.some(token => !token || typeof token.token !== 'string' || typeof token.value !== 'string')) return false;
      end = part.end; ids.add(part.segmentId); return true;
    });
  };
  const validSnapshot = snapshot => {
    if (!snapshot || snapshot.guideId !== guideId || !Array.isArray(snapshot.sections) || (snapshot.translations?.length)) return false;
    let count = 0;
    const visit = (nodes, depth = 0) => Array.isArray(nodes) && depth <= 30 && nodes.every(node => {
      if (++count > 5000 || !node || typeof node !== 'object' || typeof node.id !== 'string' || typeof node.type !== 'string'
        || typeof node.title !== 'string' || !node.fields || typeof node.fields !== 'object' || Array.isArray(node.fields)) return false;
      return visit(node.children || [], depth + 1);
    });
    return visit(snapshot.sections);
  };
  if (!Array.isArray(records) || records.length > 5) throw new Error('Registros de tradução inválidos');
  for (const run of records) {
    if (!run || typeof run !== 'object' || typeof run.translationId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(run.translationId)
      || run.sourceGuideId !== guideId || !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(run.sourceLanguage || '')
      || !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(run.targetLanguage || '')
      || run.sourceLanguage.toLowerCase() === run.targetLanguage.toLowerCase() || !runStates.has(run.status)
      || !validSnapshot(run.sourceSnapshot) || typeof run.sourceHash !== 'string' || !/^[a-f0-9]{8}$/i.test(run.sourceHash)
      || !Array.isArray(run.units) || run.units.length > 10000) throw new Error('Registro de tradução incompatível');
    for (const unit of run.units) {
      if (!unit || typeof unit !== 'object' || typeof unit.unitId !== 'string' || !unitStates.has(unit.status)
        || !validSegments(unit) || (unit.rangeStart !== undefined && (!Number.isInteger(unit.rangeStart) || !Number.isInteger(unit.rangeEnd) || unit.rangeStart < 0 || unit.rangeEnd - unit.rangeStart !== unit.source?.length))
        || !unit.path || typeof unit.path !== 'object' || !['guide', 'node', 'unknown'].includes(unit.path.kind)
        || ((unit.path.kind === 'node' || unit.path.kind === 'unknown') && (typeof unit.path.nodeId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(unit.path.nodeId)))
        || typeof unit.path.key !== 'string' || typeof unit.source !== 'string' || unit.source.length > 200000
        || typeof unit.translatedText !== 'string' || unit.translatedText.length > 200000 || !Array.isArray(unit.tokens) || unit.tokens.length > 20000
        || unit.tokens.some(token => !token || typeof token.token !== 'string' || typeof token.value !== 'string')
        || (unit.history !== undefined && (!Array.isArray(unit.history) || unit.history.length > 20 || unit.history.some(version => !version || typeof version.translatedText !== 'string' || version.translatedText.length > 200000)))) throw new Error('Unidade de tradução incompatível');
    }
  }
}

export function normalizeGuide(value) {
  if (!value || typeof value !== 'object' || !value.guideId || !Array.isArray(value.sections) || !value.sections.length) throw new Error('Estrutura de guia inválida');
  if (Number(value.schemaVersion || 1) > SCHEMA_VERSION) throw new Error('Versão de guia ainda não suportada');
  const used = new Set();
  function normalize(nodes, depth = 0) {
    if (depth > 30) throw new Error('Hierarquia muito profunda');
    return nodes.map(s => {
      if (!s || typeof s !== 'object') throw new Error('Seção inválida');
      const nodeId = s.id || id('section');
      if (used.has(nodeId)) throw new Error('Identificadores de seção duplicados');
      used.add(nodeId);
      return { ...s, id: nodeId, type: s.type || 'custom', title: s.title || 'Seção', fields: s.fields || { markdown: '' }, children: normalize(s.children || [], depth + 1) };
    });
  }
  if (value.contentLanguage && !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(value.contentLanguage)) throw new Error('Idioma do guia inválido');
  const translations = value.translations === undefined ? [] : value.translations;
  validateTranslations(translations, value.guideId);
  const guide = { ...value, schemaVersion: SCHEMA_VERSION, contentLanguage: value.contentLanguage || 'pt-BR', translations, deck: value.deck || { main: '', sideboard: '' }, legalityCheck: value.legalityCheck || { status: 'pending', checkedAt: null }, sections: normalize(value.sections) };
  if (value.matchups?.length) {
    let parent = guide.sections.find(s => s.type === 'matchups');
    if (!parent) { parent = createNode('matchups', 'Matchups'); guide.sections.push(parent); }
    for (const m of value.matchups) {
      const node = createNode('matchup', m.archetype || 'Matchup'); node.id = m.matchupId || node.id;
      node.children[0].fields = { ...node.children[0].fields, ...m.general };
      node.children[1].children = (m.variants || []).map(v => ({ ...createNode('variant', v.name), id: v.variantId || id('section'), fields: { overrides: { ...v.overrides } } }));
      node.children[2].children = (m.hands || []).map(h => ({ ...createNode('hand', h.label), id: h.handId || id('section'), fields: { ...h } }));
      parent.children.push(node);
    }
  }
  delete guide.matchups;
  return guide;
}

export const PLAN_FIELDS = { strategy: 'Estratégia', in: 'Entram', out: 'Saem', justification: 'Justificativa do sideboard', interactions: 'Interações e cuidados', adjustments: 'Ajustes sugeridos', rating: 'Avaliação', assessment: 'Justificativa da avaliação' };
export const TYPE_LABELS = { custom: 'Texto Markdown', hands: 'Grupo de mãos iniciais', hand: 'Mão inicial', matchups: 'Grupo de matchups', matchup: 'Matchup', plan: 'Plano geral', variants: 'Grupo de variantes', variant: 'Variante' };

export function createNode(type = 'custom', title) {
  const node = { id: id('section'), type, title: title || TYPE_LABELS[type] || 'Nova seção', fields: { markdown: '' }, children: [] };
  if (type === 'hand') node.fields = { cards: '', turn: 'Play', phase: 'Pré-side', decision: 'Situacional', justification: '' };
  if (type === 'plan') node.fields = { ...Object.fromEntries(Object.keys(PLAN_FIELDS).map(k => [k, ''])), rating: 'Equilibrado' };
  if (type === 'variant') node.fields = { overrides: {} };
  if (type === 'matchup') node.children = [createNode('plan'), createNode('variants', 'Variantes'), createNode('hands', 'Mãos iniciais')];
  return node;
}
export function walkNodes(nodes, ancestors = []) {
  return nodes.flatMap(node => [{ node, ancestors }, ...walkNodes(node.children || [], [...ancestors, node])]);
}
export function locateNode(guide, nodeId) {
  function visit(nodes, parent = null, ancestors = []) {
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      if (node.id === nodeId) return { node, nodes, index, parent, ancestors };
      const found = visit(node.children || [], node, [...ancestors, node]);
      if (found) return found;
    }
    return null;
  }
  return visit(guide.sections);
}
export function containingMatchup(guide, nodeId) {
  const location = locateNode(guide, nodeId);
  return [...(location?.ancestors || []), location?.node].reverse().find(n => n?.type === 'matchup');
}
export function allowedChildren(parent) {
  if (!parent) return ['custom', 'matchups'];
  if (parent.type === 'hands') return ['hand'];
  if (parent.type === 'variants') return ['variant'];
  if (parent.type === 'matchups') return ['matchup', 'custom'];
  if (parent.type === 'matchup') return ['custom', 'hands', 'variants'];
  if (['hand', 'variant', 'plan'].includes(parent.type)) return [];
  return ['custom', 'hands'];
}
export function canContain(parent, node) {
  if (!parent) return !['plan', 'matchup', 'variant', 'hand', 'variants'].includes(node.type);
  return allowedChildren(parent).includes(node.type);
}
export function cloneNode(node) {
  const copy = structuredClone(node);
  function renew(n) { n.id = id('section'); n.children.forEach(renew); }
  renew(copy); copy.title += ' (cópia)'; return copy;
}
export function moveNode(guide, nodeId, parentId) {
  const source = locateNode(guide, nodeId);
  const target = parentId ? locateNode(guide, parentId)?.node : null;
  if (!source || source.node.type === 'plan' || (parentId && !target) || !canContain(target, source.node)) throw new Error('Destino incompatível');
  if (walkNodes([source.node]).some(({ node }) => node.id === parentId)) throw new Error('Não é possível mover para dentro do próprio item');
  source.nodes.splice(source.index, 1);
  (target ? target.children : guide.sections).push(source.node);
}
export function removeNode(guide, nodeId, preserve = false) {
  const location = locateNode(guide, nodeId);
  if (!location || location.node.type === 'plan' || (location.nodes === guide.sections && location.nodes.length === 1)) throw new Error('Este item não pode ser excluído');
  const children = preserve ? location.node.children : [];
  if (children.some(child => !canContain(location.parent, child))) throw new Error('As subseções precisam de um destino compatível');
  location.nodes.splice(location.index, 1, ...children);
  return children[0]?.id || location.parent?.id || guide.sections[0].id;
}
