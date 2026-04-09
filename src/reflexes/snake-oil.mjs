// Snake oil detector - regex patterns for hype, vague claims, and techno-worship

const patterns = [
  { regex: /\bAI[- ]?powered\b/i,                   label: 'vague claim',    level: 'warn',   note: '\u00ab AI-powered \u00bb \u2192 define' },
  { regex: /\brevolutionary\b.*\b(tech|platform|solution|product|tool)\b/i,
                                                      label: 'hype',           level: 'warn',   note: '\u00ab revolutionary \u00bb \u2192 hype flag' },
  { regex: /\b10x\s*(engineer|developer|programmer)\b/i,
                                                      label: 'folk myth',      level: 'warn',   note: '\u00ab 10x engineer \u00bb \u2192 folk myth' },
  { regex: /\bwe built\b.*\b(impossible|unbelievable|incredible)\b/i,
                                                      label: 'verify',         level: 'refuse', note: '\u00ab we built [impossible] \u00bb \u2192 verify' },
  { regex: /\btrust me bro\b/i,                      label: 'refuse',         level: 'refuse', note: '\u00ab trust me bro \u00bb \u2192 refuse' },
  { regex: /\bno code required\b/i,                  label: 'qualify',        level: 'warn',   note: '\u00ab no code required \u00bb \u2192 qualify' },
  { regex: /\bwill replace\b.*\b(developer|programmer|engineer|designer|writer|job|worker)\b/i,
                                                      label: 'fear sell',      level: 'warn',   note: '\u00ab will replace [job] \u00bb \u2192 fear sell' },
  { regex: /\b\d+%\s*accurat/i,                      label: 'demand source',  level: 'warn',   note: '\u00ab [N]% accurate \u00bb \u2192 demand source' },
  { regex: /\bself[- ]?aware\b/i,                    label: 'refuse',         level: 'refuse', note: '\u00ab self-aware \u00bb \u2192 refuse' },
  { regex: /\bsentient\b/i,                          label: 'refuse',         level: 'refuse', note: '\u00ab sentient \u00bb \u2192 refuse' },
  { regex: /\bconsciou?s\b.*\b(AI|model|system|bot)\b/i,
                                                      label: 'refuse',         level: 'refuse', note: '\u00ab conscious \u00bb \u2192 refuse' },
  { regex: /\bAGI\b.*\b(product|launch|built|ship|release)\b/i,
                                                      label: 'define',         level: 'warn',   note: '\u00ab AGI \u00bb + product claim \u2192 define' },
];

export function scanSnakeOil(text) {
  const hits = [];
  for (const p of patterns) {
    if (p.regex.test(text)) {
      hits.push({ ...p, regex: undefined, pattern: p.regex.source });
    }
  }
  return hits;
}

export default { scanSnakeOil, patterns };
