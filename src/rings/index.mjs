// Inner seven rings pipeline - runs R0-R6 sequentially, fail-fast

import { check as r0 } from './r0-ground.mjs';
import { check as r1 } from './r1-signal.mjs';
import { check as r2 } from './r2-gate.mjs';
import { check as r3 } from './r3-affect.mjs';
import { check as r4 } from './r4-forge.mjs';
import { check as r5 } from './r5-identity.mjs';
import { check as r6 } from './r6-observer.mjs';

const innerRings = [r0, r1, r2, r3, r4, r5, r6];

export function runInnerRings(content, message) {
  const results = [];

  for (const check of innerRings) {
    let result;
    if (check === r0) {
      result = check(content, message);
    } else if (check === r6) {
      result = check(content, results);
    } else {
      result = check(content);
    }
    results.push(result);
  }

  const passed = results.every(r => r.pass);
  const failedRings = results.filter(r => !r.pass);

  return {
    passed,
    results,
    failedRings,
    summary: results.map(r => `${r.symbol} ${r.name}: ${r.pass ? '✅' : '❌'} ${r.notes.join(', ')}`).join('\n'),
  };
}

export { r0, r1, r2, r3, r4, r5, r6 };
