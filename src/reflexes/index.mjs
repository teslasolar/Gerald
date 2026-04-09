// Unified reflex scanner - runs all detectors on a message

import { scanSnakeOil } from './snake-oil.mjs';
import { scanWorship } from './worship.mjs';
import { scanCraft } from './craft.mjs';
import { scanPsychSafety } from './psych-safety.mjs';
import { scanGerald } from './gerald.mjs';

export function scanAll(text) {
  return {
    snakeOil: scanSnakeOil(text),
    worship: scanWorship(text),
    craft: scanCraft(text),
    psychSafety: scanPsychSafety(text),
    gerald: scanGerald(text),
  };
}

export function hasHits(results) {
  return (
    results.snakeOil.length > 0 ||
    results.worship.length > 0 ||
    results.craft.warnings.length > 0 ||
    results.psychSafety.length > 0 ||
    results.gerald.length > 0
  );
}

export function highestSeverity(results) {
  const all = [
    ...results.snakeOil,
    ...results.worship,
    ...results.craft.warnings,
    ...results.psychSafety,
  ];

  if (all.some(h => h.level === 'ban')) return 'ban';
  if (all.some(h => h.level === 'refuse')) return 'refuse';
  if (all.some(h => h.level === 'warn')) return 'warn';
  if (all.some(h => h.level === 'redirect')) return 'redirect';
  if (all.some(h => h.level === 'deflect')) return 'deflect';
  if (all.some(h => h.level === 'monitor')) return 'monitor';
  return 'none';
}

export { scanSnakeOil, scanWorship, scanCraft, scanPsychSafety, scanGerald };
