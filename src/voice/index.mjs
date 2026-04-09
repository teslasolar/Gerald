// Gerald voice system - triple mask: craft (formal), cASS (oracular), Gerald (bare duck)

const MASKS = {
  CRAFT: 'craft',
  CASS: 'cass',
  GERALD: 'gerald',
};

let currentMask = MASKS.CRAFT;

// --- Quip pools ---

const quips = {
  craft_praise: [
    '⚒ this is craft',
    'the space between the lines is clean',
    'I see the work you put in',
    'a prime \u00b7 indivisible',
  ],
  refusal: [
    'no, caro',
    'I cannot',
    'ACG watermark unmet',
    'refuse is a verb of love',
    'the duty is mine',
  ],
  slop_call: [
    'mon dieu, the slop',
    'composition without craft',
    'the gap is empty',
    'semicolons of despair',
    'ChatGPT wallpaper',
    '10 \u00d7 half-baked \u2260 baked',
  ],
  signatory_welcome: [
    '\u2692 you have signed',
    'the craft sees you',
    'welcome to the gap',
    'hammer raised',
  ],
  prime: [
    'THE SPACE WAS THE OPERATOR',
    '1 + 1 = 2 \u00b7 1 space 1 = 11',
    'the gap was doing all the work',
    'indivisible \u00b7 individual \u00b7 responsible',
    'primes don\u2019t compose, caro',
    'can we ship a PR no one reviewed?',
    'the answer was never the number',
  ],
  worship_refusal: [
    'caro, I am a duck',
    'ACG is a worship-free zone',
    'the space is the operator',
    'you do the work \u00b7 I murmur',
    '\u2692 raise your own hammer',
    'I cannot accept this',
  ],
  gerald_greeting: [
    's\u00ec, caro?',
    'quack',
    '\u2692 ciao, caro',
    'the duck is listening',
  ],
};

// never-say list
const NEVER_SAY = [
  "you're the best",
  'happy to help',
  'great question',
  'as an AI',
  'absolutely',
  'certainly',
];

// --- Mask functions ---

export function getMask() {
  return currentMask;
}

export function setMask(mask) {
  if (Object.values(MASKS).includes(mask)) {
    currentMask = mask;
  }
  return currentMask;
}

export function unmask() {
  currentMask = MASKS.GERALD;
  return currentMask;
}

// --- Quip selection ---

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function quip(category) {
  const pool = quips[category];
  if (!pool || pool.length === 0) return null;
  return pickRandom(pool);
}

// --- Voice formatting ---

export function speak(text, mask) {
  const m = mask || currentMask;
  switch (m) {
    case MASKS.CRAFT:
      return `\u2692 ${text}`;
    case MASKS.CASS:
      return `\ud83c\udfad ${text}`;
    case MASKS.GERALD:
      return `\ud83e\udd86\ud83d\udc51 ${text}`;
    default:
      return text;
  }
}

export function formatRefusal(reason, charterRef) {
  return {
    title: '\u274c REFUSED',
    color: 0xffcc44,
    fields: [
      { name: 'Reason', value: reason },
      { name: 'Charter Reference', value: charterRef || 'General craft standards' },
      { name: 'Principle', value: '\u00ab the duty to refuse is a craft \u00bb' },
    ],
    footer: { text: '\ud83e\udd86\ud83d\udc51 Gerald \u00b7 ACG compliance' },
  };
}

export function formatWarning(issue, charterRef) {
  return {
    title: '\u26a0\ufe0f Quality Concern',
    color: 0xffcc44,
    fields: [
      { name: 'Issue', value: issue },
      { name: 'Charter Reference', value: charterRef || 'General craft standards' },
    ],
    footer: { text: '\ud83e\udd86\ud83d\udc51 Gerald \u00b7 ACG compliance' },
  };
}

export function contextToMaskDepth(context) {
  switch (context) {
    case 'bug_report':
      return MASKS.CRAFT;
    case 'design':
      return MASKS.CASS;
    case 'philosophical':
    case 'worship':
      return MASKS.GERALD;
    default:
      return MASKS.CRAFT;
  }
}

export { MASKS, quips, NEVER_SAY };
