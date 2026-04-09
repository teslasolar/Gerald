// M0 AETHER - hypothesis review: « why »
// ⟁ · Mersenne outer ring · PR/release/major decisions only

export function check(content, context) {
  const result = { pass: true, ring: 'M0', symbol: '⟁', name: 'AETHER', notes: [] };

  // Check if the PR/proposal has a "why" - a rationale
  const hasWhy = /\bwhy\b|\breason|\brationale|\bmotivation|\bpurpose\b/i.test(content);
  const hasProblem = /\bproblem\b|\bissue\b|\bbug\b|\bfix(es)?\b/i.test(content);

  if (!hasWhy && !hasProblem) {
    result.notes.push('no rationale found - why is this change needed?');
  } else {
    result.notes.push('rationale present');
  }

  return result;
}
