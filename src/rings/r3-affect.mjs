// R3 AFFECT - psychological safety: no harassment, tone check
// ♡

import { scanPsychSafety } from '../reflexes/psych-safety.mjs';

export function check(content) {
  const result = { pass: true, ring: 'R3', symbol: '♡', name: 'AFFECT', notes: [] };

  const hits = scanPsychSafety(content);

  if (hits.length > 0) {
    const hasBan = hits.some(h => h.level === 'ban');
    const hasRefuse = hits.some(h => h.level === 'refuse');

    if (hasBan || hasRefuse) {
      result.pass = false;
      result.notes.push('psych safety violation: ' + hits.map(h => h.note).join(', '));
    } else {
      result.notes.push('psych safety advisory: ' + hits.map(h => h.note).join(', '));
    }
  } else {
    result.notes.push('psych safety ok');
  }

  return result;
}
