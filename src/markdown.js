export function escapeHtml(text = '') { return String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }

export function renderMarkdown(text = '') {
  let html = escapeHtml(text);
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>').replace(/^## (.+)$/gm, '<h3>$1</h3>').replace(/^# (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img class="card-image" alt="$1" src="$2" />');
  html = html.replace(/(^|[\s>])([1-9]\d*)\s+!\[([^\]]+)\]/g, (_, prefix, quantity, name) => `${prefix}${Array.from({ length: Number(quantity) }, () => `<span class="card-ref card-direct" title="Imagem da carta: ${name}">${name}</span>`).join(' ')}`);
  html = html.replace(/!\[([^\]]+)\]/g, '<span class="card-ref card-direct" title="Imagem da carta: $1">$1</span>');
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  html = html.replace(/\[([^\]]+)\]/g, '<span class="card-ref" title="Carta: $1">$1</span>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/^(?:- .*(?:\n|$))+?/gm, (block) => `<ul>${block.trim().split('\n').map((line) => `<li>${line.slice(2)}</li>`).join('')}</ul>`);
  return html.split(/\n{2,}/).map((p) => /^<(h|ul)/.test(p) ? p : `<p>${p.replaceAll('\n', '<br>')}</p>`).join('');
}
