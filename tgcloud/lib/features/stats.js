import { config } from '../config.js';
import { t } from '../i18n.js';
import { percentage } from '../html.js';
import { getDick, personalStats, positionOf } from '../repo/dicks.js';
import { getBattleStats } from '../repo/battles.js';
import { readPerkStates } from '../repo/perks.js';
import { getPveStats } from '../repo/pve.js';
import { streakLine } from './increment.js';

export async function chatStats({ chat, user, lang }) {
  const dick = await getDick(user.uid, chat.id);
  const position = dick ? await positionOf(user.uid, chat.id) : 0;
  const parts = [t(lang, 'commands.stats.length', { length: dick?.length ?? 0, pos: position ?? 0 })];
  const streak = streakLine(await readPerkStates(user.uid, chat.id), lang);
  if (streak) parts[0] += `\n${streak}`;

  if (config.pvp.showStats) {
    const battles = await getBattleStats(user.uid, chat.id);
    parts.push(t(lang, 'commands.stats.pvp', {
      win_rate: percentage(battles.battles_won, battles.battles_total),
      win_streak: battles.win_streak_max,
      battles: battles.battles_total,
      wins: battles.battles_won,
      acquired: battles.acquired_length,
      lost: battles.lost_length,
    }));
  }

  const pve = await getPveStats(user.uid, chat.id);
  parts.push(t(lang, 'commands.stats.pve', {
    adventures: pve.adventures,
    won: pve.adventures_won,
    damage: pve.boss_damage,
    kills: pve.boss_kills,
    earned: pve.earned,
  }));
  return { text: parts.join('\n\n') };
}

export async function personal({ user, lang }) {
  const stats = await personalStats(user.uid);
  return {
    text: t(lang, 'commands.stats.personal', {
      chats: stats.chats,
      max_length: stats.max_length,
      total_length: stats.total_length,
    }),
  };
}
