// R4 FORGE - technical quality: claims verified
// △

import { scanSnakeOil } from '../reflexes/snake-oil.mjs';
import { scanCraft } from '../reflexes/craft.mjs';

export function check(content) {
  const result = { pass: true, ring: 'R4', symbol: '△', name: 'FORGE', notes: [], craftMarks: [] };

  // Check for snake oil claims
  const snakeHits = scanSnakeOil(content);
  if (snakeHits.length > 0) {
    result.notes.push('unverified claims: ' + snakeHits.map(h => h.note).join(', '));
  }

  // Check for craft marks (positive signals)
  const craftResult = scanCraft(content);
  if (craftResult.approvals.length > 0) {
    result.craftMarks = craftResult.approvals;
    result.notes.push('craft marks: ' + craftResult.approvals.map(a => a.note).join(', '));
  }

  if (craftResult.warnings.length > 0) {
    const hasRefuse = craftResult.warnings.some(w => w.level === 'refuse');
    if (hasRefuse) {
      result.pass = false;
    }
    result.notes.push('craft warnings: ' + craftResult.warnings.map(w => w.note).join(', '));
  }

  if (result.notes.length === 0) {
    result.notes.push('technical quality ok');
  }

  return result;
}
