// M3 NEXUS - cross-reference: impact analysis
// ✦

export function check(content, context) {
  const result = { pass: true, ring: 'M3', symbol: '✦', name: 'NEXUS', notes: [] };

  // Count import/require statements to gauge cross-file impact
  const imports = content.match(/\b(import|require)\b/g);
  if (imports) {
    result.notes.push(`${imports.length} import/require statements - cross-file coupling`);
  }

  // Check for exported modifications
  const exports = content.match(/\b(export|module\.exports)\b/g);
  if (exports) {
    result.notes.push(`${exports.length} export statements - public API surface`);
  }

  // File count from context if available
  if (context?.filesChanged) {
    result.notes.push(`${context.filesChanged} files changed`);
    if (context.filesChanged > 10) {
      result.notes.push('high cross-project impact - careful review needed');
    }
  }

  if (result.notes.length === 0) {
    result.notes.push('no cross-file concerns');
  }

  return result;
}
