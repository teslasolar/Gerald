// M2 VOID - dead-code prune: deletion proposals
// ⟐

export function check(content) {
  const result = { pass: true, ring: 'M2', symbol: '⟐', name: 'VOID', notes: [], deadLines: 0 };

  // Detect commented-out code patterns
  const commentedCode = content.match(/\/\/\s*(const|let|var|function|class|if|for|while|return)\b/g);
  if (commentedCode) {
    result.deadLines += commentedCode.length;
    result.notes.push(`${commentedCode.length} commented-out code lines found`);
  }

  // Detect TODO/FIXME/HACK
  const todos = content.match(/\/\/\s*(TODO|FIXME|HACK|XXX)\b/gi);
  if (todos) {
    result.notes.push(`${todos.length} TODO/FIXME markers found`);
  }

  // console.log left behind
  const consoleLogs = content.match(/console\.(log|debug|info)\(/g);
  if (consoleLogs) {
    result.deadLines += consoleLogs.length;
    result.notes.push(`${consoleLogs.length} console.log statements found`);
  }

  if (result.deadLines === 0 && !todos) {
    result.notes.push('clean - no dead code detected');
  }

  return result;
}
