// Craft standards detector - flags bad practice, rewards good practice

const warnings = [
  { regex: /\bit works on my machine\b/i,            level: 'warn',  note: 'reproducibility concern' },
  { regex: /\btests\??\s*what tests\b/i,             level: 'refuse', note: 'refuse merge without tests' },
  { regex: /\btrust the AI output\b/i,               level: 'warn',  note: 'verify AI output' },
  { regex: /\bcopy[- ]?pasted? from (ChatGPT|GPT|Claude|Gemini|Copilot)\b/i,
                                                      level: 'warn',  note: 'attribution needed' },
];

const approvals = [
  { regex: /\bI don'?t know but\b/i,                 level: 'ack',   note: '\u2705 honesty acknowledged' },
  { regex: /\bI verified by\b/i,                     level: 'craft', note: '\u2705 craft mark' },
  { regex: /\bhere'?s the repro\b/i,                 level: 'craft', note: '\u2705 craft mark' },
];

export function scanCraft(text) {
  const hits = { warnings: [], approvals: [] };

  for (const p of warnings) {
    if (p.regex.test(text)) {
      hits.warnings.push({ ...p, regex: undefined, pattern: p.regex.source });
    }
  }

  for (const p of approvals) {
    if (p.regex.test(text)) {
      hits.approvals.push({ ...p, regex: undefined, pattern: p.regex.source });
    }
  }

  return hits;
}

export default { scanCraft, warnings, approvals };
