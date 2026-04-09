// Deploy slash commands to Discord

import { REST, Routes } from 'discord.js';
import { commands } from './definitions.mjs';
import 'dotenv/config';

const token = process.env.DISCORD_TOKEN;
const guildId = process.env.GUILD_ID;

if (!token) {
  console.error('DISCORD_TOKEN not set');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

const clientId = Buffer.from(token.split('.')[0], 'base64').toString();

const body = commands.map(c => c.toJSON());

try {
  console.log(`Deploying ${body.length} command(s)...`);

  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
    console.log(`Guild commands deployed to ${guildId}`);
  } else {
    await rest.put(Routes.applicationCommands(clientId), { body });
    console.log('Global commands deployed');
  }
} catch (err) {
  console.error('Deploy failed:', err);
  process.exit(1);
}
