// R0 GROUND - existence check: not empty, not bot-slop
// ● · fail fast

export function check(content, message) {
  const result = { pass: true, ring: 'R0', symbol: '●', name: 'GROUND', notes: [] };

  // Empty check
  if (!content || content.trim().length === 0) {
    result.pass = false;
    result.notes.push('empty message');
    return result;
  }

  // Bot-generated slop detection (extremely short + no substance)
  if (content.trim().length < 3 && !/\p{Emoji}/u.test(content)) {
    result.pass = false;
    result.notes.push('below minimum content threshold');
    return result;
  }

  // Skip bot messages
  if (message?.author?.bot) {
    result.pass = false;
    result.notes.push('bot message - skip');
    return result;
  }

  result.notes.push('exists · not empty · not bot');
  return result;
}
