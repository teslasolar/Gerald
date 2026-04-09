// M1 FLUX - transform review: diff analysis
// ⬡

export function check(diff) {
  const result = { pass: true, ring: 'M1', symbol: '⬡', name: 'FLUX', notes: [] };

  if (!diff) {
    result.notes.push('no diff provided');
    return result;
  }

  const lines = diff.split('\n');
  const additions = lines.filter(l => l.startsWith('+')).length;
  const deletions = lines.filter(l => l.startsWith('-')).length;
  const totalChanged = additions + deletions;

  result.notes.push(`+${additions} -${deletions} (${totalChanged} lines changed)`);

  if (totalChanged > 500) {
    result.notes.push('large changeset - consider splitting');
  }

  if (additions > 0 && deletions === 0) {
    result.notes.push('addition-only - verify no dead code introduced');
  }

  return result;
}
