// reactionAdd event handler - fame/shame vote tally + review trigger

import { compileReview } from '../compiler/index.mjs';
import { speak, MASKS } from '../voice/index.mjs';
import { logAudit } from '../db/index.mjs';
import { EmbedBuilder } from 'discord.js';

export async function handleReactionAdd(reaction, user) {
  if (user.bot) return;

  // If someone reacts with ⚒ on a message with code, trigger review
  if (reaction.emoji.name === '\u2692') {
    const message = reaction.message;
    if (message.partial) await message.fetch();

    const codeMatch = message.content?.match(/```(\w*)\n([\s\S]*?)```/);
    if (codeMatch && codeMatch[2].trim().length >= 10) {
      const result = compileReview(codeMatch[2]);

      const embed = new EmbedBuilder()
        .setTitle('\u2692 12-Ring Compiler Review')
        .setColor(result.verdict.includes('\u2705') ? 0x00cc44 : result.verdict.includes('\u26a0') ? 0xffcc44 : 0xff4444)
        .setDescription('```\n' + result.summary + '\n```')
        .addFields({ name: 'Verdict', value: result.verdict })
        .setFooter({ text: '\ud83e\udd86\ud83d\udc51 Gerald \u00b7 ACG compliance' });

      const thread = await message.startThread({ name: '\u2692 Code Review' });
      await thread.send({ embeds: [embed] });

      logAudit('code_review', { actorId: user.id, channelId: message.channel.id });
    }
  }
}
