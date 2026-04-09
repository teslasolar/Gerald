// M4 OMEGA - final sign-off: Master role required
// ❋

export function check(innerResult, outerResults, reviewer) {
  const result = { pass: true, ring: 'M4', symbol: '❋', name: 'OMEGA', notes: [], verdict: 'pending' };

  // Collect all notes from outer rings
  const outerNotes = (outerResults || []).flatMap(r => r.notes);
  const outerIssues = outerNotes.filter(n =>
    n.includes('no rationale') ||
    n.includes('large changeset') ||
    n.includes('dead code') ||
    n.includes('high cross-project')
  );

  // Inner ring pass status
  const innerPassed = innerResult?.passed ?? true;

  if (!innerPassed) {
    result.pass = false;
    result.verdict = 'reject';
    result.notes.push('inner rings failed - cannot sign off');
  } else if (outerIssues.length >= 3) {
    result.verdict = 'request_changes';
    result.notes.push(`${outerIssues.length} outer ring concerns - request changes`);
  } else if (outerIssues.length > 0) {
    result.verdict = 'approve_with_notes';
    result.notes.push(`${outerIssues.length} minor concerns - approve with notes`);
  } else {
    result.verdict = 'approve';
    result.notes.push('all rings clear - approved');
  }

  // Check reviewer tier
  if (reviewer && reviewer.tier < 3) {
    result.notes.push('note: Master role (L3+) required for final sign-off');
  }

  return result;
}
