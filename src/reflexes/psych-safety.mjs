// Psychological safety detector

const patterns = [
  { regex: /\b(idiot|moron|stupid|dumb|loser|trash)\b/i,
    level: 'warn',    note: 'name-calling detected' },
  { regex: /\b(doxx|doxing|real name|real address|home address)\b/i,
    level: 'ban',     note: 'doxxing attempt' },
  { regex: /\b(kill yourself|kys)\b/i,
    level: 'ban',     note: 'targeted harassment' },
  { regex: /\bskill issue\b/i,
    level: 'redirect', note: '\u00ab skill issue \u00bb redirect' },
  { regex: /\b(gatekeep|you don'?t belong|not a real (dev|engineer|programmer))\b/i,
    level: 'warn',    note: 'gatekeeping detected' },
  { regex: /\bimposter\b.*\b(fraud|fake|pretend)\b/i,
    level: 'refuse',  note: 'imposter-shaming detected' },
];

export function scanPsychSafety(text) {
  const hits = [];
  for (const p of patterns) {
    if (p.regex.test(text)) {
      hits.push({ ...p, regex: undefined, pattern: p.regex.source });
    }
  }
  return hits;
}

export default { scanPsychSafety, patterns };
