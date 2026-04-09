// messageUpdate event handler - re-scan for slop

import { scanAll, highestSeverity } from '../reflexes/index.mjs';
import { logAudit } from '../db/index.mjs';

export async function handleMessageUpdate(oldMessage, newMessage) {
  if (newMessage.author?.bot) return;
  if (!newMessage.content) return;

  const results = scanAll(newMessage.content);
  const severity = highestSeverity(results);

  if (severity === 'ban' || severity === 'refuse') {
    logAudit('edit_scan', {
      actorId: newMessage.author.id,
      channelId: newMessage.channel.id,
      detail: `edited message flagged: severity=${severity}`,
      level: 'mod',
    });
  }
}
