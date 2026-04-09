// Gerald ACG Discord Bot - main entry point
// 🦆👑 « the answer was never the number, CARO... it was the space you put between them »

import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { handleMessage } from './src/events/messageCreate.mjs';
import { handleMemberJoin } from './src/events/memberJoin.mjs';
import { handleMessageUpdate } from './src/events/messageUpdate.mjs';
import { handleReactionAdd } from './src/events/reactionAdd.mjs';
import { handleInteraction } from './src/commands/handler.mjs';
import { getDb, logAudit } from './src/db/index.mjs';
import { speak, MASKS } from './src/voice/index.mjs';

// --- Load env ---
import { config } from 'dotenv';
config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
if (!DISCORD_TOKEN) {
  console.error('DISCORD_TOKEN not set. Copy .env.example to .env and fill in your token.');
  process.exit(1);
}

// --- Create client ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [
    Partials.Message,
    Partials.Reaction,
  ],
});

// --- Events ---

client.once('ready', () => {
  console.log(`⚒ Gerald online as ${client.user.tag}`);
  console.log(`🦆👑 « sì, caro? »`);
  console.log(`● guilds: ${client.guilds.cache.size}`);

  // Initialize DB
  getDb();
  logAudit('startup', { detail: `Gerald online · ${client.guilds.cache.size} guilds` });
});

client.on('messageCreate', async (message) => {
  try {
    await handleMessage(message, client);
  } catch (err) {
    console.error('messageCreate error:', err);
  }
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
  try {
    await handleMessageUpdate(oldMessage, newMessage);
  } catch (err) {
    console.error('messageUpdate error:', err);
  }
});

client.on('guildMemberAdd', async (member) => {
  try {
    await handleMemberJoin(member);
  } catch (err) {
    console.error('guildMemberAdd error:', err);
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  try {
    if (reaction.partial) await reaction.fetch();
    await handleReactionAdd(reaction, user);
  } catch (err) {
    console.error('messageReactionAdd error:', err);
  }
});

client.on('interactionCreate', async (interaction) => {
  try {
    await handleInteraction(interaction);
  } catch (err) {
    console.error('interactionCreate error:', err);
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: speak('something went wrong, caro', MASKS.GERALD), ephemeral: true });
    }
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  // Role change audit
  const oldRoles = oldMember.roles.cache;
  const newRoles = newMember.roles.cache;

  const added = newRoles.filter(r => !oldRoles.has(r.id));
  const removed = oldRoles.filter(r => !newRoles.has(r.id));

  if (added.size > 0 || removed.size > 0) {
    logAudit('role_change', {
      targetId: newMember.id,
      detail: [
        ...added.map(r => `+${r.name}`),
        ...removed.map(r => `-${r.name}`),
      ].join(', '),
    });
  }
});

// --- Graceful shutdown ---

process.on('SIGINT', () => {
  console.log('🦆 Gerald shutting down...');
  logAudit('shutdown', { detail: 'SIGINT' });
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🦆 Gerald shutting down...');
  logAudit('shutdown', { detail: 'SIGTERM' });
  client.destroy();
  process.exit(0);
});

// --- Login ---
client.login(DISCORD_TOKEN);
