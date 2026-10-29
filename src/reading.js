import { containingMatchup, effectivePlan, PLAN_FIELDS } from './model.js?v=hierarchy-v3';
import { parseList } from './deck.js?v=hand-images-fix';
import { renderMarkdown, escapeHtml as esc } from './markdown.js?v=hierarchy-v3';
import { findCard, cachedCard } from './cards.js';
import { renderDeckBoard, renderDeckContents, DECK_VISUAL_STYLES } from './deck-visual.js?v=visual-deck';

export const READING_STYLES = DECK_VISUAL_STYLES + `
body{font:16px system-ui,sans-serif;color:#20202a;line-height:1.55;margin:0}
.guide-document{max-width:900px;margin:auto;padding:1.5rem}h1,h2,h3,h4,h5,h6{line-height:1.25}
.guide-section{border-top:1px solid #e4dfe8;padding:1rem 0;scroll-margin-top:1rem}
.guide-section .guide-section{border:0;padding:.6rem 0}.meta,.empty-note{color:#767080}
.card-ref{color:#623886;text-decoration:underline dotted;cursor:help}.card-image{width:180px;max-width:100%;border-radius:5%}
.card-inline-image{display:inline-block;vertical-align:top;width:120px;max-width:calc(100% / 7);margin-right:-16px}
.card-strip{display:flex;align-items:flex-start;isolation:isolate;margin:1rem 0;padding:0 0 .5rem;max-width:100%}
.card-slot{display:block;flex:0 0 calc(100% / 6);max-width:140px;min-width:0;position:relative;z-index:1;padding:0;color:inherit;text-decoration:none;border:0;background:none}
.card-slot+.card-slot{margin-left:calc(-100% / 36)}.card-slot img{display:block;width:100%;max-width:100%;border-radius:5%;transition:transform .15s;box-shadow:0 1px 3px #0003}
.card-slot:hover,.card-slot:focus-within{z-index:5}.card-slot:hover img,.card-slot:focus-within img{transform:translateY(-8px) scale(1.35)}
.hand-meta{font-size:.9rem;color:#65556e}.hand-count{margin-left:.5rem}.problems{color:#9a2525}.valid{color:#18743a}
.deck-entry{display:inline-flex;vertical-align:top;flex-direction:column;width:110px;margin-right:-16px;position:relative;background:#fff;border-radius:6px;border:1px solid #ddd;padding:4px;font-size:12px}
.deck-entry img{width:100%;border-radius:5%}.deck-entry:hover{z-index:3}.deck-type{margin-bottom:1rem}.deck-type h4{margin:.5rem 0}
.plan-rating{font-weight:600}.variant-note{font-size:.9rem;color:#767080}
.matchup-heading{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px 16px;margin:.5rem 0 1.1rem}.matchup-heading>:is(h2,h3,h4,h5,h6){margin:0;min-width:0;overflow-wrap:anywhere}.matchup-rating{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;border:1px solid #ddd4e6;background:#f4eff8;color:#735387;font-size:11px;line-height:1.4;font-weight:600;white-space:nowrap;flex-shrink:0}.rating-dot{width:5px;height:5px;border-radius:50%;background:currentColor}.matchup-rating[data-tone='favorable']{background:#edf8f1;border-color:#cce4d6;color:#31734b}.matchup-rating[data-tone='unfavorable']{background:#fff0ed;border-color:#eed0c9;color:#a44c3e}.matchup-rating[data-tone='neutral']{background:#faf6e9;border-color:#e7dfc0;color:#8a7334}
.sideboard-transfers{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;margin:1.2rem 0 1.4rem}.sideboard-transfer{padding:16px 17px;border:1px solid;border-top-width:3px;border-radius:10px;min-width:0;break-inside:avoid}.sideboard-transfer--in{background:#f0f8f3;border-color:#cfe5d6;border-top-color:#5c9c74;color:#346b48}.sideboard-transfer--out{background:#fff3f0;border-color:#efd7d1;border-top-color:#c87565;color:#984d40}.transfer-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.transfer-title{display:flex;flex-wrap:wrap;align-items:baseline;gap:7px}.transfer-title>:is(h2,h3,h4,h5,h6){font-size:15px;margin:0!important;font-weight:650;color:inherit}.transfer-count{font-size:10px;opacity:.75;white-space:nowrap}.transfer-arrow{font-size:23px;line-height:1;display:grid;place-items:center;width:31px;height:31px;border-radius:8px;background:#ffffff80;border:1px solid #00000009;flex-shrink:0}.transfer-content{font-size:13px;line-height:1.8;overflow-wrap:anywhere}.transfer-content>:first-child{margin-top:0}.transfer-content>:last-child{margin-bottom:0}.sideboard-transfer--in .card-ref{color:#31734b}.sideboard-transfer--out .card-ref{color:#a44c3e}.transfer-empty{font-size:12px;opacity:.7;margin:0}.plan-text{margin:1.1rem 0}.plan-text>:is(h2,h3,h4,h5,h6){font-size:13px;margin:0 0 .5rem;color:#76617f}.plan-text p{margin:.4rem 0;font-size:14px;line-height:1.7}
.matchup-heading{justify-content:flex-start;column-gap:12px}
@media(max-width:420px){.sideboard-transfers{gap:8px}.sideboard-transfer{padding:11px 10px}.transfer-heading{gap:4px}.transfer-title>:is(h2,h3,h4,h5,h6){font-size:13px}.transfer-arrow{width:25px;height:25px;font-size:20px}.transfer-content{font-size:11px}.transfer-count{font-size:9px}.matchup-rating{font-size:10px}.matchup-heading{align-items:flex-start}}
@media print{@page{size:A4;margin:16mm}.guide-document{padding:0;max-width:none}.card-strip{break-inside:avoid}.card-slot img,.card-slot:hover img{transform:none}.guide-section{break-inside:auto}h1,h2,h3,h4,h5,h6{break-after:avoid}.deck-entry{width:90px}}
`;

const heading = (text, depth) => `<h${Math.min(depth, 6)}>${esc(text)}</h${Math.min(depth, 6)}>`;
function markdown(text, depth) {
  return renderMarkdown(text || '').replace(/<(\/?)(h)([234])>/g, (_, end, h, n) => `<${end}h${Math.min(6, depth + Number(n) - 2)}>`);
}
function cardSlot(name, guide) {
  return `<a class="card-slot" href="https://scryfall.com/search?q=${encodeURIComponent(`!"${name}"`)}" target="_blank" rel="noreferrer" aria-label="${languageOf(guide) === 'pt' ? 'Ver' : 'View'} ${esc(name)}"><span class="card-ref card-direct">${esc(name)}</span></a>`;
}
const hasContent = value => typeof value === 'string' && value.trim().length > 0;
const ENGLISH = {
  strategy: 'Strategy', in: 'In', out: 'Out', justification: 'Sideboard justification', interactions: 'Interactions and cautions', adjustments: 'Suggested adjustments', assessment: 'Assessment justification',
  rating: 'Rating', card: 'card', cards: 'cards', none: 'No cards indicated.', variant: 'General plan with these variant adjustments.', evaluation: 'Rating',
  play: 'Play', draw: 'Draw', always: 'Always', pre: 'Pre-sideboard', post: 'Post-sideboard', keep: 'Keep', mulligan: 'Mulligan', situational: 'Situational',
  recognized: 'Recognized card', notFound: 'not found', unavailable: 'unavailable', loading: 'Loading image', legality: 'legality pending',
};
const languageOf = guide => (guide?.contentLanguage || guide?.lang || 'pt-BR').toLowerCase().split('-')[0];
const textFor = (guide, key, pt) => languageOf(guide) === 'pt' ? pt : ENGLISH[key] || pt;
const ratingForReader = (value, guide) => {
  if (languageOf(guide) === 'pt') return value || 'Equilibrado';
  const values = { 'Muito favorável': 'Very favorable', 'Favorável': 'Favorable', 'Levemente favorável': 'Slightly favorable', 'Equilibrado': 'Even', 'Levemente desfavorável': 'Slightly unfavorable', 'Desfavorável': 'Unfavorable', 'Muito desfavorável': 'Very unfavorable' };
  return values[value] || value || 'Even';
};
const PLAN_CONTENT_FIELDS = ['strategy', 'in', 'out', 'justification', 'interactions', 'adjustments', 'assessment'];
const planHasContent = plan => PLAN_CONTENT_FIELDS.some(key => hasContent(plan?.[key]));
function ratingBadge(value, guide) {
  const rating = ratingForReader(value, guide);
  const tone = /desfavorável|unfavorable/i.test(rating) ? 'unfavorable' : /favorável|favorable/i.test(rating) ? 'favorable' : 'neutral';
  return `<span class="matchup-rating" data-tone="${tone}" aria-label="${esc(textFor(guide, 'evaluation', 'Avaliação'))}: ${esc(rating)}"><span class="rating-dot" aria-hidden="true"></span>${esc(rating)}</span>`;
}
function planHtml(plan, depth, guide) {
  const fieldNames = languageOf(guide) === 'pt' ? PLAN_FIELDS : { ...PLAN_FIELDS, strategy: 'Strategy', in: 'In', out: 'Out', justification: 'Sideboard justification', interactions: 'Interactions and cautions', adjustments: 'Suggested adjustments', assessment: 'Assessment justification' };
  const textBlock = key => hasContent(plan[key]) ? `<div class="plan-text">${heading(fieldNames[key], depth)}${markdown(plan[key], depth + 1)}</div>` : '';
  const transfer = (key, label, arrow) => {
    const entries = parseList(plan[key] || '');
    const count = entries.length && entries.every(e => !e.error) ? entries.reduce((sum,e) => sum + e.quantity,0) : null;
    const localizedLabel = key === 'in' ? textFor(guide, 'in', label) : textFor(guide, 'out', label);
    return `<div class="sideboard-transfer sideboard-transfer--${key}"><div class="transfer-heading"><div class="transfer-title">${heading(localizedLabel,depth)}${count !== null ? `<span class="transfer-count">${count} ${count === 1 ? textFor(guide, 'card', 'carta') : textFor(guide, 'cards', 'cartas')}</span>` : ''}</div><span class="transfer-arrow" aria-hidden="true">${arrow}</span></div><div class="transfer-content">${hasContent(plan[key]) ? markdown(plan[key],depth+1) : `<p class="transfer-empty">${textFor(guide, 'none', 'Nenhuma carta indicada.')}</p>`}</div></div>`;
  };
  const transfers = hasContent(plan.in) || hasContent(plan.out) ? `<div class="sideboard-transfers">${transfer('in','Entram','↗')}${transfer('out','Saem','↘')}</div>` : '';
  return `${textBlock('strategy')}${transfers}${['justification','interactions','adjustments','assessment'].map(textBlock).join('')}`;
}
export function renderGuide(guide, { idPrefix = 'preview-' } = {}) {
  function section(node, depth = 2) {
    let body = '';
    if (node.type === 'main' || node.type === 'sideboard') {
      const zone = node.type === 'main' ? 'main' : 'sideboard';
      if (hasContent(guide.deck[zone])) body += renderDeckBoard({ zone, list: guide.deck[zone] || '', archetypeName: guide.archetypeName, versionLabel: guide.versionLabel, headingLevel: depth + 1, language: guide.contentLanguage || 'pt-BR' }, cachedCard);
    }
    if (node.type === 'plan' && planHasContent(node.fields)) body += planHtml(node.fields, depth + 1, guide);
    else if (node.type === 'variant') {
      const plan = effectivePlan(containingMatchup(guide, node.id), node);
      if (planHasContent(plan)) body += `<p class="variant-note">${textFor(guide, 'variant', 'Plano geral com os ajustes desta variante.')}</p>` + planHtml(plan, depth + 1, guide);
    } else if (node.type === 'hand' && (hasContent(node.fields.cards) || hasContent(node.fields.justification))) {
      const entries = parseList(node.fields.cards || '');
      const names = entries.flatMap(e => e.error ? [] : Array.from({ length: Math.min(e.quantity, 60) }, () => e.name));
      const terms = { Sempre: textFor(guide, 'always', 'Sempre'), Play: textFor(guide, 'play', 'Play'), Draw: textFor(guide, 'draw', 'Draw'), 'Pré-side': textFor(guide, 'pre', 'Pré-side'), 'Pós-side': textFor(guide, 'post', 'Pós-side'), Manter: textFor(guide, 'keep', 'Manter'), Mulligar: textFor(guide, 'mulligan', 'Mulligar'), Situacional: textFor(guide, 'situational', 'Situacional') };
      body += `<p class="hand-meta">${esc(terms[node.fields.turn] || node.fields.turn)} · ${esc(terms[node.fields.phase] || node.fields.phase)} · ${esc(terms[node.fields.decision] || node.fields.decision)} <span class="hand-count ${names.length === 7 ? 'valid' : 'problems'}">${names.length}/7 ${textFor(guide, names.length === 1 ? 'card' : 'cards', names.length === 1 ? 'carta' : 'cartas')}</span></p><div class="card-strip">${names.map(name => cardSlot(name, guide)).join('')}</div>${markdown(node.fields.justification, depth + 1)}`;
    }
    if (hasContent(node.fields.markdown)) body += markdown(node.fields.markdown, depth + 1);
    body += node.children.map(child => section(child, depth + 1)).filter(Boolean).join('');
    if (!body.trim()) return '';
    const rated = node.type === 'matchup' || node.type === 'variant';
    const rating = rated ? effectivePlan(node.type === 'matchup' ? node : containingMatchup(guide,node.id), node.type === 'variant' ? node : null).rating : null;
    const title = rated ? `<div class="matchup-heading">${heading(node.title,depth)}${ratingBadge(rating, guide)}</div>` : heading(node.title,depth);
    return `<section class="guide-section${node.type === 'matchup' ? ' matchup-section' : ''}" id="${esc(idPrefix + node.id)}" data-guide-node="${esc(node.id)}">${title}${body}</section>`;
  }
  const language = guide.contentLanguage || 'pt-BR';
  const direction = /^(ar|fa|he|ur)(-|$)/i.test(language) ? 'rtl' : 'ltr';
  return `<article class="guide-document" lang="${esc(language)}" dir="${direction}"><h1>${esc(guide.title)}</h1><p class="meta">${esc(guide.archetypeName)} · ${esc(guide.versionLabel)}</p>${guide.sections.map(s => section(s)).join('')}</article>`;
}

export async function hydrateCards(root) {
  const english = languageOf(root.querySelector('.guide-document')) !== 'pt';
  await Promise.all([...root.querySelectorAll('.card-ref')].map(async ref => {
    const name = ref.textContent.trim();
    ref.dataset.cardStatus = 'pending';
    ref.title = `${english ? 'Loading image' : 'Carregando imagem'}: ${name}`;
    const card = await findCard(name);
    ref.dataset.cardStatus = card.status;
    ref.dataset.cardLegality = card.legalityPending ? 'pending' : (card.legalityStatus || 'current');
    ref.title = card.status === 'found' ? `${english ? 'Recognized card' : 'Carta reconhecida'}: ${card.name}${card.legalityPending ? (english ? ' (legality pending)' : ' (legalidade pendente)') : ''}` : `${english ? 'Card' : 'Carta'} ${card.status === 'notfound' ? (english ? 'not found' : 'não encontrada') : (english ? 'unavailable' : 'indisponível')}: ${name}. ${english ? 'Edit the name to retry the lookup.' : 'Altere o nome para fazer uma nova consulta.'}`;
    if (ref.classList.contains('card-direct') && card.image) {
      const image = document.createElement('img'); image.className = 'card-image';
      image.alt = card.name; image.src = card.image;
      if (card.remoteImage) image.dataset.remoteSrc = card.remoteImage;
      ref.replaceWith(image);
      image.addEventListener('error', () => {
        const fallback = document.createElement('span');
        fallback.className = 'card-image-error'; fallback.textContent = card.name;
        fallback.title = english ? 'The image could not be loaded. The card remains identified by name.' : 'A imagem não carregou. A carta continua identificada pelo nome.';
        image.replaceWith(fallback);
      }, { once: true });
    }
  }));
  // A paragraph made entirely of direct images is a horizontal hand, even across line breaks.
  root.querySelectorAll('p').forEach(p => {
    if (p.querySelector('img') && [...p.childNodes].every(n => n.nodeType === 3 ? !n.textContent.trim() : ['IMG', 'BR'].includes(n.tagName))) {
      p.classList.add('card-strip');
      p.querySelectorAll('br').forEach(br => br.remove());
      p.querySelectorAll('img').forEach(img => { const slot = document.createElement('span'); slot.className = 'card-slot'; slot.tabIndex = 0; img.replaceWith(slot); slot.append(img); });
    } else p.querySelectorAll(':scope > img').forEach(img => img.classList.add('card-inline-image'));
  });
  for (const deck of root.querySelectorAll('.deck-visual')) {
    const options = { zone: deck.dataset.deckZone, list: deck.dataset.deckList, archetypeName: deck.dataset.deckArchetype, versionLabel: deck.dataset.deckVersion, headingLevel: Number(deck.dataset.deckHeading), language: deck.dataset.deckLanguage };
    const names = [...new Set(parseList(options.list).filter(e => !e.error).map(e => e.name))];
    const results = new Map(await Promise.all(names.map(async name => [name, await findCard(name)])));
    if (root.contains(deck)) deck.innerHTML = renderDeckContents(options, name => results.get(name));
  }
}

export async function exportedHtml(guide, patreon = false, { embedCachedImages = false } = {}) {
  const root = document.createElement('div'); root.innerHTML = renderGuide(guide);
  await hydrateCards(root);
  for (const img of root.querySelectorAll('img')) {
    if (embedCachedImages && img.src.startsWith('blob:')) {
      try {
        const blob = await fetch(img.src).then(response => response.blob());
        const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
        img.src = dataUrl;
      } catch { img.replaceWith(Object.assign(document.createElement('span'), { className: 'card-image-error', textContent: img.alt || 'Imagem indisponível' })); }
    } else if (!embedCachedImages && img.dataset.remoteSrc) img.src = img.dataset.remoteSrc;
  }
  root.querySelectorAll('.card-ref').forEach(ref => {
    const a = document.createElement('a'); a.textContent = ref.textContent;
    a.href = `https://scryfall.com/search?q=${encodeURIComponent(`!"${ref.textContent.trim()}"`)}`; ref.replaceWith(a);
  });
  if (patreon) {
    // Patreon receives one full image and the quantity, without CSS-dependent stacks.
    root.querySelectorAll('.deck-stack-faces').forEach(stack => [...stack.children].slice(0,-1).forEach(copy => copy.remove()));
    root.querySelectorAll('.deck-cover,.deck-mana-curve').forEach(el => el.remove());
    root.querySelectorAll('*').forEach(el => [...el.attributes].forEach(a => { if (!['href', 'src', 'alt', 'title', 'lang', 'dir'].includes(a.name)) el.removeAttribute(a.name); }));
    return root.innerHTML;
  }
  const language = guide.contentLanguage || 'pt-BR';
  const direction = /^(ar|fa|he|ur)(-|$)/i.test(language) ? 'rtl' : 'ltr';
  return `<!doctype html><html lang="${esc(language)}" dir="${direction}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(guide.title)}</title><style>${READING_STYLES}</style></head><body>${root.innerHTML}</body></html>`;
}
