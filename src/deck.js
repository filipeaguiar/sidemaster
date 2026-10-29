const linePattern = /^\s*(\d+)\s+(.+?)\s*$/;
export function parseList(text = '') {
  return text.split(/\r?\n/).map((raw, index) => {
    if (!raw.trim()) return null;
    const match = raw.match(linePattern);
    if (!match) return { raw, line: index + 1, quantity: null, name: raw.trim(), error: 'Use quantidade e nome por linha' };
    const quantity = Number(match[1]);
    const token = match[2].trim();
    const reference = token.match(/^!?\[([^\]]+)\]$/);
    const name = (reference ? reference[1] : token).trim();
    return { raw, line: index + 1, quantity, name, error: quantity > 0 && name ? null : 'A quantidade e o nome devem ser válidos' };
  }).filter(Boolean);
}

export function aggregate(entries) {
  const result = new Map();
  for (const entry of entries) if (!entry.error) result.set(entry.name, (result.get(entry.name) || 0) + entry.quantity);
  return [...result].map(([name, quantity]) => ({ name, quantity }));
}

export function deckProblems(main, sideboard) {
  const problems = [...main, ...sideboard].filter((x) => x.error).map((x) => `linha ${x.line}: ${x.error}`);
  const mainCount = main.reduce((n, x) => n + (x.error ? 0 : x.quantity), 0);
  const sideCount = sideboard.reduce((n, x) => n + (x.error ? 0 : x.quantity), 0);
  if (mainCount < 60) problems.push(`main deck tem ${mainCount} cartas; o mínimo é 60`);
  if (sideCount > 15) problems.push(`sideboard tem ${sideCount} cartas; o máximo é 15`);
  const copies = new Map();
  for (const entry of [...main, ...sideboard]) if (!entry.error) copies.set(entry.name, (copies.get(entry.name) || 0) + entry.quantity);
  for (const [name, quantity] of copies) if (quantity > 4 && !/^(plains|island|swamp|mountain|forest|wastes|planície|ilha|pântano|montanha|floresta)$/i.test(name.trim())) problems.push(`${name}: ${quantity} cópias combinadas; o limite normal é 4`);
  return { mainCount, sideCount, problems };
}
