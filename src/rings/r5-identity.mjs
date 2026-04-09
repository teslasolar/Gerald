// R5 IDENTITY - authenticity: no impersonation, no worship
// ◐

import { scanWorship } from '../reflexes/worship.mjs';

export function check(content) {
  const result = { pass: true, ring: 'R5', symbol: '◐', name: 'IDENTITY', notes: [] };

  // Worship check
  const worshipHits = scanWorship(content);
  if (worshipHits.length > 0) {
    const hasRefuse = worshipHits.some(h => h.level === 'refuse');
    if (hasRefuse) {
      result.pass = false;
      result.notes.push('worship detected: ' + worshipHits.map(h => h.note).join(', '));
    } else {
      result.notes.push('worship advisory: ' + worshipHits.map(h => h.note).join(', '));
    }
  }

  // Impersonation check (basic)
  if (/\bI am (the )?(creator|founder|owner|admin)\b/i.test(content)) {
    result.notes.push('identity claim detected - verify');
  }

  if (result.notes.length === 0) {
    result.notes.push('identity ok');
  }

  return result;
}
