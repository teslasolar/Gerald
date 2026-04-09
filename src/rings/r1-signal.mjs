// R1 SIGNAL - meaning extraction: signal/noise ratio
// 〜

export function check(content) {
  const result = { pass: true, ring: 'R1', symbol: '〜', name: 'SIGNAL', notes: [], ratio: 1.0 };

  const words = content.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;

  if (totalWords === 0) {
    result.pass = false;
    result.notes.push('no signal');
    result.ratio = 0;
    return result;
  }

  // Noise words
  const noiseWords = new Set([
    'um', 'uh', 'like', 'just', 'basically', 'literally', 'actually',
    'honestly', 'really', 'very', 'totally', 'definitely', 'obviously',
  ]);

  const noiseCount = words.filter(w => noiseWords.has(w.toLowerCase())).length;
  result.ratio = 1 - (noiseCount / totalWords);

  // Excessive emoji ratio
  const emojiCount = (content.match(/\p{Emoji}/gu) || []).length;
  const emojiRatio = emojiCount / totalWords;

  if (emojiRatio > 0.7 && totalWords > 3) {
    result.notes.push(`high emoji ratio: ${(emojiRatio * 100).toFixed(0)}%`);
    result.ratio *= 0.5;
  }

  if (result.ratio < 0.3) {
    result.pass = false;
    result.notes.push(`low signal: ${(result.ratio * 100).toFixed(0)}%`);
  } else {
    result.notes.push(`signal: ${(result.ratio * 100).toFixed(0)}%`);
  }

  return result;
}
