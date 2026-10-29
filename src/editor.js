import { emptyGuide, createNode, normalizeGuide, envelope, walkNodes, locateNode, allowedChildren, canContain, cloneNode, moveNode, removeNode, containingMatchup, effectivePlan, PLAN_FIELDS, TYPE_LABELS, RATINGS, SCHEMA_VERSION } from './model.js?v=hierarchy-v3';
import { repository, startupProblems } from './storage.js?v=hierarchy-v3';
import { escapeHtml as esc } from './markdown.js?v=hierarchy-v3';
import { validateGuide } from './validation.js?v=hand-images-fix';
import { renderGuide, hydrateCards, exportedHtml, READING_STYLES } from './reading.js?v=hide-empty-sections-v1';
import { afterTyping } from './after-typing.js';
import { parseList } from './deck.js?v=hand-images-fix';
import { downloadMissingCardImages, collectGuideCardNames, findCard, cachedCard } from './cards.js';
import { createTranslationWorkspace } from './translation-ui.js';

const $ = selector => document.querySelector(selector);
let guides = [], activeId, selectedId, previewRevision = 0, pendingDeleteId = null;
const expanded = new Set(), saveTimers = new Map(), undoStack = [], saveInFlight = new Map(), guideRevisions = new Map(), dirtyGuideIds = new Set();
let pendingImportGuides = [];
const UI_KEY = 'sidemaster.editor-selection.v1';
const LAYOUT_KEY = 'sidemaster.workspace-layout.v1';
const workspace = $('.workspace');
let layoutPrefs = { sidebarWidth: 205, previewWidth: 520, sidebarCollapsed: false };
try { if (!repository.isDesktop) layoutPrefs = { ...layoutPrefs, ...JSON.parse(localStorage.getItem(LAYOUT_KEY) || '{}') }; } catch {}
if (!repository.isDesktop && !localStorage.getItem(LAYOUT_KEY) && workspace.clientWidth < 900) layoutPrefs = { ...layoutPrefs, sidebarWidth: 170, previewWidth: 220 };
function applyWorkspaceLayout() {
  const sidebarSize = layoutPrefs.sidebarCollapsed ? 46 : layoutPrefs.sidebarWidth;
  const maxPreview = Math.max(120, workspace.clientWidth - sidebarSize - 12 - 190);
  layoutPrefs.previewWidth = Math.min(layoutPrefs.previewWidth, maxPreview);
  workspace.style.setProperty('--sidebar-width', `${layoutPrefs.sidebarCollapsed ? 46 : layoutPrefs.sidebarWidth}px`);
  workspace.style.setProperty('--preview-width', `${layoutPrefs.previewWidth}px`);
  $('#guide-sidebar').classList.toggle('is-collapsed', layoutPrefs.sidebarCollapsed);
  $('#toggle-sidebar').setAttribute('aria-label', layoutPrefs.sidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral');
  $('#toggle-sidebar').title = layoutPrefs.sidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral';
  $('#toggle-sidebar').textContent = layoutPrefs.sidebarCollapsed ? '›' : '‹';
  $('#show-sidebar').hidden = !layoutPrefs.sidebarCollapsed;
  $('#sidebar-resizer').setAttribute('aria-valuenow', String(layoutPrefs.sidebarWidth));
  $('#preview-resizer').setAttribute('aria-valuenow', String(layoutPrefs.previewWidth));
}
let settingsSave = Promise.resolve();
function saveWorkspaceLayout() {
  if (!repository.isDesktop) { try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(layoutPrefs)); } catch {} return; }
  settingsSave = settingsSave.catch(() => {}).then(() => repository.saveSettings({ layout: { ...layoutPrefs } })).catch(error => { status(`Falha ao salvar preferências: ${error.message}`, 'error'); throw error; });
}
function resizePane(kind, clientX) {
  const rect = workspace.getBoundingClientRect();
  if (kind === 'sidebar') {
    const max = Math.max(150, Math.min(420, rect.width - 12 - 190 - 160));
    layoutPrefs.sidebarWidth = Math.round(Math.max(150, Math.min(max, clientX - rect.left)));
  } else {
    const sidebar = layoutPrefs.sidebarCollapsed ? 46 : layoutPrefs.sidebarWidth;
    const max = Math.max(120, rect.width - sidebar - 12 - 190);
    layoutPrefs.previewWidth = Math.round(Math.max(120, Math.min(max, rect.right - clientX)));
  }
  applyWorkspaceLayout();
}
for (const [id, kind] of [['sidebar-resizer', 'sidebar'], ['preview-resizer', 'preview']]) {
  const handle = $(`#${id}`);
  handle.addEventListener('pointerdown', e => { if (kind === 'sidebar' && layoutPrefs.sidebarCollapsed) return; handle.setPointerCapture(e.pointerId); resizePane(kind, e.clientX); });
  handle.addEventListener('pointermove', e => { if (handle.hasPointerCapture(e.pointerId)) resizePane(kind, e.clientX); });
  handle.addEventListener('pointerup', e => { if (handle.hasPointerCapture(e.pointerId)) { handle.releasePointerCapture(e.pointerId); saveWorkspaceLayout(); } });
  handle.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Home') layoutPrefs[kind === 'sidebar' ? 'sidebarWidth' : 'previewWidth'] = 220;
    else if (e.key === 'End') layoutPrefs[kind === 'sidebar' ? 'sidebarWidth' : 'previewWidth'] = 420;
    else if (kind === 'sidebar') layoutPrefs.sidebarWidth = Math.max(150, Math.min(420, layoutPrefs.sidebarWidth + (e.key === 'ArrowRight' ? 16 : -16)));
    else layoutPrefs.previewWidth = Math.max(120, Math.min(900, layoutPrefs.previewWidth + (e.key === 'ArrowLeft' ? 16 : -16)));
    applyWorkspaceLayout(); saveWorkspaceLayout();
  });
  handle.addEventListener('dblclick', () => { layoutPrefs[kind === 'sidebar' ? 'sidebarWidth' : 'previewWidth'] = kind === 'sidebar' ? 205 : 520; applyWorkspaceLayout(); saveWorkspaceLayout(); });
}
$('#toggle-sidebar').addEventListener('click', () => { layoutPrefs.sidebarCollapsed = !layoutPrefs.sidebarCollapsed; applyWorkspaceLayout(); saveWorkspaceLayout(); });
$('#show-sidebar').addEventListener('click', () => { layoutPrefs.sidebarCollapsed = false; applyWorkspaceLayout(); saveWorkspaceLayout(); });
applyWorkspaceLayout();
window.addEventListener('resize', applyWorkspaceLayout);
const active = () => guides.find(g => g.guideId === activeId);
const selection = () => locateNode(active(), selectedId);
function status(message, kind = '') {
  $('#status').className = `status ${kind}`; $('#status-text').textContent = message;
  if (/^(Salvo|Salvando|Falha ao salvar|Novo guia criado e salvo|Guia criado na sessão|Guia importado e salvo|Guias carregados)/.test(message)) {
    const indicator = $('#header-save-state');
    indicator.dataset.state = kind || 'ok'; indicator.title = message;
    $('#header-save-label').textContent = kind === 'pending' ? 'Salvando…' : kind === 'error' ? 'Falha ao salvar' : repository.isDesktop ? 'Salvo no disco' : 'Salvo localmente';
  }
}
const option = (value, label, current) => `<option value="${esc(value)}" ${value === current ? 'selected' : ''}>${esc(label)}</option>`;
const textarea = (name, label, value = '', rows = 5, extra = '') => `<label>${label}<textarea name="${name}" rows="${rows}" ${extra}>${esc(value)}</textarea></label>`;
const select = (name, label, values, current, extra = '') => `<label>${label}<select name="${name}" ${extra}>${values.map(v => option(v, v, current)).join('')}</select></label>`;

function persistGuide(guide) {
  const revision = Math.max(guideRevisions.get(guide.guideId) || 0, repository.nextRevision(guide.guideId));
  guideRevisions.set(guide.guideId, revision);
  dirtyGuideIds.add(guide.guideId);
  guide.updatedAt = new Date().toISOString();
  const operation = repository.put(structuredClone(guide), revision).then(result => {
    guideRevisions.set(guide.guideId, Math.max(guideRevisions.get(guide.guideId) || 0, result?.revision || revision));
    if (guideRevisions.get(guide.guideId) === revision) dirtyGuideIds.delete(guide.guideId);
    if (activeId === guide.guideId && guideRevisions.get(guide.guideId) === revision) status(`Salvo às ${new Date(guide.updatedAt).toLocaleString('pt-BR')}`, 'ok');
    return result;
  }).catch(error => { dirtyGuideIds.add(guide.guideId); throw error; });
  saveInFlight.set(guide.guideId, operation);
  operation.finally(() => { if (saveInFlight.get(guide.guideId) === operation) saveInFlight.delete(guide.guideId); }).catch(() => {});
  return operation;
}
async function flushGuide(guide) {
  const timer = saveTimers.get(guide.guideId);
  if (timer) { clearTimeout(timer); saveTimers.delete(guide.guideId); }
  return persistGuide(guide);
}
function scheduleSave(guide = active()) {
  dirtyGuideIds.add(guide.guideId);
  clearTimeout(saveTimers.get(guide.guideId));
  status('Salvando…', 'pending');
  saveTimers.set(guide.guideId, setTimeout(async () => {
    saveTimers.delete(guide.guideId);
    try { await persistGuide(guide); }
    catch { status('Falha ao salvar; conteúdo mantido na sessão. Exporte JSON para guardar uma cópia.', 'error'); }
  }, repository.isDesktop ? 300 : 350));
}
function remember() {
  undoStack.push({ guide: structuredClone(active()), selectedId });
  if (undoStack.length > 20) undoStack.shift();
}
function undo() {
  const index = undoStack.findLastIndex(x => x.guide.guideId === activeId);
  if (index < 0) return;
  const previous = undoStack.splice(index, 1)[0];
  clearTimeout(saveTimers.get(activeId));
  guides[guides.findIndex(g => g.guideId === activeId)] = previous.guide;
  selectedId = previous.selectedId;
  revealSelection(); render(); scheduleSave();
}
function revealSelection() { (selection()?.ancestors || []).forEach(n => expanded.add(n.id)); }
function saveSelection() {
  if (repository.isDesktop) { settingsSave = settingsSave.catch(() => {}).then(() => repository.saveSettings({ selection: { guideId: activeId, nodeId: selectedId }, expanded: [...expanded] })).catch(error => { status(`Falha ao salvar preferências: ${error.message}`, 'error'); throw error; }); return; }
  try { localStorage.setItem(UI_KEY, JSON.stringify({ guideId: activeId, nodeId: selectedId })); } catch {}
}
function scrollPanelTo(panel, target, behavior = 'auto') {
  if (!target || !panel.contains(target)) return;
  const toolbar = panel.querySelector('.preview-tools');
  const inset = (toolbar?.offsetHeight || 0) + 16;
  const top = panel.scrollTop + target.getBoundingClientRect().top - panel.getBoundingClientRect().top - panel.clientTop - inset;
  panel.scrollTo({ top: Math.max(0, top), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : behavior });
}
function markPreviewSelection() {
  $('#preview').querySelectorAll('.is-editing').forEach(n => n.classList.remove('is-editing'));
  document.getElementById(`preview-${selectedId}`)?.classList.add('is-editing');
}
function syncPreview(behavior = 'auto') {
  markPreviewSelection();
  scrollPanelTo($('#preview'), document.getElementById(`preview-${selectedId}`), behavior);
}
function previewPosition() {
  const panel = $('#preview'), top = panel.getBoundingClientRect().top;
  const readingLine = top + (panel.querySelector('.preview-tools')?.offsetHeight || 0) + 16;
  const sections = [...panel.querySelectorAll('.guide-section')];
  const anchor = sections.filter(n => { const rect = n.getBoundingClientRect(); return rect.top <= readingLine && rect.bottom > readingLine; }).at(-1)
    || sections.find(n => n.getBoundingClientRect().bottom > readingLine);
  return { id: anchor?.id, offset: anchor ? anchor.getBoundingClientRect().top - top : 0, scrollTop: panel.scrollTop };
}
function restorePreviewPosition(position) {
  const panel = $('#preview'), anchor = position.id ? document.getElementById(position.id) : null;
  panel.scrollTop = anchor ? panel.scrollTop + anchor.getBoundingClientRect().top - panel.getBoundingClientRect().top - position.offset : position.scrollTop;
}
function choose(nodeId) { selectedId = nodeId; revealSelection(); renderOutline(); renderEditor(); saveSelection(); syncPreview('smooth'); }

function renderOutline() {
  function row(node, depth = 0) {
    const hasChildren = node.children.length > 0, canAdd = allowedChildren(node).length > 0;
    const isOpen = expanded.has(node.id);
    return `<li><div class="tree-row ${node.id === selectedId ? 'selected' : ''}" style="--depth:${depth}">${hasChildren ? `<button type="button" class="tree-toggle" data-toggle="${esc(node.id)}" aria-label="${isOpen ? 'Recolher' : 'Expandir'} ${esc(node.title)}" aria-expanded="${isOpen}">${isOpen ? '▾' : '▸'}</button>` : '<span class="tree-spacer"></span>'}<button type="button" class="tree-title" data-select="${esc(node.id)}" ${node.id === selectedId ? 'aria-current="true"' : ''}>${esc(node.title)}</button>${canAdd ? `<button type="button" class="tree-action" data-add="${esc(node.id)}" aria-label="Adicionar em ${esc(node.title)}">＋</button>` : ''}<button type="button" class="tree-action" data-manage="${esc(node.id)}" aria-label="Gerenciar ${esc(node.title)}">⋯</button></div>${hasChildren && isOpen ? `<ul>${node.children.map(child => row(child, depth + 1)).join('')}</ul>` : ''}</li>`;
  }
  $('#outline').innerHTML = `<div class="outline-heading"><strong>Conteúdo do guia</strong><button type="button" id="undo-tree" ${undoStack.some(x => x.guide.guideId === activeId) ? '' : 'disabled'}>Desfazer</button></div><ul class="tree-list">${active().sections.map(n => row(n)).join('')}</ul><button type="button" class="add-root" data-add="">＋ Adicionar seção</button>`;
}
function renderLibrary() {
  const grouped = new Map();
  for (const guide of guides) { if (!grouped.has(guide.archetypeName)) grouped.set(guide.archetypeName, []); grouped.get(guide.archetypeName).push(guide); }
  $('#guide-select').innerHTML = [...grouped].map(([name, items]) => `<optgroup label="${esc(name)}">${items.map(g => option(g.guideId, g.versionLabel, activeId)).join('')}</optgroup>`).join('');
  $('#header-guide-title').textContent = active().title || 'Guia sem título';
  $('#edit-guide-details').title = `${active().title || 'Guia sem título'} — editar informações`;
  $('#header-archetype').textContent = active().archetypeName || 'Sem arquétipo';
  $('#header-version').textContent = active().versionLabel || 'Sem versão';
  $('#header-save-state').title = repository.isDesktop ? 'Guia salvo no perfil local do SideMaster' : 'Guias salvos neste navegador';
  if ($('#library-dialog').open) renderLibraryDialog();
}
function renderLibraryDialog(query = $('#library-search')?.value || '') {
  const dialog = $('#library-dialog');
  if (!dialog) return;
  const needle = query.trim().toLocaleLowerCase('pt-BR');
  const grouped = new Map();
  for (const guide of guides) {
    const terms = [guide.archetypeName, guide.versionLabel, guide.title, guide.author].join(' ').toLocaleLowerCase('pt-BR');
    if (needle && !terms.includes(needle)) continue;
    const key = guide.archetypeName || 'Sem arquétipo';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(guide);
  }
  const groups = [...grouped].sort(([a], [b]) => a.localeCompare(b, 'pt-BR')).map(([archetype, items]) => `
    <section class="library-group"><div class="library-group-heading"><h3>${esc(archetype)}</h3><span>${items.length} ${items.length === 1 ? 'guia' : 'guias'}</span></div>
      <div class="library-guide-list">${items.sort((a,b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || '')).map(g => {
        const sectionCount = walkNodes(g.sections).length;
        const isActive = g.guideId === activeId;
        const date = g.updatedAt || g.createdAt;
        const confirming = pendingDeleteId === g.guideId;
        const canDelete = guides.length > 1;
        return `<article class="library-guide ${isActive ? 'is-active' : ''} ${confirming ? 'is-confirming-delete' : ''}"><div class="library-guide-copy"><div class="library-guide-heading"><strong>${esc(g.title || 'Guia sem título')}</strong><span class="library-version">${esc(g.versionLabel || 'Sem versão')}</span>${isActive ? '<span class="library-current">Aberto</span>' : ''}</div><p>${esc(g.author || 'Sem autoria')} · ${sectionCount} seções${date ? ` · Atualizado em ${new Date(date).toLocaleDateString('pt-BR')}` : ''}</p></div><div class="library-guide-actions"><button type="button" data-library-open="${esc(g.guideId)}">${isActive ? 'Continuar editando' : 'Abrir guia'}</button><button type="button" class="library-manage" data-library-manage="${esc(g.guideId)}" aria-label="Editar informações de ${esc(g.title || 'guia')}">Editar informações</button><button type="button" class="library-delete" data-library-delete="${esc(g.guideId)}" ${canDelete ? '' : 'disabled title="Mantenha pelo menos um guia na biblioteca"'} aria-label="Excluir ${esc(g.title || 'guia')}">Excluir</button></div>${confirming ? `<div class="library-delete-confirm" role="alertdialog" aria-label="Confirmar exclusão"><p>Excluir <strong>${esc(g.title || 'Guia sem título')}</strong> permanentemente? O conteúdo deste guia será removido deste navegador.</p><div><button type="button" data-library-cancel-delete>Cancelar</button><button type="button" class="danger" data-library-confirm-delete="${esc(g.guideId)}">Excluir guia</button></div></div>` : ''}</article>`;
      }).join('')}</div>
    </section>`).join('');
  const storageLabel = repository.isDesktop ? 'no perfil local do aplicativo' : 'neste navegador';
  dialog.innerHTML = `<div class="dialog-heading"><div><h2 id="library-title">Biblioteca de guias</h2><p class="editor-hint">${guides.length} ${guides.length === 1 ? 'guia salvo' : 'guias salvos'} ${storageLabel}, organizados por arquétipo.</p></div><button type="button" data-library-close aria-label="Fechar">×</button></div><div class="library-toolbar"><label class="library-search-label">Buscar guias<input id="library-search" type="search" placeholder="Arquétipo, versão, título ou autoria" value="${esc(query)}"></label><button type="button" id="library-new-guide" class="button">＋ Novo guia</button></div>${groups || '<p class="library-empty">Nenhum guia corresponde à busca.</p>'}`;
}
function openLibrary() { renderLibraryDialog(''); $('#library-dialog').showModal(); $('#library-search').focus(); }
function renderEditor() {
  const g = active(), location = selection();
  if (!location) return;
  const { node, ancestors } = location;
  const matchup = containingMatchup(g, node.id);
  const crumb = [...ancestors, node].map(n => `<button type="button" data-select="${esc(n.id)}">${esc(n.title)}</button>`).join('<span aria-hidden="true">›</span>');
  let fields = '';
  if (node.type === 'main' || node.type === 'sideboard') {
    const zone = node.type === 'main' ? 'main' : 'sideboard';
    fields += textarea(zone, `Lista do ${zone === 'main' ? 'main deck' : 'sideboard'}`, g.deck[zone], 12, 'data-deck="true"');
    fields += '<p class="editor-hint">Use quantidade e nome por linha, como <code>4 [Myr Enforcer]</code>. A prévia agrupa as cartas automaticamente e mostra até quatro cópias em cada pilha.</p>';
  }
  if (node.type === 'hand') {
    fields += `<p class="editor-hint">${matchup ? `Exemplo para ${esc(matchup.title)}.` : 'Exemplo geral do deck, sem adversário definido.'} Informe exatamente sete cartas.</p><div class="inline-fields">${select('turn', 'Posição', ['Play', 'Draw', 'Sempre'], node.fields.turn)}${select('phase', 'Momento', matchup ? ['Pré-side', 'Pós-side', 'Sempre'] : ['Pré-side'], node.fields.phase)}${select('decision', 'Decisão', ['Manter', 'Mulligar', 'Situacional'], node.fields.decision)}</div>${textarea('cards', 'Cartas — quantidade e nome por linha', node.fields.cards, 7)}${textarea('justification', 'Justificativa em Markdown', node.fields.justification)}`;
  } else if (node.type === 'plan' || node.type === 'variant') {
    const variant = node.type === 'variant';
    const plan = variant ? effectivePlan(matchup, node) : node.fields;
    if (variant) fields += '<p class="editor-hint">Os campos usam o plano geral. Marque “Personalizar” somente no que mudar; um campo personalizado vazio remove o texto herdado.</p>';
    fields += Object.entries(PLAN_FIELDS).map(([key, label]) => {
      const overridden = variant && Object.hasOwn(node.fields.overrides || {}, key);
      const extras = variant ? `data-override-field="${key}" ${overridden ? '' : 'disabled'}` : '';
      const field = key === 'rating' ? select(key, label, RATINGS, plan[key], extras) : textarea(key, `${label} (Markdown)`, plan[key], key === 'in' || key === 'out' ? 3 : 4, extras);
      return `<div class="plan-field">${variant ? `<label class="override-switch"><input type="checkbox" data-override="${key}" ${overridden ? 'checked' : ''}> Personalizar ${label.toLowerCase()}</label>` : ''}${field}</div>`;
    }).join('');
  } else {
    fields += textarea('markdown', ['hands', 'variants', 'matchups', 'matchup'].includes(node.type) ? 'Introdução em Markdown (opcional)' : 'Markdown', node.fields.markdown || '', node.children.length ? 6 : 12);
  }
  const children = node.children.length ? `<div class="children-summary"><strong>Subseções (${node.children.length})</strong>${node.children.map(child => `<button type="button" data-select="${esc(child.id)}">${esc(child.title)} <span>→</span></button>`).join('')}</div>` : '';
  $('#editor').innerHTML = `<div class="breadcrumbs" aria-label="Caminho da seção">${crumb}</div><div class="editor-heading"><span class="type-label">${esc(TYPE_LABELS[node.type] || 'Seção')}</span><button type="button" data-manage="${esc(node.id)}">Gerenciar ⋯</button></div><label>Título<input name="title" value="${esc(node.title)}"></label>${fields}${allowedChildren(node).length ? `<button type="button" class="add-child" data-add="${esc(node.id)}">＋ Adicionar ${node.type === 'hands' ? 'mão inicial' : node.type === 'matchups' ? 'matchup ou subseção' : node.type === 'variants' ? 'variante' : 'subseção'}</button>` : ''}${children}`;
}
function renderValidation() {
  const g = active(), result = validateGuide(g);
  $('#validation-details').innerHTML = `<p>Main: ${result.mainCount} · Sideboard: ${result.sideCount} · Matchups: ${walkNodes(g.sections).filter(({node}) => node.type === 'matchup').length}</p>${result.issues.length ? `<ul class="problems">${result.issues.map(issue => `<li><button type="button" data-select="${esc(issue.nodeId || g.sections[0].id)}">${esc(issue.message)}</button></li>`).join('')}</ul>` : '<p class="valid">Nenhum problema básico encontrado.</p>'}`;
}
function cardSectionReference(element) {
  const section = element.closest('.guide-section');
  if (!section) return { id: '', title: 'Guia completo' };
  const title = section.querySelector(':scope > .matchup-heading > :is(h1,h2,h3,h4,h5,h6), :scope > :is(h1,h2,h3,h4,h5,h6)')?.textContent?.trim() || 'Seção';
  const id = section.id.startsWith('preview-') ? section.id.slice('preview-'.length) : '';
  const parents = [];
  let parent = section.parentElement?.closest('.guide-section');
  while (parent) {
    parents.push(parent.querySelector(':scope > .matchup-heading > :is(h1,h2,h3,h4,h5,h6), :scope > :is(h1,h2,h3,h4,h5,h6)')?.textContent?.trim() || 'Seção');
    parent = parent.parentElement?.closest('.guide-section');
  }
  return { id, title: [...parents.reverse(), title].join(' › ') };
}
function collectCardIssues(preview) {
  const failed = preview.querySelectorAll('.card-ref[data-card-status="error"], .card-ref[data-card-status="notfound"], .deck-card-stack[data-deck-status="error"], .deck-card-stack[data-deck-status="notfound"]');
  const issues = new Map();
  for (const element of failed) {
    const name = element.matches('.deck-card-stack') ? element.dataset.deckCard : element.textContent.trim();
    if (!name) continue;
    const key = name.trim().toLocaleLowerCase();
    const status = element.dataset.cardStatus || element.dataset.deckStatus;
    if (!issues.has(key)) issues.set(key, { name, statuses: new Set(), sections: new Map() });
    const issue = issues.get(key), section = cardSectionReference(element);
    issue.statuses.add(status);
    issue.sections.set(`${section.id}:${section.title}`, section);
  }
  return [...issues.values()].sort((a,b) => a.name.localeCompare(b.name, 'pt-BR'));
}
function renderCardIssueNotice(preview) {
  const notice = $('#card-loading-state'), issues = collectCardIssues(preview);
  if (!issues.length) {
    notice.hidden = true; notice.disabled = true; notice.textContent = ''; notice.dataset.state = 'empty';
    return;
  }
  const count = issues.length;
  notice.hidden = false; notice.disabled = false; notice.dataset.state = 'warning';
  notice.textContent = `${count} ${count === 1 ? 'carta não reconhecida ou indisponível' : 'cartas não reconhecidas ou indisponíveis'} · Ver seções`;
}
function showCardIssues() {
  const issues = collectCardIssues($('#preview'));
  const rows = issues.map(issue => {
    const statuses = [...issue.statuses].map(status => status === 'notfound' ? 'Nome não encontrado no Scryfall' : 'Consulta indisponível').join(' · ');
    const sections = [...issue.sections.values()].map(section => `<li>${section.id ? `<button type="button" data-card-issue-select="${esc(section.id)}">${esc(section.title)}</button>` : esc(section.title)}</li>`).join('');
    return `<li class="card-issue"><div class="card-issue-heading"><strong>${esc(issue.name)}</strong><span>${esc(statuses)}</span></div><ul>${sections || '<li>Seção não identificada</li>'}</ul></li>`;
  }).join('');
  const dialog = $('#card-issues-dialog');
  dialog.innerHTML = `<div class="dialog-heading"><h2 id="card-issues-title">Cartas não reconhecidas</h2><button type="button" data-close-card-issues aria-label="Fechar">×</button></div><p class="editor-hint">Cada carta aparece uma vez, com as seções em que foi referenciada. Selecione uma seção para ir até ela no guia.</p>${issues.length ? `<ul class="card-issue-list">${rows}</ul><div class="dialog-options"><button type="button" id="retry-failed-cards" class="button">Tentar consultar novamente</button></div>` : '<p>Nenhuma carta não reconhecida foi encontrada.</p>'}`;
  dialog.showModal();
}
async function hydratePreview(revision, preview) {
  if (revision !== previewRevision) return;
  const position = previewPosition();
  let manuallyScrolled = false;
  const trackScroll = () => { manuallyScrolled = true; };
  preview.addEventListener('scroll', trackScroll, { passive: true });
  const notice = $('#card-loading-state');
  notice.hidden = false; notice.disabled = true; notice.dataset.state = 'loading'; notice.textContent = 'Carregando cartas…';
  hydrateCards(preview).then(() => {
    if (revision !== previewRevision) return;
    if (!manuallyScrolled) restorePreviewPosition(position);
    renderValidation();
    renderCardIssueNotice(preview);
  }).catch(() => {
    if (revision === previewRevision) {
      notice.hidden = false; notice.disabled = true; notice.dataset.state = 'error';
      notice.textContent = 'Não foi possível consultar as cartas.';
    }
  }).finally(() => {
    preview.removeEventListener('scroll', trackScroll);
    $('#refresh-cards').disabled = false;
  });
}
const hydrateAfterTyping = afterTyping((revision, preview) => hydratePreview(revision, preview));
function renderPreview({ sync = false } = {}) {
  const position = previewPosition();
  const revision = ++previewRevision;
  const preview = $('#preview'); preview.innerHTML = '<div class="preview-tools"><div class="preview-toolbar-row"><strong>Guia completo</strong><button type="button" id="sync-preview" title="Ir para a seção selecionada no editor">⌖ Localizar edição</button></div><button type="button" id="card-loading-state" class="card-load-status" aria-live="polite" aria-haspopup="dialog" hidden disabled></button></div>' + renderGuide(active());
  $('#card-loading-state').addEventListener('click', showCardIssues);
  markPreviewSelection();
  if (sync) syncPreview(); else restorePreviewPosition(position);
  hydrateAfterTyping(revision, preview);
}
function render() { renderLibrary(); renderOutline(); renderEditor(); renderValidation(); renderPreview({ sync: true }); saveSelection(); }

function openDialog(title, body) {
  const dialog = $('#tree-dialog');
  if (dialog.open) dialog.close();
  dialog.innerHTML = `<div class="dialog-heading"><h2>${esc(title)}</h2><button type="button" data-close-dialog aria-label="Fechar">×</button></div>${body}`;
  dialog.showModal();
}
async function importOneGuide(raw) {
  const guide = normalizeGuide(raw);
  if (guides.some(existing => existing.guideId === guide.guideId)) throw new Error('Este guia já existe na biblioteca. Nenhum conteúdo foi sobrescrito.');
  await repository.put(guide);
  guides.push(guide); activeId = guide.guideId; selectedId = guide.sections[0].id;
  renderMetadata(); render(); status('Guia importado e salvo', 'ok');
}
function addDialog(parentId) {
  const parent = parentId ? locateNode(active(), parentId)?.node : null;
  openDialog(parent ? `Adicionar em ${parent.title}` : 'Adicionar seção', `<p class="editor-hint">Escolha o tipo de conteúdo.</p><div class="dialog-options">${allowedChildren(parent).map(type => `<button type="button" data-create="${type}" data-parent="${esc(parentId)}">${esc(TYPE_LABELS[type])}<small>${({custom: 'Título e campo Markdown independentes', hands: 'Agrupa exemplos com sete cartas e justificativa', hand: 'Cartas, cenário, decisão e justificativa', matchup: 'Plano geral, variantes e mãos do confronto', matchups: 'Agrupa confrontos por arquétipo adversário', variant: 'Apenas as mudanças em relação ao plano geral', variants: 'Agrupa variantes do confronto'})[type]}</small></button>`).join('')}</div>`);
}
function manageDialog(nodeId) {
  const {node, index, nodes} = locateNode(active(), nodeId);
  const locked = node.type === 'plan';
  openDialog(`Gerenciar ${node.title}`, `<div class="dialog-options"><button type="button" data-rename="${esc(nodeId)}">Renomear</button><button type="button" data-duplicate="${esc(nodeId)}" ${locked ? 'disabled' : ''}>Duplicar com subseções</button><div class="inline-fields"><button type="button" data-reorder="${esc(nodeId)}" data-direction="-1" ${index === 0 ? 'disabled' : ''}>↑ Mover para cima</button><button type="button" data-reorder="${esc(nodeId)}" data-direction="1" ${index === nodes.length - 1 ? 'disabled' : ''}>↓ Mover para baixo</button></div><button type="button" data-move="${esc(nodeId)}" ${locked ? 'disabled' : ''}>Mover para outra seção…</button><button type="button" class="danger" data-delete-options="${esc(nodeId)}" ${locked || (nodes === active().sections && nodes.length === 1) ? 'disabled' : ''}>Excluir…</button></div>${locked ? '<p class="editor-hint">O plano geral pertence ao matchup e é a origem dos campos herdados.</p>' : ''}`);
}
function moveDialog(nodeId) {
  const {node, parent} = locateNode(active(), nodeId);
  const blocked = new Set(walkNodes([node]).map(({node}) => node.id));
  const destinations = [{node: null, ancestors: []}, ...walkNodes(active().sections)].filter(x => !blocked.has(x.node?.id) && x.node?.id !== parent?.id && canContain(x.node, node));
  openDialog(`Mover ${node.title}`, destinations.length ? `<label>Seção de destino<select id="move-destination">${destinations.map(({node: n, ancestors}) => option(n?.id || '', n ? [...ancestors, n].map(x => x.title).join(' › ') : 'Raiz do guia', null)).join('')}</select></label><button type="button" data-confirm-move="${esc(nodeId)}">Mover para este destino</button>` : '<p>Não há outro destino compatível. Crie uma seção ou grupo apropriado primeiro.</p>');
}
function deleteDialog(nodeId) {
  const {node, parent} = locateNode(active(), nodeId);
  const preserve = node.children.length && node.children.every(child => canContain(parent, child));
  openDialog(`Excluir ${node.title}?`, `<p>${node.children.length ? `Este item tem ${walkNodes(node.children).length} descendente(s).` : 'Este item será removido do guia.'} Você poderá desfazer a operação.</p><div class="dialog-options">${preserve ? `<button type="button" data-remove="${esc(nodeId)}" data-preserve="true">Excluir somente este item e preservar subseções</button>` : ''}<button type="button" class="danger" data-remove="${esc(nodeId)}">${node.children.length ? 'Excluir item e todas as subseções' : 'Excluir item'}</button><button type="button" data-close-dialog>Cancelar</button></div>`);
}
function changed(nodeId = selectedId) { selectedId = nodeId; revealSelection(); render(); scheduleSave(); }

document.addEventListener('click', async e => {
  const b = e.target.closest('button, [data-view-card]'); if (!b) return;
  const d = b.dataset;
  try {
    if ('viewCard' in d) {
      e.preventDefault();
      openDialog(`${d.cardQuantity} × ${d.viewCard}`, `<div class="card-detail"><img class="card-detail-image" src="${esc(d.cardImage)}" alt="${esc(d.viewCard)}"><p>${esc(d.cardType)}</p><a href="${esc(d.cardImage)}" target="_blank" rel="noreferrer">Abrir imagem completa ↗</a></div>`);
    }
    else if (b.id === 'sync-preview') syncPreview('smooth');
    else if (b.id === 'retry-failed-cards') {
      b.disabled = true;
      b.textContent = 'Consultando…';
      const issues = collectCardIssues($('#preview'));
      for (const issue of issues) {
        await findCard(issue.name, { force: true });
      }
      await downloadMissingCardImages(issues.map(i => i.name));
      renderPreview();
      hydrateAfterTyping.flush();
      $('#card-issues-dialog').close();
    }
    else if ('cardIssueSelect' in d) { $('#card-issues-dialog').close(); choose(d.cardIssueSelect); }
    else if ('closeCardIssues' in d) { $('#card-issues-dialog').close(); $('#card-loading-state').focus(); }
    else if ('select' in d) choose(d.select);
    else if ('importIndex' in d) {
      const guide = pendingImportGuides[Number(d.importIndex)];
      if (!guide) return;
      pendingImportGuides = []; $('#tree-dialog').close(); await importOneGuide(guide);
    }
    else if ('toggle' in d) { expanded.has(d.toggle) ? expanded.delete(d.toggle) : expanded.add(d.toggle); renderOutline(); saveSelection(); }
    else if ('add' in d) addDialog(d.add);
    else if ('manage' in d) manageDialog(d.manage);
    else if ('closeDialog' in d) $('#tree-dialog').close();
    else if ('create' in d) {
      const parent = d.parent ? locateNode(active(), d.parent)?.node : null;
      if (!allowedChildren(parent).includes(d.create)) return;
      remember(); const node = createNode(d.create); (parent ? parent.children : active().sections).push(node);
      if (parent) expanded.add(parent.id); if (node.children.length) expanded.add(node.id);
      $('#tree-dialog').close(); changed(node.id); $('#editor input[name="title"]').focus(); $('#editor input[name="title"]').select();
    } else if ('rename' in d) { $('#tree-dialog').close(); choose(d.rename); $('#editor input[name="title"]').focus(); $('#editor input[name="title"]').select(); }
    else if ('duplicate' in d) {
      const location = locateNode(active(), d.duplicate); if (location.node.type === 'plan') return;
      remember(); const copy = cloneNode(location.node); location.nodes.splice(location.index + 1, 0, copy);
      $('#tree-dialog').close(); changed(copy.id);
    } else if ('reorder' in d) {
      const location = locateNode(active(), d.reorder), next = location.index + Number(d.direction);
      if (next < 0 || next >= location.nodes.length) return;
      remember(); [location.nodes[location.index], location.nodes[next]] = [location.nodes[next], location.nodes[location.index]];
      $('#tree-dialog').close(); changed(d.reorder);
    } else if ('move' in d) moveDialog(d.move);
    else if ('confirmMove' in d) { remember(); moveNode(active(), d.confirmMove, $('#move-destination').value); $('#tree-dialog').close(); changed(d.confirmMove); }
    else if ('deleteOptions' in d) deleteDialog(d.deleteOptions);
    else if ('remove' in d) {
      remember(); const nextId = removeNode(active(), d.remove, !!d.preserve); $('#tree-dialog').close(); changed(nextId);
    } else if (b.id === 'undo-tree') undo();
  } catch (error) { status(error.message, 'error'); }
});

$('#editor').addEventListener('input', e => {
  const node = selection().node, field = e.target;
  if (field.dataset.override || !field.name) return;
  if (field.name === 'title') { node.title = field.value; renderOutline(); $('#editor .breadcrumbs').querySelectorAll('[data-select]').forEach(b => { if (b.dataset.select === node.id) b.textContent = node.title; }); }
  else if (field.dataset.deck) active().deck[field.name] = field.value;
  else if (node.type === 'variant') { node.fields.overrides ||= {}; node.fields.overrides[field.name] = field.value; }
  else node.fields[field.name] = field.value;
  renderValidation(); renderPreview(); scheduleSave();
});
$('#editor').addEventListener('change', e => {
  if (!e.target.dataset.override) return;
  const node = selection().node, key = e.target.dataset.override;
  node.fields.overrides ||= {};
  if (e.target.checked) node.fields.overrides[key] = effectivePlan(containingMatchup(active(), node.id), node)[key] || '';
  else delete node.fields.overrides[key];
  renderEditor(); renderValidation(); renderPreview(); scheduleSave();
});

$('#refresh-cards').addEventListener('click', async () => {
  const btn = $('#refresh-cards');
  btn.disabled = true;
  const label = btn.querySelector('.refresh-label');
  const originalLabel = label ? label.textContent : '';
  if (label) label.textContent = 'Recarregando cartas…';
  try {
    const guideNames = collectGuideCardNames(active());
    const issueNames = collectCardIssues($('#preview')).map(i => i.name);
    const cardNames = [...new Set([...guideNames, ...issueNames])];
    for (const name of cardNames) {
      const card = cachedCard(name);
      if (!card || card.status === 'error' || card.status === 'notfound') {
        await findCard(name, { force: true });
      }
    }
    if (label) label.textContent = 'Baixando imagens…';
    await downloadMissingCardImages(cardNames, ({ completed, total }) => {
      if (label && total > 0) label.textContent = `Baixando (${completed}/${total})…`;
    });
  } catch (err) {
    console.error(err);
  } finally {
    if (label) label.textContent = originalLabel;
    renderPreview();
    hydrateAfterTyping.flush();
    btn.disabled = false;
  }
});
$('#metadata').addEventListener('input', e => {
  if (!e.target.name) return;
  active()[e.target.name] = e.target.value; renderLibrary(); renderPreview(); scheduleSave();
});
$('#metadata').addEventListener('change', e => {
  if (e.target.name !== 'contentLanguage') return;
  active().contentLanguage = e.target.value; renderPreview(); scheduleSave();
});
function renderMetadata() {
  const g = active();
  const languages = ['pt-BR', 'en', 'es', 'fr', 'de', 'it'];
  $('#metadata').innerHTML = `<details><summary>Informações do guia</summary>${[['archetypeName', 'Arquétipo'], ['versionLabel', 'Versão'], ['title', 'Título do guia'], ['author', 'Autoria'], ['referenceDate', 'Data de referência']].map(([key, title]) => `<label>${title}<input name="${key}" value="${esc(g[key] || '')}" ${key === 'referenceDate' ? 'type="date"' : ''}></label>`).join('')}<label>Idioma do conteúdo<select name="contentLanguage">${[...new Set([...languages, g.contentLanguage || 'pt-BR'])].map(lang => `<option value="${esc(lang)}" ${lang === (g.contentLanguage || 'pt-BR') ? 'selected' : ''}>${esc(lang)}</option>`).join('')}</select></label></details>`;
}
$('#guide-select').addEventListener('change', e => { activeId = e.target.value; selectedId = active().sections[0].id; renderMetadata(); render(); });
async function createGuide() { const g = emptyGuide(); guides.push(g); activeId = g.guideId; selectedId = g.sections[0].id; walkNodes(g.sections).forEach(({node}) => expanded.add(node.id)); renderMetadata(); render(); try { await repository.put(g); status('Novo guia criado e salvo', 'ok'); } catch (error) { status(`Guia criado na sessão, mas não foi salvo: ${error.message}`, 'error'); scheduleSave(g); } }
async function createTranslatedGuide(g) {
  await repository.put(g);
  guides.push(g); activeId = g.guideId; selectedId = g.sections[0].id;
  walkNodes(g.sections).forEach(({node}) => expanded.add(node.id));
  renderMetadata(); render(); status('Cópia traduzida criada e salva', 'ok');
}
function setScreen(screen) {
  const translating = screen === 'translations';
  workspace.hidden = translating; $('#translation-workspace').hidden = !translating;
  $('#open-translations').setAttribute('aria-pressed', String(translating));
  document.body.dataset.screen = screen;
}
const translationWorkspace = createTranslationWorkspace({
  getGuide: active,
  saveGuide: flushGuide,
  createGuide: createTranslatedGuide,
  setScreen,
});
translationWorkspace.setGuideLibraryGetter(async () => guides);
$('#new-guide').addEventListener('click', createGuide);
$('#open-library').addEventListener('click', openLibrary);
$('#library-dialog').addEventListener('input', e => {
  if (e.target.id !== 'library-search') return;
  const start = e.target.selectionStart, end = e.target.selectionEnd, value = e.target.value;
  renderLibraryDialog(value);
  const input = $('#library-search'); input.focus(); input.setSelectionRange(start, end);
});
$('#library-dialog').addEventListener('close', () => { pendingDeleteId = null; });
$('#library-dialog').addEventListener('cancel', () => { pendingDeleteId = null; });
$('#library-dialog').addEventListener('click', async e => {
  const close = e.target.closest('[data-library-close]');
  if (close) { $('#library-dialog').close(); return; }
  const newButton = e.target.closest('#library-new-guide');
  if (newButton) { $('#library-dialog').close(); await createGuide(); return; }
  if (e.target.closest('[data-library-cancel-delete]')) { pendingDeleteId = null; renderLibraryDialog(); return; }
  const deleteButton = e.target.closest('[data-library-delete]');
  if (deleteButton) {
    if (guides.length <= 1) return;
    pendingDeleteId = deleteButton.dataset.libraryDelete; renderLibraryDialog();
    $('#library-dialog').querySelector(`[data-library-confirm-delete="${CSS.escape(pendingDeleteId)}"]`)?.focus({ preventScroll: true }); return;
  }
  const confirmDelete = e.target.closest('[data-library-confirm-delete]');
  if (confirmDelete) {
    const guideId = confirmDelete.dataset.libraryConfirmDelete;
    if (guides.length <= 1) return;
    const deletedWasActive = guideId === activeId;
    clearTimeout(saveTimers.get(guideId)); saveTimers.delete(guideId);
    try {
      const remaining = guides.filter(g => g.guideId !== guideId);
      await repository.delete(guideId); dirtyGuideIds.delete(guideId); guides = remaining; pendingDeleteId = null;
      if (deletedWasActive) { activeId = guides[0].guideId; selectedId = active().sections[0].id; renderMetadata(); render(); }
      else renderLibrary();
      status('Guia excluído da biblioteca', 'ok');
      renderLibraryDialog();
    } catch (error) {
      pendingDeleteId = null; status(`Não foi possível excluir o guia: ${error.message}`, 'error'); renderLibraryDialog();
    }
    return;
  }
  const openButton = e.target.closest('[data-library-open]');
  if (openButton) {
    activeId = openButton.dataset.libraryOpen; selectedId = active().sections[0].id;
    $('#library-dialog').close(); renderMetadata(); render(); status('Guia aberto', 'ok'); return;
  }
  const manageButton = e.target.closest('[data-library-manage]');
  if (manageButton) {
    activeId = manageButton.dataset.libraryManage; selectedId = active().sections[0].id;
    $('#library-dialog').close(); renderMetadata(); render();
    const details = $('#metadata details'); details.open = true;
    scrollPanelTo($('.form-pane'), $('#metadata'), 'smooth');
    $('#metadata input[name="archetypeName"]').focus({ preventScroll: true });
  }
});
$('#library-dialog').addEventListener('click', e => { if (e.target === $('#library-dialog')) $('#library-dialog').close(); });

function download(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function exportFile(guide, format, content) {
  if (!repository.isDesktop) {
    const extension = format === 'json' ? 'json' : 'html';
    download(content, `${guide.title || 'guia'}${format === 'patreon' ? '-patreon' : ''}.${extension}`, format === 'json' ? 'application/json' : 'text/html');
    return { canceled: false };
  }
  return repository.desktop.files.exportGuide(guide, format, content);
}
$('#export-json').addEventListener('click', async () => {
  const guide = structuredClone(active());
  try {
    const result = await exportFile(guide, 'json', JSON.stringify(envelope([guide]), null, 2));
    if (!result.canceled) status('Cópia editável do guia exportada', 'ok');
  } catch (error) { status(`Falha ao exportar JSON: ${error.message}`, 'error'); }
});
for (const [buttonId, patreon] of [['export-html', false], ['export-patreon', true]]) {
  $(`#${buttonId}`).addEventListener('click', async () => {
    const button = $(`#${buttonId}`); button.disabled = true; const guide = structuredClone(active());
    try { const html = await exportedHtml(guide, patreon); const result = await exportFile(guide, patreon ? 'patreon' : 'html', html); if (!result.canceled) status(patreon ? 'HTML Patreon exportado com toda a hierarquia' : 'HTML exportado com toda a hierarquia', 'ok'); }
    catch (error) { status(`Falha na exportação: ${error.message}`, 'error'); }
    finally { button.disabled = false; }
  });
}
$('#export-pdf').addEventListener('click', async () => {
  if (repository.isDesktop) {
    const guide = structuredClone(active());
    try {
      const html = await exportedHtml(guide, false, { embedCachedImages: true });
      const result = await repository.desktop.files.exportPdf(guide, html);
      if (!result.canceled) status('PDF A4 exportado', 'ok');
    } catch (error) { status(`Falha ao exportar PDF: ${error.message}`, 'error'); }
    return;
  }
  const popup = window.open('', '_blank');
  if (!popup) { status('Permita popups para imprimir o PDF', 'error'); return; }
  try {
    popup.document.write(await exportedHtml(structuredClone(active()))); popup.document.close();
    await Promise.all([...popup.document.images].map(img => img.decode().catch(() => {})));
    popup.focus(); popup.print();
  } catch (error) { status(`Falha na impressão: ${error.message}`, 'error'); }
});
$('#import-json').addEventListener('change', async e => {
  try {
    if (!e.target.files[0]) return;
    const data = JSON.parse(await e.target.files[0].text());
    if (Number(data.schemaVersion || 1) > SCHEMA_VERSION) throw new Error('Versão de arquivo ainda não suportada');
    const imported = data.guides || [data];
    if (!imported.length) throw new Error('Nenhum guia no arquivo');
    if (imported.length > 1) {
      pendingImportGuides = imported;
      openDialog('Escolha um guia para importar', `<p>Este arquivo contém ${imported.length} guias. Importe somente um por operação.</p><div class="dialog-options">${imported.map((g, i) => `<button type="button" data-import-index="${i}">${esc(g.title || g.archetypeName || `Guia ${i + 1}`)}<small>${esc(g.archetypeName || '')} · ${esc(g.versionLabel || '')}</small></button>`).join('')}<button type="button" data-close-dialog>Cancelar</button></div>`);
    } else await importOneGuide(imported[0]);
  } catch (error) { status(`Importação inválida: ${error.message}`, 'error'); }
  finally { e.target.value = ''; }
});
$('#editor').addEventListener('submit', e => e.preventDefault());
$('#import-guide').addEventListener('click', async event => {
  if (!repository.isDesktop) { $('#import-json').click(); return; }
  event.preventDefault();
    try {
      const result = await repository.desktop.files.importGuide();
      if (result.canceled) return;
      const data = result.data;
      if (Number(data.schemaVersion || 1) > SCHEMA_VERSION) throw new Error('Versão de arquivo ainda não suportada');
      const imported = data.guides || [data];
      if (!imported.length) throw new Error('Nenhum guia encontrado');
      if (imported.length > 1) {
        pendingImportGuides = imported;
        openDialog('Escolha um guia para importar', `<p>Este arquivo contém ${imported.length} guias. Importe somente um por operação.</p><div class="dialog-options">${imported.map((g, i) => `<button type="button" data-import-index="${i}">${esc(g.title || g.archetypeName || `Guia ${i + 1}`)}<small>${esc(g.archetypeName || '')} · ${esc(g.versionLabel || '')}</small></button>`).join('')}<button type="button" data-close-dialog>Cancelar</button></div>`);
      } else await importOneGuide(imported[0]);
    } catch (error) { status(`Importação inválida: ${error.message}`, 'error'); }
});
$('#edit-guide-details').addEventListener('click', () => {
  const details = $('#metadata details'); details.open = true;
  scrollPanelTo($('.form-pane'), $('#metadata'), 'smooth');
  $('#metadata input[name="title"]').focus({ preventScroll: true });
});
const exportMenu = $('#export-menu');
exportMenu.addEventListener('click', e => { if (e.target.closest('.export-option')) { exportMenu.open = false; exportMenu.querySelector('summary').focus(); } });
document.addEventListener('click', e => { if (!exportMenu.contains(e.target)) exportMenu.open = false; });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && exportMenu.open) { exportMenu.open = false; exportMenu.querySelector('summary').focus(); } });
async function boot() {
  const style = document.createElement('style'); style.textContent = READING_STYLES; document.head.append(style);
  try {
    const storedSettings = await repository.loadSettings();
    if (repository.isDesktop) {
      layoutPrefs = { ...layoutPrefs, ...(storedSettings.layout || {}) };
      applyWorkspaceLayout();
      for (const id of storedSettings.expanded || []) expanded.add(id);
    }
    guides = await repository.list();
    if (!guides.length) {
      const initial = emptyGuide(); guides = [initial];
      if (repository.isDesktop) {
        try { await repository.put(initial); }
        catch (error) { startupProblems.push(`Novo guia em memória; o disco recusou o primeiro salvamento: ${error.message}`); dirtyGuideIds.add(initial.guideId); }
      }
    }
    // Persist the normalized schema only after every legacy guide was successfully read.
    let previous;
    try { previous = repository.isDesktop ? storedSettings.selection : JSON.parse(localStorage.getItem(UI_KEY) || 'null'); } catch {}
    activeId = guides.some(g => g.guideId === previous?.guideId) ? previous.guideId : guides[0].guideId;
    selectedId = locateNode(active(), previous?.nodeId) ? previous.nodeId : active().sections[0].id;
    if (!repository.isDesktop || !storedSettings.expanded?.length) guides.forEach(g => walkNodes(g.sections).forEach(({node}) => expanded.add(node.id)));
    revealSelection(); renderMetadata(); render();
    status(startupProblems.length ? startupProblems.join(' ') : repository.isDesktop ? 'Guias carregados do perfil SideMaster' : 'Salvo localmente', startupProblems.length ? 'error' : 'ok');
  } catch (error) { status(`Não foi possível abrir os guias: ${error.message}. Os dados originais foram preservados.`, 'error'); }
}
if (repository.isDesktop) {
  repository.desktop.onPrepareClose(async () => {
    document.body.dataset.closing = 'true';
    workspace.inert = true;
    $('#translation-workspace').inert = true;
    document.querySelector('.topbar').inert = true;
    const dirtyIds = new Set([...dirtyGuideIds, ...saveTimers.keys(), ...saveInFlight.keys()]);
    try {
      await translationWorkspace.prepareClose();
      for (const id of dirtyGuideIds) dirtyIds.add(id);
      for (const id of dirtyIds) {
        const timer = saveTimers.get(id);
        if (timer) { clearTimeout(timer); saveTimers.delete(id); }
        const guide = guides.find(item => item.guideId === id);
        if (guide) persistGuide(guide);
      }
      await Promise.all([...saveInFlight.values()]);
      await settingsSave;
      await repository.saveSettings({ selection: { guideId: activeId, nodeId: selectedId }, expanded: [...expanded], layout: { ...layoutPrefs } });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: `Não foi possível confirmar todas as gravações: ${error.message}`, snapshots: [...dirtyIds].map(id => ({ guide: structuredClone(guides.find(g => g.guideId === id)), revision: guideRevisions.get(id) || 0 })).filter(item => item.guide) };
    }
  });
  repository.desktop.onCloseFailed(message => {
    workspace.inert = false;
    $('#translation-workspace').inert = false;
    document.querySelector('.topbar').inert = false;
    delete document.body.dataset.closing;
    status(message || 'O fechamento foi cancelado; suas edições continuam no editor.', 'error');
  });
}
boot();
