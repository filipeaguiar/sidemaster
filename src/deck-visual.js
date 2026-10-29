import { parseList, aggregate } from './deck.js?v=hand-images-fix';
import { escapeHtml as esc } from './markdown.js?v=hierarchy-v3';

export const GROUP_ORDER = ['Criaturas', 'Artefatos', 'Encantamentos', 'Mágicas Instantâneas', 'Feitiços', 'Planeswalkers', 'Batalhas', 'Terrenos', 'Outros', 'A identificar'];
export function cardGroup(card) {
  if (!card || card.status !== 'found') return 'A identificar';
  const type = card.type || '';
  for (const [pattern, group] of [[/land/i,'Terrenos'],[/creature/i,'Criaturas'],[/instant/i,'Mágicas Instantâneas'],[/sorcery/i,'Feitiços'],[/enchantment/i,'Encantamentos'],[/planeswalker/i,'Planeswalkers'],[/battle/i,'Batalhas'],[/artifact/i,'Artefatos']]) if (pattern.test(type)) return group;
  return 'Outros';
}
export function deckComposition(list, lookup = () => null) {
  const identities = new Map();
  for (const entry of aggregate(parseList(list))) {
    const card = lookup(entry.name);
    const key = card?.identity || entry.name.toLowerCase();
    if (identities.has(key)) identities.get(key).quantity += entry.quantity;
    else identities.set(key, { ...entry, card });
  }
  const entries = [...identities.values()];
  const groups = GROUP_ORDER.map(name => ({ name, entries: [], count: 0 }));
  const curve = Array(8).fill(0), colors = new Set();
  let recognized = 0;
  for (const entry of entries) {
    const card = entry.card;
    const group = groups.find(g => g.name === cardGroup(card));
    group.entries.push({ ...entry, card }); group.count += entry.quantity;
    if (card?.status === 'found') {
      recognized += entry.quantity;
      (card.colors || []).forEach(c => colors.add(c));
      if (group.name !== 'Terrenos' && Number.isFinite(card.manaValue)) curve[Math.min(7, Math.max(0, Math.floor(card.manaValue)))] += entry.quantity;
    }
  }
  return { entries, total: entries.reduce((sum,e) => sum + e.quantity, 0), groups: groups.filter(g => g.entries.length), curve, colors: ['W','U','B','R','G'].filter(c => colors.has(c)), recognized };
}
function stack(entry, english = false) {
  const { card, name, quantity } = entry;
  const copies = Math.min(quantity, 4);
  const image = card?.image;
  const status = card?.status || 'pending';
  const unavailable = status === 'error' ? (english ? 'Lookup unavailable' : 'Consulta indisponível') : status === 'notfound' ? (english ? 'Card not found' : 'Carta não encontrada') : (english ? 'Loading card' : 'Carregando carta');
  const faces = Array.from({length:copies},(_,index) => image
    ? `<a class="deck-copy" style="--copy:${index}" href="${esc(image)}" target="_blank" rel="noreferrer" data-view-card="${esc(name)}" data-card-image="${esc(image)}" data-card-type="${esc(card.type || '')}" data-card-quantity="${quantity}" aria-label="Ampliar ${esc(name)}, ${quantity} cópias" ${index < copies - 1 ? 'tabindex="-1" aria-hidden="true"' : ''}><img src="${esc(image)}" alt="${esc(card.name || name)}" width="488" height="680" decoding="async"></a>`
    : `<div class="deck-copy deck-copy-placeholder" style="--copy:${index}" ${index < copies - 1 ? 'aria-hidden="true"' : ''}><span>${esc(name)}</span>${index === copies - 1 ? `<small>${unavailable}</small>` : ''}</div>`).join('');
  const legalityAttr = card?.legalityPending ? ' data-card-legality="pending"' : '';
  return `<div class="deck-card-stack" data-deck-card="${esc(name)}" data-deck-status="${status}"${legalityAttr} style="--copies:${copies}" title="${quantity} × ${esc(name)}${quantity > 4 ? (english ? ' — up to four copies visible in the stack' : ' — até quatro cópias visíveis na pilha') : ''}"><div class="deck-stack-faces">${faces}</div><div class="deck-stack-label"><span class="deck-quantity">${quantity}×</span><span>${esc(name)}</span></div></div>`;
}
export function renderDeckContents(options, lookup = () => null) {
  const { list, zone, archetypeName, versionLabel, headingLevel = 3 } = options;
  const english = (options.language || 'pt-BR').toLowerCase().startsWith('en');
  const words = english ? { cards: 'cards', distinct: 'distinct cards', colors: 'Color identity', empty: 'Your list takes shape here', add: 'Add a quantity and name per line in the', automatic: 'Cards will be organized automatically.', curve: 'MANA CURVE', unavailable: 'Lookup unavailable', notFound: 'Card not found', loading: 'Loading card', expand: 'Hover or touch to enlarge', seven: '7 or more', manaValue: 'Mana value', copies: 'copies visible in the stack' } : { cards: 'cartas', distinct: 'cartas distintas', colors: 'Identidade de cores', empty: 'Sua lista ganha forma aqui', add: 'Adicione quantidade e nome por linha no campo', automatic: 'As cartas serão organizadas automaticamente.', curve: 'CURVA DE MANA', unavailable: 'Consulta indisponível', notFound: 'Carta não encontrada', loading: 'Carregando carta', expand: 'Passe o mouse ou toque para ampliar', seven: '7 ou mais', manaValue: 'Valor de mana', copies: 'cópias visíveis na pilha' };
  const data = deckComposition(list, lookup);
  const representative = data.groups.flatMap(g => g.entries).find(e => e.card?.art)?.card;
  const peak = Math.max(1,...data.curve);
  const manaLabels = english ? {W:'White',U:'Blue',B:'Black',R:'Red',G:'Green'} : {W:'Branco',U:'Azul',B:'Preto',R:'Vermelho',G:'Verde'};
  const groupLabels = english ? { Criaturas:'Creatures', Artefatos:'Artifacts', Encantamentos:'Enchantments', 'Mágicas Instantâneas':'Instants', Feitiços:'Sorceries', Planeswalkers:'Planeswalkers', Batalhas:'Battles', Terrenos:'Lands', Outros:'Other', 'A identificar':'Unclassified' } : {};
  const banner = `<div class="deck-banner">${representative?.art ? `<img class="deck-cover" src="${esc(representative.art)}" alt="" aria-hidden="true">` : ''}<div class="deck-banner-copy"><span class="deck-eyebrow">${zone === 'main' ? 'MAIN DECK' : 'SIDEBOARD'} · PAUPER</span><strong>${esc(archetypeName || (english ? 'Your deck' : 'Seu deck'))}</strong><span class="deck-edition">${esc(versionLabel || '')}<span aria-hidden="true"> · </span>${data.total} ${words.cards} <span aria-hidden="true">·</span> ${data.entries.length} ${words.distinct}</span></div><div class="deck-color-identity" aria-label="${words.colors}">${data.colors.map(c=>`<span class="deck-color color-${c}" title="${manaLabels[c]}">${c}</span>`).join('')}</div></div>`;
  if (!data.entries.length) return `${banner}<div class="deck-empty"><span aria-hidden="true">▱ ▱ ▱</span><strong>${words.empty}</strong><p>${words.add} ${zone === 'main' ? 'main deck' : 'sideboard'}. ${words.automatic}</p><code>4 [Myr Enforcer]</code></div>`;
  const stats = `<div class="deck-stats"><div class="deck-type-totals">${data.groups.map(g=>`<span><strong>${g.count}</strong> ${groupLabels[g.name] || g.name}</span>`).join('')}</div>${data.recognized ? `<div class="deck-mana-curve" role="img" aria-label="${words.curve}: ${data.curve.map((v,i)=>`${i === 7 ? words.seven : i}: ${v}`).join('; ')}"><span class="curve-caption">${words.curve}</span><div class="curve-bars">${data.curve.map((v,i)=>`<div class="curve-bin" title="${words.manaValue} ${i === 7 ? words.seven : i}: ${v} ${words.cards}"><span class="curve-count">${v || ''}</span><span class="curve-bar" style="height:${Math.round(v/peak*26)}px"></span><span class="curve-value">${i === 7 ? '7+' : i}</span></div>`).join('')}</div></div>` : ''}</div>`;
  const heading = Math.min(headingLevel,6);
  const groups = data.groups.map(g=>`<div class="deck-visual-group"><div class="deck-group-heading"><h${heading}>${groupLabels[g.name] || g.name}</h${heading}><span>${g.count} ${words.cards}</span></div><div class="deck-stack-grid">${g.entries.map(entry => stack(entry, english)).join('')}</div></div>`).join('');
  return `${banner}${stats}<div class="deck-board-groups">${groups}</div><div class="deck-board-footer"><span>${data.total} ${words.cards} · ${data.entries.length} ${words.distinct}</span><span>${words.expand}</span></div>`;
}
export function renderDeckBoard(options, lookup = () => null) {
  return `<div class="deck-visual deck-board" data-deck-zone="${options.zone}" data-deck-list="${esc(options.list || '')}" data-deck-archetype="${esc(options.archetypeName || '')}" data-deck-version="${esc(options.versionLabel || '')}" data-deck-heading="${options.headingLevel || 3}" data-deck-language="${esc(options.language || 'pt-BR')}">${renderDeckContents(options,lookup)}</div>`;
}

export const DECK_VISUAL_STYLES = `
.deck-board{--stack-step:17px;border:1px solid #dcd7de;border-radius:12px;background:#f5f2ed;margin:1rem 0 1.4rem;container-type:inline-size;box-shadow:0 2px 8px #22152d09}
.deck-banner{position:relative;display:flex;align-items:center;justify-content:space-between;gap:15px;isolation:isolate;overflow:hidden;background:#292431;color:#fff;padding:20px 22px;border-radius:11px 11px 0 0;min-height:110px}.deck-cover{position:absolute;inset:0 0 0 auto;width:55%;height:100%;object-fit:cover;opacity:.5;mask-image:linear-gradient(to right,transparent,#000);z-index:-1}.deck-banner-copy{display:flex;flex-direction:column;gap:5px;min-width:0}.deck-eyebrow{font-size:9px;font-weight:650;letter-spacing:1.8px;color:#c3aedc}.deck-banner-copy>strong{font-size:26px;line-height:1.15;letter-spacing:-.7px;overflow-wrap:anywhere}.deck-edition{font-size:10px;color:#d0c6d8}.deck-color-identity{display:flex;gap:4px;align-self:flex-end;flex-shrink:0}.deck-color{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:10px;font-weight:750;border:1px solid #ffffff35;box-shadow:0 1px 4px #0003}.color-W{background:#e7dec4;color:#645a3d}.color-U{background:#4b9dbb;color:#fff}.color-B{background:#655a69;color:#fff}.color-R{background:#bc6158;color:#fff}.color-G{background:#65896d;color:#fff}
.deck-stats{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:12px 20px;border-bottom:1px solid #dfd9d2;background:#ebe7e0}.deck-type-totals{display:flex;gap:7px 12px;flex-wrap:wrap;font-size:10px;color:#746c76}.deck-type-totals>span{white-space:nowrap}.deck-type-totals strong{color:#332b38;font-size:12px;margin-right:2px}.deck-mana-curve{display:flex;gap:8px;align-items:center;flex-shrink:0}.curve-caption{font-size:7px;letter-spacing:1px;line-height:1.5;width:32px;color:#7e7484}.curve-bars{display:flex;align-items:flex-end;gap:4px;height:49px}.curve-bin{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;width:12px;height:49px}.curve-count{font-size:7px;height:10px;line-height:10px;color:#6c5a7d}.curve-bar{display:block;min-height:1px;width:10px;background:#a98abd;border-radius:2px 2px 0 0}.curve-value{font-size:8px;line-height:13px;color:#766a7e}
.deck-board-groups{padding:5px 20px 20px}.deck-visual-group{margin:16px 0 4px}.deck-group-heading{display:flex;align-items:center;gap:9px;margin:0 0 11px}.deck-group-heading>:is(h3,h4,h5,h6){font-size:10px!important;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0!important;line-height:1.4;color:#665b6d}.deck-group-heading>span{font-size:9px;color:#918592}.deck-group-heading:after{content:'';height:1px;background:#e0d9d3;flex:1;margin-left:4px}.deck-stack-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(105px,1fr));gap:17px 12px;align-items:start}
.deck-card-stack{position:relative;min-width:0;z-index:1}.deck-card-stack:hover,.deck-card-stack:focus-within{z-index:15}.deck-stack-faces{position:relative;padding-top:calc(139.35% + (var(--copies) - 1)*var(--stack-step))}.deck-copy{position:absolute;display:block;left:0;top:calc(var(--copy)*var(--stack-step));width:100%;aspect-ratio:488/680;border-radius:6px;background:#1c1b1d;z-index:var(--copy);color:#fff;box-shadow:0 1px 3px #0003;outline-offset:3px}.deck-copy img{display:block;width:100%;height:100%;border-radius:6px;transition:transform .15s;box-shadow:0 0 0 1px #211e22;object-fit:cover}.deck-copy:hover,.deck-copy:focus-visible{z-index:20}.deck-copy:hover img,.deck-copy:focus-visible img{transform:scale(1.35);transform-origin:center 20%;box-shadow:0 6px 20px #0007}.deck-copy:focus-visible{outline:2px solid #a881c2}.deck-copy-placeholder{border:2px solid #55505a;background:linear-gradient(145deg,#e3dce8,#f4eff6);display:flex;flex-direction:column;justify-content:space-between;padding:5px;color:#796981;box-sizing:border-box;font-size:8px}.deck-copy-placeholder>span{font-size:8px;font-weight:600}.deck-copy-placeholder small{font-size:8px;text-align:center;margin:auto}.deck-card-stack[data-deck-status='error'] .deck-copy-placeholder,.deck-card-stack[data-deck-status='notfound'] .deck-copy-placeholder{border-color:#bb8585;color:#984d4d}
.deck-stack-label{display:flex;align-items:baseline;gap:5px;padding-top:7px;font-size:9px;line-height:1.45;color:#66586f;overflow-wrap:anywhere}.deck-quantity{flex-shrink:0;font-size:9px;font-weight:750;color:#3e2c4b}.deck-board-footer{display:flex;justify-content:space-between;gap:10px;border-top:1px solid #dfd9d2;padding:10px 20px;font-size:9px;color:#8a7d90;background:#eeeae4;border-radius:0 0 11px 11px}.deck-empty{padding:32px 24px;text-align:center;color:#85768e}.deck-empty>span{display:block;font-size:40px;color:#c1afcf}.deck-empty strong{display:block;font-size:15px;color:#706079}.deck-empty p{font-size:12px;max-width:330px;margin:8px auto 14px}.deck-empty code{font-size:11px;background:#eae2f0;border-radius:5px;padding:5px 9px}
@container(max-width:520px){.deck-banner{padding:16px;min-height:95px}.deck-banner-copy>strong{font-size:22px}.deck-stats{padding:10px 14px;flex-wrap:wrap;gap:10px}.deck-mana-curve{margin-left:auto}.deck-board-groups{padding-inline:14px}.deck-stack-grid{grid-template-columns:repeat(auto-fill,minmax(91px,1fr));gap:14px 9px}.deck-board-footer{padding:10px 14px;flex-wrap:wrap}.deck-color-identity{gap:3px}.deck-color{width:18px;height:18px;font-size:8px}}
@container(max-width:340px){.deck-stack-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.deck-banner-copy>strong{font-size:19px}.deck-color-identity{display:none}}
@media print{.deck-board{break-inside:auto;box-shadow:none}.deck-banner,.deck-stats,.deck-group-heading{break-after:avoid}.deck-card-stack{break-inside:avoid}.deck-stack-grid{grid-template-columns:repeat(5,minmax(0,1fr))}.deck-copy img,.deck-copy:hover img{transform:none}.deck-board-footer>span:last-child{display:none}}
`;
