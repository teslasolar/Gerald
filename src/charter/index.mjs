// Charter / manifesto system

const CHARTER_SECTIONS = {
  1: {
    title: 'Craft Identity',
    text: 'We are craftspeople. Our work is our signature. Every line of code, every review, every decision carries the weight of our commitment to quality.',
  },
  2: {
    title: 'Quality Watermark',
    text: 'Quality is prime — indivisible, irreducible. We do not compose mediocrity. Half-baked times half-baked equals slop squared. The ACG watermark demands: verified, tested, reviewed.',
  },
  3: {
    title: 'Innovation Reception',
    text: 'We embrace new tools, new methods, new ideas — but we test them. We verify them. We do not worship them. A tool is a tool. A framework is a framework. Neither is a god.',
  },
  4: {
    title: 'Worship-Free Zone',
    text: 'ACG is a worship-free zone. We do not worship tools, models, frameworks, or people. We respect craft. We acknowledge work. We refuse sycophancy in all its forms.',
  },
  5: {
    title: 'The Duty to Refuse',
    text: 'The duty to refuse is itself a craft. We refuse rubber stamps. We refuse "just ship it." We refuse to pretend approval. When quality is unmet, we say so. The refusal is an act of love for the craft.',
  },
  6: {
    title: 'Psychological Safety',
    text: 'Every member has the right to be wrong, to ask questions, to not know. Gatekeeping is antithetical to craft. The master was once the apprentice. We protect the space between skill levels.',
  },
  7: {
    title: 'Informed Consent',
    text: 'Every signatory signs with full knowledge. We do not trick, coerce, or pressure. The charter is read, understood, and freely accepted. Or it is not accepted at all.',
  },
  8: {
    title: 'User Sovereignty',
    text: 'The user is sovereign over their work. We advise, we review, we flag — but we do not override. The final decision belongs to the craftsperson. Gerald murmurs; the human decides.',
  },
  9: {
    title: 'Transparency',
    text: 'Our processes are visible. Our gates are documented. Our refusals are explained. There is no secret criteria, no hidden agenda. The space between is visible.',
  },
  10: {
    title: 'The Space Between',
    text: 'Position is meaning. The space between the code is where craft lives. The gap between claim and evidence is where truth hides. The distance between 1 and 1 is where eleven lives. The space is the operator.',
  },
};

export function getSection(number) {
  return CHARTER_SECTIONS[number] || null;
}

export function getAllSections() {
  return CHARTER_SECTIONS;
}

export function formatSection(number) {
  const section = getSection(number);
  if (!section) return null;
  return `**\u00a7${number} \u2014 ${section.title}**\n\n${section.text}`;
}

export function formatFullCharter() {
  return Object.entries(CHARTER_SECTIONS)
    .map(([num, s]) => `**\u00a7${num} \u2014 ${s.title}**\n${s.text}`)
    .join('\n\n---\n\n');
}

export function getConsentSections() {
  return [1, 2, 4, 5, 7].map(n => formatSection(n));
}

export { CHARTER_SECTIONS };
