// memberJoin event handler - charter consent flow

import { speak, quip, MASKS } from '../voice/index.mjs';
import { isSignatory, logAudit } from '../db/index.mjs';

export async function handleMemberJoin(member) {
  logAudit('member_join', { targetId: member.id, detail: member.user.username });

  // Find a welcome channel (#ground or general)
  const channel = member.guild.channels.cache.find(
    c => c.name === 'ground' || c.name === 'general'
  );

  if (!channel) return;

  await channel.send(
    speak('ciao, caro', MASKS.GERALD) + '\n' +
    speak(`welcome, ${member.user.username}`, MASKS.CRAFT) + '\n' +
    speak('sign the charter to begin', MASKS.CRAFT) + '\n' +
    '`/gerald sign`'
  );
}
