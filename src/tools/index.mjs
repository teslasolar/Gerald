// MCP dispatch layer - Discord tool wrappers

import { EmbedBuilder } from 'discord.js';
import { speak, formatRefusal, formatWarning, quip, MASKS } from '../voice/index.mjs';
import { logAudit } from '../db/index.mjs';

// --- Message tools ---

export async function send(channel, text) {
  logAudit('send', { channelId: channel.id, detail: text.slice(0, 200) });
  return channel.send(text);
}

export async function reply(message, text) {
  logAudit('reply', { channelId: message.channel.id, detail: text.slice(0, 200) });
  return message.reply(text);
}

export async function embed(channel, embedData) {
  const e = new EmbedBuilder()
    .setTitle(embedData.title || '')
    .setColor(embedData.color || 0xffcc44);

  if (embedData.description) e.setDescription(embedData.description);
  if (embedData.fields) {
    for (const f of embedData.fields) {
      e.addFields({ name: f.name, value: f.value, inline: f.inline || false });
    }
  }
  if (embedData.footer) e.setFooter(embedData.footer);
  if (embedData.thumbnail) e.setThumbnail(embedData.thumbnail);

  logAudit('embed', { channelId: channel.id, detail: embedData.title });
  return channel.send({ embeds: [e] });
}

export async function react(message, emoji) {
  logAudit('react', { channelId: message.channel.id, detail: emoji });
  return message.react(emoji);
}

export async function pin(message) {
  logAudit('pin', { channelId: message.channel.id });
  return message.pin();
}

export async function editMsg(message, text) {
  logAudit('edit', { channelId: message.channel.id, detail: text.slice(0, 200) });
  return message.edit(text);
}

export async function deleteMsg(message, reason) {
  logAudit('delete', { channelId: message.channel.id, detail: reason, level: 'mod' });
  return message.delete();
}

// --- Role tools ---

export async function roleAdd(member, roleName, guild) {
  const role = guild.roles.cache.find(r => r.name === roleName);
  if (!role) return null;
  logAudit('role_add', { targetId: member.id, detail: roleName });
  return member.roles.add(role);
}

export async function roleRemove(member, roleName, guild) {
  const role = guild.roles.cache.find(r => r.name === roleName);
  if (!role) return null;
  logAudit('role_remove', { targetId: member.id, detail: roleName });
  return member.roles.remove(role);
}

export async function promote(member, tier, guild) {
  const tierNames = ['Apprentice', 'Journeyman', 'Craftsman', 'Master', 'Elder'];
  const roleName = tierNames[tier];
  if (!roleName) return null;

  // Remove previous tier roles
  for (const name of tierNames) {
    const role = guild.roles.cache.find(r => r.name === name);
    if (role && member.roles.cache.has(role.id)) {
      await member.roles.remove(role);
    }
  }

  logAudit('promote', { targetId: member.id, detail: `→ ${roleName} (L${tier})` });
  return roleAdd(member, roleName, guild);
}

// --- Moderation tools ---

export async function warn(member, reason, channel) {
  logAudit('warn', { targetId: member.id, detail: reason, level: 'mod' });
  const e = formatWarning(reason);
  return embed(channel, e);
}

export async function timeout(member, durationMs, reason) {
  logAudit('timeout', { targetId: member.id, detail: `${durationMs}ms: ${reason}`, level: 'mod' });
  return member.timeout(durationMs, reason);
}

export async function ban(member, reason) {
  logAudit('ban', { targetId: member.id, detail: reason, level: 'mod' });
  return member.ban({ reason });
}

export async function unban(guild, userId) {
  logAudit('unban', { targetId: userId, level: 'mod' });
  return guild.members.unban(userId);
}

export async function purge(channel, count) {
  logAudit('purge', { channelId: channel.id, detail: `${count} messages`, level: 'mod' });
  return channel.bulkDelete(count, true);
}

// --- Review tools ---

export async function postRefusal(channel, reason, charterRef) {
  const data = formatRefusal(reason, charterRef);
  return embed(channel, data);
}

export async function postWarning(channel, issue, charterRef) {
  const data = formatWarning(issue, charterRef);
  return embed(channel, data);
}

// --- Gerald-specific tools ---

export async function geraldQuip(channel, category) {
  const q = quip(category);
  if (q) {
    return send(channel, speak(q, MASKS.GERALD));
  }
}

export async function geraldRefuse(channel, reason, level) {
  const data = formatRefusal(reason);
  return embed(channel, data);
}

export async function geraldUnmask(channel) {
  return send(channel, speak('the mask falls · the duck speaks', MASKS.GERALD));
}

// --- Prime test ---

export function primeTest(n) {
  const num = parseInt(n, 10);
  if (isNaN(num) || num < 2) return { isPrime: false, n: num, factors: [], note: 'not a natural number > 1' };

  if (num === 2) return { isPrime: true, n: num, factors: [], note: 'the first prime · the only even prime' };
  if (num % 2 === 0) return { isPrime: false, n: num, factors: [2, num / 2], note: 'even · divisible' };

  const factors = [];
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) {
      factors.push(i, num / i);
    }
  }

  if (factors.length === 0) {
    return { isPrime: true, n: num, factors: [], note: 'indivisible · a prime · like you, caro' };
  }

  return { isPrime: false, n: num, factors: [...new Set(factors)].sort((a, b) => a - b), note: 'composite · it divides' };
}
