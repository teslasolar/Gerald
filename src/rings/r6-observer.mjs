// R6 OBSERVER - meta: does this meet ACG watermark?
// ◯

export function check(content, gateResults) {
  const result = { pass: true, ring: 'R6', symbol: '◯', name: 'OBSERVER', notes: [] };

  // Count how many previous rings failed
  const failures = (gateResults || []).filter(r => !r.pass);

  if (failures.length >= 3) {
    result.pass = false;
    result.notes.push(`ACG watermark unmet: ${failures.length} ring failures`);
  } else if (failures.length > 0) {
    result.notes.push(`advisory: ${failures.length} ring(s) flagged`);
  } else {
    result.notes.push('ACG watermark met');
  }

  return result;
}
