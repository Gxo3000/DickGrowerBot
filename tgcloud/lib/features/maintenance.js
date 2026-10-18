import { config } from '../config.js';
import { today } from '../time.js';
import { claimMaintenance } from '../repo/chats.js';
import { forgetOldClaims } from '../repo/battles.js';
import { forgetOldRateLimits } from '../repo/state.js';
import { shrinkChat } from './shrink.js';
import { drawDueLotteries } from './lottery.js';
import { escapeExpiredBoss } from './boss.js';

// The chores of a chat's day — the shrink, the draws, an escaped boss — done by whichever
// request comes first after midnight, since the platform has no scheduler. Returns the messages
// to post in the chat.
export async function dailyChores(chat, lang) {
  const day = today();
  if (chat.maintained_day >= day || !(await claimMaintenance(chat.id, day))) return [];
  const chores = [
    () => shrinkChat(chat.id, day, lang),
    () => drawDueLotteries(chat.id, lang),
    () => escapeExpiredBoss(chat.id, lang),
    async () => {
      await forgetOldClaims();
      await forgetOldRateLimits(config.rateLimit.windowSeconds);
      return null;
    },
  ];
  const messages = [];
  for (const chore of chores) {
    try {
      const result = await chore();
      if (Array.isArray(result)) messages.push(...result);
      else if (result) messages.push(result);
    } catch (e) {
      console.error('a daily chore failed', e);
    }
  }
  return messages;
}
