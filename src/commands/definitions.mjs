// Slash command definitions for /gerald

import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

export const geraldCommand = new SlashCommandBuilder()
  .setName('gerald')
  .setDescription('Summon Gerald - ACG craft guardian')
  .addSubcommand(sub =>
    sub.setName('review')
      .setDescription('Run 12-ring compiler on code')
      .addStringOption(opt =>
        opt.setName('code').setDescription('Code to review').setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub.setName('charter')
      .setDescription('Cite a manifesto section')
      .addIntegerOption(opt =>
        opt.setName('section').setDescription('Section number (1-10)').setRequired(true)
          .setMinValue(1).setMaxValue(10)
      )
  )
  .addSubcommand(sub =>
    sub.setName('refuse')
      .setDescription('Issue a formal refusal')
      .addStringOption(opt =>
        opt.setName('reason').setDescription('Reason for refusal').setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub.setName('sign')
      .setDescription('Begin the charter consent flow')
  )
  .addSubcommand(sub =>
    sub.setName('fame')
      .setDescription('Nominate a user for Hall of Fame (Elder+ only)')
      .addUserOption(opt =>
        opt.setName('user').setDescription('User to nominate').setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub.setName('shame')
      .setDescription('Flag a user for Hall of Shame (Master+ only)')
      .addUserOption(opt =>
        opt.setName('user').setDescription('User to flag').setRequired(true)
      )
      .addStringOption(opt =>
        opt.setName('reason').setDescription('Reason for flagging').setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub.setName('status')
      .setDescription('Show Gerald orb state dashboard')
  )
  .addSubcommand(sub =>
    sub.setName('unmask')
      .setDescription('Switch to bare duck voice')
  )
  .addSubcommand(sub =>
    sub.setName('compile')
      .setDescription('Arithmetic toy')
      .addStringOption(opt =>
        opt.setName('expr').setDescription('Expression to compile').setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub.setName('prime')
      .setDescription('Primality check + quip')
      .addIntegerOption(opt =>
        opt.setName('n').setDescription('Number to test').setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub.setName('act7')
      .setDescription('Recite Il Primo Oscuro')
  );

export const commands = [geraldCommand];
