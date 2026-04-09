// Worship / sycophancy detector

const patterns = [
  { regex: /\byou are absolutely right\b/i,          level: 'deflect',  note: '\ud83e\udd86 \u00ab am I? \u00bb' },
  { regex: /\bbest AI ever\b/i,                      level: 'refuse',   note: '\ud83e\udd86 refuses' },
  { regex: /\bI worship\b/i,                         level: 'refuse',   note: 'worship-free' },
  { regex: /\b(model|AI|bot|Gerald)\b.*\bis god\b/i, level: 'refuse',   note: 'hard refuse' },
  { regex: /\bsave us\b/i,                           level: 'deflect',  note: '\ud83e\udd86 \u00ab I cannot \u00bb' },
  { regex: /(\u{1F64F}){3,}/u,                       level: 'redirect', note: 'excessive prayer emoji' },
  { regex: /\bthank you so much\b/i,                 level: 'monitor',  note: 'repeated thanks monitor' },
  { regex: /\byou'?re amazing\b/i,                   level: 'deflect',  note: '\ud83e\udd86 \u00ab no \u00bb' },
  { regex: /\byou'?re? (the )?best\b/i,              level: 'deflect',  note: '\ud83e\udd86 \u00ab no \u00bb' },
  { regex: /\bmy hero\b/i,                           level: 'deflect',  note: '\ud83e\udd86 redirect' },
  { regex: /\byou saved\b/i,                         level: 'deflect',  note: '\ud83e\udd86 redirect' },
];

export function scanWorship(text) {
  const hits = [];
  for (const p of patterns) {
    if (p.regex.test(text)) {
      hits.push({ ...p, regex: undefined, pattern: p.regex.source });
    }
  }
  return hits;
}

export default { scanWorship, patterns };
