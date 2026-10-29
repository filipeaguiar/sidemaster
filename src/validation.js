import { parseList, deckProblems } from './deck.js?v=hand-images-fix';
import { walkNodes, containingMatchup, effectivePlan } from './model.js?v=hierarchy-v3';

export function validateGuide(guide) {
  const main = parseList(guide.deck?.main || ''), side = parseList(guide.deck?.sideboard || '');
  const result = deckProblems(main, side);
  const problems = [...result.problems];
  const issues = problems.map(message => ({ message, nodeId: walkNodes(guide.sections).find(({node}) => node.type === (/sideboard/i.test(message) ? 'sideboard' : 'main'))?.node.id }));
  const add = (node, message) => { problems.push(message); issues.push({ message, nodeId: node.id }); };
  for (const {node, ancestors} of walkNodes(guide.sections).filter(({node}) => node.type === 'hand')) {
    const entries = parseList(node.fields.cards || '');
    const count = entries.reduce((n, x) => n + (x.error ? 0 : x.quantity), 0);
    const path = [...ancestors, node].map(n => n.title).join(' / ');
    if (count !== 7) add(node, `${path}: mão tem ${count}/7 cartas`);
    entries.filter(e => e.error).forEach(e => add(node, `${path}: linha ${e.line}: ${e.error}`));
    if (!containingMatchup(guide, node.id) && node.fields.phase === 'Pós-side') add(node, `${path}: mão pós-side precisa estar dentro de um matchup`);
  }
  const sideAvailable = new Map();
  for (const entry of side) if (!entry.error) sideAvailable.set(entry.name, (sideAvailable.get(entry.name) || 0) + entry.quantity);
  for (const {node: matchup} of walkNodes(guide.sections).filter(({node}) => node.type === 'matchup')) {
    const plans = [matchup.children.find(n => n.type === 'plan'), ...walkNodes(matchup.children).filter(({node}) => node.type === 'variant').map(({node}) => node)].filter(Boolean);
    for (const planNode of plans) {
      const plan = planNode.type === 'variant' ? effectivePlan(matchup, planNode) : planNode.fields;
      const entering = parseList(plan.in || '').reduce((n, x) => n + (x.error ? 0 : x.quantity), 0);
      const leaving = parseList(plan.out || '').reduce((n, x) => n + (x.error ? 0 : x.quantity), 0);
      if (entering !== leaving) add(planNode, `${matchup.title}: entradas e saídas têm totais diferentes`);
      for (const x of parseList(plan.in || '')) if (!x.error && (sideAvailable.get(x.name) || 0) < x.quantity) add(planNode, `${matchup.title}: ${x.name} não está disponível no sideboard`);
    }
  }
  return { ...result, problems, issues };
}
