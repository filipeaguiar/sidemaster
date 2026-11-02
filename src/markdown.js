export function escapeHtml(text = '') { return String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }

function referenceKey(value) { return value.trim().replace(/\s+/g, ' ').toLowerCase(); }

export function collectMarkdownCardReferences(text = '') {
  const definitions = new Set([...String(text).matchAll(/^ {0,3}\[([^\]]+)\]:\s*https?:\/\/[^\s]+.*$/gim)].map(match => referenceKey(match[1])));
  const body = String(text)
    .replace(/^ {0,3}\[([^\]]+)\]:\s*https?:\/\/[^\s]+.*$/gim, '')
    .replace(/\x60{3,}[\s\S]*?\x60{3,}/g, '')
    .replace(/\x60[^\x60\n]*\x60/g, '')
    .replace(/!?\[[^\]]+\]\(https?:\/\/[^)]+\)/gi, '')
    .replace(/!?\[[^\]]+\]\[([^\]]*)\]/g, (_match, label) => definitions.has(referenceKey(label)) ? '' : _match)
    .replace(/\[([^\]]+)\]/g, (match, label) => definitions.has(referenceKey(label)) ? '' : match);
  return [...body.matchAll(/!?\[([^\]]+)\]/g)].map(match => match[1].trim()).filter(Boolean);
}

export function renderMarkdown(text = '') {
  let html = escapeHtml(text);
  const references = new Map();
  html = html.replace(/^ {0,3}\[([^\]]+)\]:\s*(https?:\/\/[^\s]+)(?:\s+["'(].*?["')])?\s*$/gim, (_match, label, url) => {
    references.set(referenceKey(label), url);
    return '';
  });
  html = html.replace(/!?\[([^\]]+)\]\[([^\]]*)\]/g, (match, label, id) => {
    const url = references.get(referenceKey(id || label));
    if (!url) return match;
    return match.startsWith('!') ? '<img class="card-image" alt="' + label + '" src="' + url + '" />' : '<a href="' + url + '" target="_blank" rel="noreferrer">' + label + '</a>';
  });
  html = html.replace(/\[([^\]]+)\]/g, (match, label) => {
    const url = references.get(referenceKey(label));
    return url ? '<a href="' + url + '" target="_blank" rel="noreferrer">' + label + '</a>' : match;
  });
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>').replace(/^## (.+)$/gm, '<h3>$1</h3>').replace(/^# (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img class="card-image" alt="$1" src="$2" />');
  html = html.replace(/(^|[\s>])([1-9]\d*)\s+!\[([^\]]+)\]/g, (_, prefix, quantity, name) => {
    return prefix + Array.from({ length: Number(quantity) }, () => '<span class="card-ref card-direct" title="Imagem da carta: ' + name + '">' + name + '</span>').join(' ');
  });
  html = html.replace(/!\[([^\]]+)\]/g, '<span class="card-ref card-direct" title="Imagem da carta: $1">$1</span>');
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gi, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  html = html.replace(/\[([^\]]+)\]/g, '<span class="card-ref" title="Carta: $1">$1</span>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/^(?:- .*(?:\n|$))+?/gm, (block) => '<ul>' + block.trim().split('\n').map((line) => '<li>' + line.slice(2) + '</li>').join('') + '</ul>');
  return html.split(/\n{2,}/).map((p) => /^<(h|ul)/.test(p) ? p : '<p>' + p.replaceAll('\n', '<br>') + '</p>').join('');
}
