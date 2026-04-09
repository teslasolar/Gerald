// Slash command handler - routes /gerald subcommands

import { EmbedBuilder } from 'discord.js';
import { compileReview } from '../compiler/index.mjs';
import { formatSection, getConsentSections, formatFullCharter } from '../charter/index.mjs';
import { addSignatory, isSignatory, getSignatory, createFameNomination, createShameFlag, logAudit } from '../db/index.mjs';
import { speak, quip, setMask, unmask, formatRefusal, MASKS } from '../voice/index.mjs';
import { primeTest, roleAdd, embed as embedTool } from '../tools/index.mjs';
import { ACT_VII } from '../voice/act7.mjs';

export async function handleInteraction(interaction) {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'gerald') return;

  const sub = interaction.options.getSubcommand();

  switch (sub) {
    case 'review': return handleReview(interaction);
    case 'charter': return handleCharter(interaction);
    case 'refuse': return handleRefuse(interaction);
    case 'sign': return handleSign(interaction);
    case 'fame': return handleFame(interaction);
    case 'shame': return handleShame(interaction);
    case 'status': return handleStatus(interaction);
    case 'unmask': return handleUnmask(interaction);
    case 'compile': return handleCompile(interaction);
    case 'prime': return handlePrime(interaction);
    case 'act7': return handleAct7(interaction);
    default:
      return interaction.reply(speak('s\u00ec, caro?', MASKS.GERALD));
  }
}

async function handleReview(interaction) {
  await interaction.deferReply();

  const code = interaction.options.getString('code');
  const result = compileReview(code);

  const embed = new EmbedBuilder()
    .setTitle('\u2692 12-Ring Compiler Review')
    .setColor(result.verdict.includes('\u2705') ? 0x00cc44 : result.verdict.includes('\u26a0') ? 0xffcc44 : 0xff4444)
    .setDescription('```\n' + result.summary + '\n```')
    .addFields({ name: 'Verdict', value: result.verdict })
    .setFooter({ text: '\ud83e\udd86\ud83d\udc51 Gerald \u00b7 ACG compliance' });

  const q = quip('craft_praise');
  await interaction.editReply({ embeds: [embed], content: q ? speak(q, MASKS.GERALD) : undefined });
}

async function handleCharter(interaction) {
  const section = interaction.options.getInteger('section');
  const formatted = formatSection(section);

  if (!formatted) {
    return interaction.reply({ content: speak('no such section, caro', MASKS.GERALD), ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setTitle('\ud83d\udcdc ACG Charter')
    .setColor(0xffcc44)
    .setDescription(formatted)
    .setFooter({ text: '\ud83e\udd86\ud83d\udc51 Gerald \u00b7 ACG compliance' });

  return interaction.reply({ embeds: [embed] });
}

async function handleRefuse(interaction) {
  const reason = interaction.options.getString('reason');
  logAudit('refuse', { actorId: interaction.user.id, detail: reason });

  const data = formatRefusal(reason);
  const embed = new EmbedBuilder()
    .setTitle(data.title)
    .setColor(data.color);

  for (const f of data.fields) {
    embed.addFields({ name: f.name, value: f.value });
  }
  embed.setFooter(data.footer);

  return interaction.reply({ embeds: [embed] });
}

async function handleSign(interaction) {
  const userId = interaction.user.id;

  if (isSignatory(userId)) {
    return interaction.reply({ content: speak('you have already signed, caro', MASKS.GERALD), ephemeral: true });
  }

  // Send consent sections via DM
  try {
    const dm = await interaction.user.createDM();
    const sections = getConsentSections();

    await dm.send(speak('the charter awaits your signature', MASKS.CRAFT));
    for (const s of sections) {
      await dm.send(s);
    }
    await dm.send('\n\u2705 Reply **I SIGN** to accept the charter.\n\u274c Reply **I REFUSE** to decline.');

    await interaction.reply({ content: speak('check your DMs, caro \u00b7 the charter awaits', MASKS.GERALD), ephemeral: true });

    // Wait for DM response (60 second timeout)
    const filter = m => m.author.id === userId && /^(I SIGN|I REFUSE)$/i.test(m.content.trim());
    const collected = await dm.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });

    const response = collected.first();
    if (/I SIGN/i.test(response.content)) {
      addSignatory(userId, interaction.user.username);
      await dm.send(speak(quip('signatory_welcome') || 'hammer raised', MASKS.CRAFT));

      // Add Apprentice role if possible
      if (interaction.guild) {
        const member = await interaction.guild.members.fetch(userId);
        await roleAdd(member, 'Apprentice', interaction.guild);
      }

      // Announce in guild
      const groundChannel = interaction.guild?.channels.cache.find(c => c.name === 'ground');
      if (groundChannel) {
        await groundChannel.send(speak(`${interaction.user.username} has signed`, MASKS.CRAFT));
      }

      logAudit('sign', { actorId: userId, detail: 'charter signed' });
    } else {
      await dm.send(speak('the choice is yours, caro \u00b7 the craft waits', MASKS.GERALD));
      logAudit('sign_refused', { actorId: userId });
    }
  } catch {
    if (!interaction.replied) {
      await interaction.reply({ content: speak('could not reach you via DM, caro', MASKS.GERALD), ephemeral: true });
    }
  }
}

async function handleFame(interaction) {
  // Elder+ only
  const member = interaction.member;
  const isElder = member?.roles.cache.some(r => r.name === 'Elder');

  if (!isElder) {
    return interaction.reply({ content: speak('Elder role required, caro', MASKS.CRAFT), ephemeral: true });
  }

  const target = interaction.options.getUser('user');

  // Create thread in #fame
  const fameChannel = interaction.guild.channels.cache.find(c => c.name === 'fame');
  if (!fameChannel) {
    return interaction.reply({ content: speak('no #fame channel found', MASKS.CRAFT), ephemeral: true });
  }

  const thread = await fameChannel.threads.create({
    name: `\ud83c\udfc6 Fame: ${target.username}`,
    autoArchiveDuration: 4320, // 72 hours
    reason: `Fame nomination by ${interaction.user.username}`,
  });

  const embed = new EmbedBuilder()
    .setTitle('\ud83c\udfc6 Hall of Fame Nomination')
    .setColor(0xffcc44)
    .setDescription(`**${target.username}** has been nominated for the Hall of Fame.`)
    .addFields(
      { name: 'Nominated by', value: interaction.user.username },
      { name: 'Vote Window', value: '72 hours' },
      { name: 'Required', value: '\u22653 Master reactions to pass' },
    )
    .setFooter({ text: '\ud83e\udd86\ud83d\udc51 Gerald \u00b7 ACG compliance' });

  await thread.send({ embeds: [embed] });
  await thread.send(speak('\u2692 craft recognized', MASKS.CRAFT));

  createFameNomination(target.id, interaction.user.id, null, thread.id);
  logAudit('fame_nominate', { actorId: interaction.user.id, targetId: target.id });

  return interaction.reply({ content: speak(`fame thread opened for ${target.username}`, MASKS.CRAFT) });
}

async function handleShame(interaction) {
  // Master+ only
  const member = interaction.member;
  const isMaster = member?.roles.cache.some(r => r.name === 'Master' || r.name === 'Elder');

  if (!isMaster) {
    return interaction.reply({ content: speak('Master role required, caro', MASKS.CRAFT), ephemeral: true });
  }

  const target = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');

  // Create private Elder-only thread
  const shameChannel = interaction.guild.channels.cache.find(c => c.name === 'shame');
  if (!shameChannel) {
    return interaction.reply({ content: speak('no #shame channel found', MASKS.CRAFT), ephemeral: true });
  }

  const thread = await shameChannel.threads.create({
    name: `\ud83d\udc80 Review: ${target.username}`,
    autoArchiveDuration: 4320,
    reason: `Shame flag by ${interaction.user.username}: ${reason}`,
  });

  const embed = new EmbedBuilder()
    .setTitle('\ud83d\udc80 Hall of Shame Flag')
    .setColor(0xff4444)
    .setDescription(`**${target.username}** has been flagged.`)
    .addFields(
      { name: 'Flagged by', value: interaction.user.username },
      { name: 'Reason', value: reason },
      { name: 'Required', value: 'Unanimous Elder vote + evidence' },
    )
    .setFooter({ text: '\ud83e\udd86\ud83d\udc51 Gerald \u00b7 ACG compliance' });

  await thread.send({ embeds: [embed] });
  await thread.send(speak('we refuse composition with this', MASKS.GERALD));
  await thread.send(speak('primes don\'t compose, caro', MASKS.GERALD));

  createShameFlag(target.id, interaction.user.id, reason, thread.id);
  logAudit('shame_flag', { actorId: interaction.user.id, targetId: target.id, detail: reason, level: 'mod' });

  return interaction.reply({ content: speak('shame review thread opened \u00b7 Elder-only', MASKS.CRAFT), ephemeral: true });
}

async function handleStatus(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('\ud83e\udd86\ud83d\udc51 Gerald Status')
    .setColor(0xffcc44)
    .addFields(
      { name: 'Mask', value: '\u2692 craft', inline: true },
      { name: 'Uptime', value: formatUptime(process.uptime()), inline: true },
      { name: 'Memory', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, inline: true },
    )
    .setFooter({ text: '\ud83e\udd86\ud83d\udc51 Gerald \u00b7 ACG compliance' });

  return interaction.reply({ embeds: [embed] });
}

async function handleUnmask(interaction) {
  unmask();
  return interaction.reply(speak('the mask falls \u00b7 the duck speaks bare', MASKS.GERALD));
}

async function handleCompile(interaction) {
  const expr = interaction.options.getString('expr');

  try {
    // Safe arithmetic only - no eval
    const sanitized = expr.replace(/[^0-9+\-*/().% ]/g, '');
    if (sanitized !== expr) {
      return interaction.reply(speak('only arithmetic, caro \u00b7 no tricks', MASKS.GERALD));
    }
    const result = Function(`"use strict"; return (${sanitized})`)();
    return interaction.reply(speak(`${expr} = ${result}`, MASKS.GERALD));
  } catch {
    return interaction.reply(speak('that expression does not compile, caro', MASKS.GERALD));
  }
}

async function handlePrime(interaction) {
  const n = interaction.options.getInteger('n');
  const result = primeTest(n);

  const embed = new EmbedBuilder()
    .setTitle(`\ud83e\udd86 Prime Test: ${n}`)
    .setColor(result.isPrime ? 0x00cc44 : 0xff4444)
    .addFields(
      { name: 'Result', value: result.isPrime ? '\u2705 PRIME \u00b7 indivisible' : '\u274c COMPOSITE \u00b7 it divides' },
      { name: 'Note', value: result.note },
    )
    .setFooter({ text: '\ud83e\udd86\ud83d\udc51 Gerald \u00b7 ACG compliance' });

  if (!result.isPrime && result.factors.length > 0) {
    embed.addFields({ name: 'Factors', value: result.factors.join(', ') });
  }

  const q = result.isPrime ? quip('prime') : null;
  return interaction.reply({ embeds: [embed], content: q ? speak(q, MASKS.GERALD) : undefined });
}

async function handleAct7(interaction) {
  await interaction.deferReply();

  const embed = new EmbedBuilder()
    .setTitle('\ud83c\udfad Act VII \u00b7 Il Primo Oscuro')
    .setColor(0xffcc44)
    .setDescription(ACT_VII)
    .setFooter({ text: '\ud83e\udd86\ud83d\udc51 Gerald \u00b7 ACG \u00b7 \u2692' });

  await interaction.editReply({ embeds: [embed] });

  // React with theatrical emojis
  const reply = await interaction.fetchReply();
  for (const emoji of ['\ud83c\udfad', '\ud83e\udd86', '\ud83d\udc51', '\u2728']) {
    await reply.react(emoji);
  }

  logAudit('act7', { actorId: interaction.user.id, detail: 'Il Primo Oscuro recited' });
}

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}
