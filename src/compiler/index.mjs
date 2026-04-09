// 12-ring compiler pipeline for code review
// LEX → PARSE → VALIDATE → WEIGHT → PLAN → BIND → REFLECT → LIFT → TRANSFORM → PRUNE → NEXUS → EMIT

const STAGES = [
  { id: 'LEX',       symbol: '●', run: lex },
  { id: 'PARSE',     symbol: '〜', run: parse },
  { id: 'VALIDATE',  symbol: '┃', run: validate },
  { id: 'WEIGHT',    symbol: '♡', run: weight },
  { id: 'PLAN',      symbol: '△', run: plan },
  { id: 'BIND',      symbol: '◐', run: bind },
  { id: 'REFLECT',   symbol: '◯', run: reflect },
  { id: 'LIFT',      symbol: '⟁', run: lift },
  { id: 'TRANSFORM', symbol: '⬡', run: transform },
  { id: 'PRUNE',     symbol: '⟐', run: prune },
  { id: 'NEXUS',     symbol: '✦', run: nexus },
  { id: 'EMIT',      symbol: '❋', run: emit },
];

// --- Stage implementations ---

function lex(code) {
  const lines = code.split('\n');
  const lang = detectLanguage(code);
  return { lines: lines.length, lang, notes: [`${lines.length} lines · ${lang}`] };
}

function detectLanguage(code) {
  if (/^(import|from)\s+/m.test(code) && /def\s+\w+/m.test(code)) return 'python';
  if (/^(import|export)\s+/m.test(code) || /=>\s*{/m.test(code)) return 'javascript';
  if (/^(use|fn|let\s+mut|impl|struct)\b/m.test(code)) return 'rust';
  if (/^(package|func)\s+/m.test(code)) return 'go';
  if (/^(public|private|class)\s+/m.test(code) && /;\s*$/m.test(code)) return 'java';
  if (/^(#include|int\s+main)/m.test(code)) return 'c/c++';
  if (/^\s*(interface|type)\s+\w+/m.test(code) && /:.*=>/m.test(code)) return 'typescript';
  return 'unknown';
}

function parse(code) {
  // Basic structural parse
  const braces = { open: (code.match(/{/g) || []).length, close: (code.match(/}/g) || []).length };
  const parens = { open: (code.match(/\(/g) || []).length, close: (code.match(/\)/g) || []).length };
  const balanced = braces.open === braces.close && parens.open === parens.close;
  return { balanced, notes: [balanced ? 'balanced structure' : 'unbalanced brackets/parens'] };
}

function validate(code) {
  const notes = [];
  // Basic lint checks
  if (/\t/.test(code) && / {2,}/.test(code)) notes.push('mixed tabs and spaces');
  if (/;\s*;/.test(code)) notes.push('double semicolons');
  if (/==(?!=)/.test(code) && detectLanguage(code) === 'javascript') notes.push('loose equality (==) - prefer ===');
  if (notes.length === 0) notes.push('syntax ok');
  return { notes };
}

function weight(code) {
  const lines = code.split('\n');
  const nonEmpty = lines.filter(l => l.trim().length > 0).length;
  const functions = (code.match(/\b(function|def|fn|func)\s+\w+/g) || []).length;
  const nesting = Math.max(...lines.map(l => {
    const indent = l.match(/^(\s*)/)[1].length;
    return Math.floor(indent / 2);
  }));

  const complexity = functions * 2 + nesting;
  const notes = [`complexity: ${complexity}`, `${functions} functions`, `max nesting: ${nesting}`];

  if (complexity > 20) notes.push('⚠️ high complexity');

  return { complexity, functions, nesting, notes };
}

function plan(code) {
  const notes = [];
  const longFunctions = code.match(/(function|def|fn|func)\s+\w+[^}]*/g) || [];
  const foldable = longFunctions.filter(f => f.split('\n').length > 30);

  if (foldable.length > 0) {
    notes.push(`${foldable.length} functions could be split (>30 lines)`);
  }

  // Repeated patterns
  const lines = code.split('\n').map(l => l.trim()).filter(l => l.length > 10);
  const seen = {};
  for (const l of lines) {
    seen[l] = (seen[l] || 0) + 1;
  }
  const dupes = Object.entries(seen).filter(([, c]) => c >= 3);
  if (dupes.length > 0) {
    notes.push(`${dupes.length} repeated patterns (3+ occurrences)`);
  }

  if (notes.length === 0) notes.push('no refactor suggestions');
  return { notes };
}

function bind(code) {
  const notes = [];
  // Check for undefined references (basic heuristic)
  const defined = new Set();
  const used = new Set();

  for (const m of code.matchAll(/\b(const|let|var|function|class)\s+(\w+)/g)) {
    defined.add(m[2]);
  }

  for (const m of code.matchAll(/\b([a-zA-Z_]\w+)\s*\(/g)) {
    used.add(m[1]);
  }

  const builtins = new Set(['console', 'Math', 'Date', 'JSON', 'Array', 'Object', 'String', 'Number',
    'Boolean', 'Promise', 'Map', 'Set', 'Error', 'RegExp', 'parseInt', 'parseFloat', 'require', 'import',
    'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'fetch', 'process']);

  const unresolved = [...used].filter(u => !defined.has(u) && !builtins.has(u));

  if (unresolved.length > 0) {
    notes.push(`${unresolved.length} potentially unresolved: ${unresolved.slice(0, 5).join(', ')}`);
  } else {
    notes.push('all symbols resolved');
  }

  return { unresolved, notes };
}

function reflect(code) {
  const notes = [];

  // Architectural concerns
  if ((code.match(/\bclass\b/g) || []).length > 3) {
    notes.push('many classes - consider module boundaries');
  }

  if ((code.match(/\bglobal\b|\bwindow\./g) || []).length > 0) {
    notes.push('global state usage detected');
  }

  const importCount = (code.match(/\b(import|require)\b/g) || []).length;
  if (importCount > 15) {
    notes.push(`${importCount} imports - high coupling`);
  }

  if (notes.length === 0) notes.push('no architectural concerns');
  return { notes };
}

function lift(code) {
  // Generate review comments
  const comments = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/\/\/\s*TODO\b/i.test(line)) {
      comments.push({ line: i + 1, comment: `TODO found: ${line.trim()}` });
    }
    if (line.length > 120) {
      comments.push({ line: i + 1, comment: 'line exceeds 120 chars' });
    }
  }

  return { comments, notes: comments.length > 0 ? [`${comments.length} review comments`] : ['no comments to lift'] };
}

function transform(code) {
  const notes = [];

  // Peephole optimization suggestions
  if (/\.forEach\(/.test(code)) {
    notes.push('consider for...of instead of .forEach()');
  }
  if (/new Promise\(\s*(resolve|reject)/.test(code) && /\.then\(/.test(code)) {
    notes.push('consider async/await over Promise chains');
  }
  if (/\+ ['"]/.test(code) && !/`/.test(code)) {
    notes.push('consider template literals over string concatenation');
  }

  if (notes.length === 0) notes.push('no peephole suggestions');
  return { notes };
}

function prune(code) {
  const notes = [];
  let deadLines = 0;

  const lines = code.split('\n');
  for (const line of lines) {
    if (/^\s*\/\/\s*(const|let|var|function|return|if)\b/.test(line)) deadLines++;
    if (/^\s*\/\*.*\*\/\s*$/.test(line) && /\b(const|let|var|function)\b/.test(line)) deadLines++;
  }

  const consoleLogs = (code.match(/console\.(log|debug|info)\(/g) || []).length;
  deadLines += consoleLogs;

  if (deadLines > 0) {
    notes.push(`${deadLines} dead/debug lines found`);
  } else {
    notes.push('clean - no dead code');
  }

  return { deadLines, notes };
}

function nexus(code) {
  const notes = [];
  const imports = (code.match(/\b(import|require)\b/g) || []).length;
  const exports = (code.match(/\b(export)\b/g) || []).length;

  if (imports > 0) notes.push(`touches ${imports} dependencies`);
  if (exports > 0) notes.push(`exposes ${exports} exports`);
  if (notes.length === 0) notes.push('self-contained');
  return { notes };
}

function emit(stageResults) {
  // Final verdict
  const allNotes = stageResults.flatMap(s => s.result.notes || []);
  const warnings = allNotes.filter(n => n.includes('⚠️'));
  const issues = allNotes.filter(n =>
    n.includes('unbalanced') || n.includes('unresolved') || n.includes('dead')
  );

  let verdict;
  if (issues.length >= 3) {
    verdict = '❌ request changes';
  } else if (warnings.length > 0 || issues.length > 0) {
    verdict = '⚠️ approve with notes';
  } else {
    verdict = '✅ approved';
  }

  return { verdict, notes: [`verdict: ${verdict}`] };
}

// --- Main pipeline ---

export function compileReview(code) {
  const stageResults = [];

  for (const stage of STAGES) {
    let result;
    if (stage.id === 'EMIT') {
      result = stage.run(stageResults);
    } else {
      result = stage.run(code);
    }
    stageResults.push({ id: stage.id, symbol: stage.symbol, result });
  }

  return {
    stages: stageResults,
    summary: stageResults.map(s =>
      `${s.symbol} ${s.id.padEnd(10)} · ${s.result.notes.join(' · ')}`
    ).join('\n'),
    verdict: stageResults[stageResults.length - 1].result.verdict,
  };
}

export { STAGES };
