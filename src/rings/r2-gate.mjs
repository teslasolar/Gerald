// R2 GATE - charter compliance check
// ┃

import { scanAll, highestSeverity } from '../reflexes/index.mjs';

export function check(content) {
  const result = { pass: true, ring: 'R2', symbol: '┃', name: 'GATE', notes: [], reflexHits: null };

  const hits = scanAll(content);
  const severity = highestSeverity(hits);

  result.reflexHits = hits;

  if (severity === 'ban' || severity === 'refuse') {
    result.pass = false;
    result.notes.push(`charter violation: severity=${severity}`);
  } else if (severity === 'warn') {
    result.notes.push(`charter advisory: severity=${severity}`);
  } else {
    result.notes.push('charter compliant');
  }

  return result;
}
