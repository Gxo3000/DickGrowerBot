import { db } from 'sdk';
import { sql } from 'sdk/db';

const EMPTY = { adventures: 0, adventures_won: 0, boss_damage: 0, boss_kills: 0, earned: 0 };

// True for the first adventure of the player in the chat on `day`.
export async function claimAdventure(uid, chatId, day) {
  const result = await db.run(sql`
    INSERT INTO pve_stats (uid, chat_id, adventure_day, adventures) VALUES (${uid}, ${chatId}, ${day}, 1)
    ON CONFLICT (uid, chat_id) DO UPDATE SET
      adventure_day = excluded.adventure_day,
      adventures = pve_stats.adventures + 1
      WHERE pve_stats.adventure_day < excluded.adventure_day
    RETURNING uid`);
  return result.rows.length > 0;
}

export async function adventureDay(uid, chatId) {
  const row = await db.get(sql`SELECT adventure_day FROM pve_stats WHERE uid = ${uid} AND chat_id = ${chatId}`);
  return row?.adventure_day ?? 0;
}

export async function recordProgress(uid, chatId, { won = 0, damage = 0, kills = 0, earned = 0 }) {
  await db.run(sql`
    INSERT INTO pve_stats (uid, chat_id, adventures_won, boss_damage, boss_kills, earned)
    VALUES (${uid}, ${chatId}, ${won}, ${damage}, ${kills}, ${earned})
    ON CONFLICT (uid, chat_id) DO UPDATE SET
      adventures_won = pve_stats.adventures_won + excluded.adventures_won,
      boss_damage = pve_stats.boss_damage + excluded.boss_damage,
      boss_kills = pve_stats.boss_kills + excluded.boss_kills,
      earned = pve_stats.earned + excluded.earned`);
}

export async function getPveStats(uid, chatId) {
  const row = await db.get(sql`
    SELECT adventures, adventures_won, boss_damage, boss_kills, earned FROM pve_stats
    WHERE uid = ${uid} AND chat_id = ${chatId}`);
  return row ?? EMPTY;
}
