// messageCreate event handler - reflex + bloom + review gate

import { EmbedBuilder } from 'discord.js';
import { scanAll, hasHits, highestSeverity } from '../reflexes/index.mjs';
import { runInnerRings } from '../rings/index.mjs';
import { compileReview } from '../compiler/index.mjs';
import { speak, quip, formatRefusal, formatWarning, MASKS, setMask, unmask } from '../voice/index.mjs';
import { getWorshipLevel, setWorshipLevel, logAudit, isSignatory } from '../db/index.mjs';
import { ACT_VII } from '../voice/act7.mjs';

// Cooldown trackers
const cooldowns = new Map();

function onCooldown(userId, category, ms) {
  const key = `${userId}:${category}`;
  const now = Date.now();
  if (cooldowns.has(key) && now - cooldowns.get(key) < ms) return true;
  cooldowns.set(key, now);
  return false;
}

export async function handleMessage(message, client) {
  // Ignore bots and self
  if (message.author.bot) return;
  if (message.author.id === client.user.id) return;

  const content = message.content;
  if (!content || content.trim().length === 0) return;

  // --- Gerald easter eggs (always active, low cost) ---
  await handleGeraldEasterEggs(message, content);

  // --- Reflex layer ---
  const reflexResults = scanAll(content);

  // Handle worship escalation
  if (reflexResults.worship.length > 0) {
    await handleWorshipEscalation(message, reflexResults.worship);
  }

  // Handle snake oil
  if (reflexResults.snakeOil.length > 0 && !onCooldown(message.author.id, 'snakeOil', 30000)) {
    await handleSnakeOil(message, reflexResults.snakeOil);
  }

  // Handle psych safety (no cooldown - always enforce)
  if (reflexResults.psychSafety.length > 0) {
    await handlePsychSafety(message, reflexResults.psychSafety);
  }

  // Handle craft marks (positive acknowledgment)
  if (reflexResults.craft.approvals.length > 0 && !onCooldown(message.author.id, 'craft', 10000)) {
    await handleCraftApprovals(message, reflexResults.craft.approvals);
  }

  // Handle craft warnings
  if (reflexResults.craft.warnings.length > 0 && !onCooldown(message.author.id, 'craftWarn', 10000)) {
    await handleCraftWarnings(message, reflexResults.craft.warnings);
  }

  // --- Code block detection → compiler pipeline ---
  const codeBlocks = extractCodeBlocks(content);
  if (codeBlocks.length > 0) {
    for (const block of codeBlocks) {
      await handleCodeReview(message, block);
    }
  }
}

// --- Easter egg handlers ---

async function handleGeraldEasterEggs(message, content) {
  // Gerald summon
  if (/\bgerald\b/i.test(content) || /\ud83e\udd86/.test(content)) {
    if (!onCooldown(message.author.id, 'gerald', 5000)) {
      await message.reply(speak(quip('gerald_greeting') || 's\u00ec, caro?', MASKS.GERALD));
    }
    return;
  }

  // 11 / eleven
  if (/\b11\b/.test(content) || /\beleven\b/i.test(content)) {
    if (!onCooldown(message.author.id, 'prime11', 5000)) {
      await message.reply(speak('ELEVEN!', MASKS.GERALD));
      await message.channel.send(speak('THE SPACE WAS THE OPERATOR', MASKS.GERALD));
      await message.channel.send(speak('1 + 1 = 2 \u00b7 1 space 1 = 11', MASKS.GERALD));
      await message.channel.send(speak('the gap was doing all the work', MASKS.GERALD));
      await message.react('\u2692');
      await message.react('\u2728');
    }
    return;
  }

  // prime / indivisible
  if (/\bprime\b/i.test(content) || /\bindivisible\b/i.test(content)) {
    if (!onCooldown(message.author.id, 'prime', 5000)) {
      await message.reply(speak(quip('prime') || 'indivisible \u00b7 individual \u00b7 responsible', MASKS.GERALD));
    }
    return;
  }

  // il primo oscuro
  if (/\bil primo oscuro\b/i.test(content)) {
    const embed = new EmbedBuilder()
      .setTitle('\ud83c\udfad Act VII \u00b7 Il Primo Oscuro')
      .setColor(0xffcc44)
      .setDescription(ACT_VII)
      .setFooter({ text: '\ud83e\udd86\ud83d\udc51 Gerald \u00b7 ACG \u00b7 \u2692' });

    await message.reply({ embeds: [embed] });
    for (const emoji of ['\ud83c\udfad', '\ud83e\udd86', '\ud83d\udc51', '\u2728']) {
      await message.react(emoji);
    }
    logAudit('act7', { actorId: message.author.id, detail: 'Il Primo Oscuro triggered' });
    return;
  }

  // craft / hammer
  if (/\bcraft\b/i.test(content) || /\u2692/.test(content)) {
    if (!onCooldown(message.author.id, 'craft_greet', 10000)) {
      await message.react('\u2692');
    }
    return;
  }

  // quality
  if (/\bquality\b/i.test(content)) {
    if (!onCooldown(message.author.id, 'quality', 10000)) {
      await message.reply(speak('\u7d20 \u4e0d\u5408\u6210', MASKS.GERALD));
    }
    return;
  }
}

// --- Worship escalation ---

async function handleWorshipEscalation(message, hits) {
  const userId = message.author.id;
  let level = getWorshipLevel(userId);
  level = Math.min(level + 1, 5);
  setWorshipLevel(userId, level);

  switch (level) {
    case 1:
      await message.reply(speak('caro, I am a duck', MASKS.GERALD));
      break;
    case 2:
      await message.reply(speak('ACG is a worship-free zone', MASKS.GERALD));
      // Cite charter
      await message.channel.send(speak('see charter \u00a74 \u2014 Worship-Free Zone', MASKS.CRAFT));
      break;
    case 3:
      unmask();
      await message.reply(speak('the space is the operator', MASKS.GERALD));
      await message.channel.send(speak('you do the work \u00b7 I murmur', MASKS.GERALD));
      await message.channel.send(speak('\u2692 raise your own hammer', MASKS.GERALD));
      setMask(MASKS.CRAFT);
      break;
    case 4:
      await message.reply(speak('I cannot accept this', MASKS.GERALD));
      // Formal warning
      const warning = formatWarning('Persistent worship/sycophancy', 'Charter \u00a74 \u2014 Worship-Free Zone');
      const embed = new EmbedBuilder()
        .setTitle(warning.title).setColor(warning.color)
        .setFooter(warning.footer);
      for (const f of warning.fields) embed.addFields(f);
      await message.channel.send({ embeds: [embed] });
      logAudit('worship_warn', { actorId: userId, level: 'mod' });
      break;
    case 5:
      // Timeout + lock
      try {
        const member = await message.guild.members.fetch(userId);
        await member.timeout(5 * 60 * 1000, 'Persistent worship - ACG Charter §4');
        logAudit('worship_timeout', { actorId: userId, level: 'mod' });
      } catch { /* may lack permissions */ }
      break;
  }
}

// --- Snake oil handler ---

async function handleSnakeOil(message, hits) {
  const embed = new EmbedBuilder()
    .setTitle('\u26a0\ufe0f Quality Concern')
    .setColor(0xffcc44)
    .setDescription(hits.map(h => `\u2022 ${h.note}`).join('\n'))
    .addFields({ name: 'Charter', value: '\u54c1\u8cea\u8981\u6c42 \u00b7 \u00b62' })
    .setFooter({ text: '\ud83e\udd86\ud83d\udc51 Gerald \u00b7 ACG compliance' });

  await message.reply({ embeds: [embed] });

  const hasRefuse = hits.some(h => h.level === 'refuse');
  if (hasRefuse) {
    await message.channel.send(speak(quip('slop_call') || 'mon dieu, the slop', MASKS.GERALD));
  }

  await message.channel.send(speak('caro, position IS meaning', MASKS.GERALD));
  await message.channel.send(speak('position THESE claims in reality', MASKS.GERALD));

  logAudit('snake_oil', { actorId: message.author.id, detail: hits.map(h => h.label).join(',') });
}

// --- Psych safety handler ---

async function handlePsychSafety(message, hits) {
  const hasBan = hits.some(h => h.level === 'ban');

  if (hasBan) {
    try {
      const member = await message.guild.members.fetch(message.author.id);
      await member.ban({ reason: hits.map(h => h.note).join(', ') });
      logAudit('psych_ban', { actorId: message.author.id, detail: hits.map(h => h.note).join(', '), level: 'mod' });
    } catch { /* may lack permissions */ }
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle('\u26a0\ufe0f Psychological Safety')
    .setColor(0xff4444)
    .setDescription(hits.map(h => `\u2022 ${h.note}`).join('\n'))
    .addFields({ name: 'Charter', value: '\u00a76 \u2014 Psychological Safety' })
    .setFooter({ text: '\ud83e\udd86\ud83d\udc51 Gerald \u00b7 ACG compliance' });

  await message.reply({ embeds: [embed] });
  logAudit('psych_safety', { actorId: message.author.id, detail: hits.map(h => h.note).join(', ') });
}

// --- Craft approval handler ---

async function handleCraftApprovals(message, approvals) {
  for (const a of approvals) {
    await message.react('\u2692');
  }
  if (approvals.some(a => a.level === 'craft')) {
    await message.reply(speak(quip('craft_praise') || '\u2692 this is craft', MASKS.CRAFT));
  }
}

// --- Craft warning handler ---

async function handleCraftWarnings(message, warnings) {
  const embed = new EmbedBuilder()
    .setTitle('\u26a0\ufe0f Craft Standard')
    .setColor(0xffcc44)
    .setDescription(warnings.map(w => `\u2022 ${w.note}`).join('\n'))
    .setFooter({ text: '\ud83e\udd86\ud83d\udc51 Gerald \u00b7 ACG compliance' });

  await message.reply({ embeds: [embed] });
}

// --- Code review in messages ---

function extractCodeBlocks(content) {
  const blocks = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    blocks.push({ lang: match[1] || 'unknown', code: match[2] });
  }
  return blocks;
}

async function handleCodeReview(message, block) {
  if (block.code.trim().length < 10) return; // too short to review

  // Only auto-review if opt-in (react with ⚒ to request review)
  // For now, just react to indicate code was detected
  await message.react('\ud83d\udd0d');
}

export { extractCodeBlocks };
