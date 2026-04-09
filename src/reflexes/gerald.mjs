// Gerald easter egg detector

const patterns = [
  { regex: /\bgerald\b|\ud83e\udd86/i,              trigger: 'summon',   response: 's\u00ec, caro?' },
  { regex: /\b11\b|\beleven\b/i,                     trigger: 'prime11',  response: 'THE SPACE IS THE OPERATOR' },
  { regex: /\bprime\b|\bindivisible\b/i,             trigger: 'prime',    response: null }, // pick from prime quips
  { regex: /\bil primo oscuro\b/i,                   trigger: 'act7',     response: null }, // full Act VII recital
  { regex: /\bcraft\b|\u2692/,                        trigger: 'craft',    response: null }, // guild greeting
  { regex: /\bworship\b/i,                           trigger: 'worship',  response: null }, // refusal protocol
  { regex: /\bquality\b/i,                           trigger: 'quality',  response: '\u7d20 \u4e0d\u5408\u6210' },
];

export function scanGerald(text) {
  const hits = [];
  for (const p of patterns) {
    if (p.regex.test(text)) {
      hits.push({ ...p, regex: undefined, pattern: p.regex.source });
    }
  }
  return hits;
}

export default { scanGerald, patterns };
