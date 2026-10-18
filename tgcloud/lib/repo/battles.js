import { db } from 'sdk';
import { sql } from 'sdk/db';
import { DAY_SECONDS, nowSec } from '../time.js';

const COLUMNS = sql`battles_total, battles_won, win_streak_current, win_streak_max, acquired_length, lost_length`;

// True for the first acceptor of an offer only; every later press of the same button is refused.
export async function claimBattle(key) {
  const result = await db.run(sql`
    INSERT INTO battle_claims (key, created_at) VALUES (${key}, ${nowSec()})
    ON CONFLICT DO NOTHING RETURNING key`);
  return result.rows.length > 0;
}

export async function releaseBattle(key) {
  await db.run(sql`DELETE FROM battle_claims WHERE key = ${key}`);
}

export async function forgetOldClaims() {
  await db.run(sql`DELETE FROM battle_claims WHERE created_at < ${nowSec() - 2 * DAY_SECONDS}`);
}

export async function recordBattle(chatId, winner, loser, bet) {
  const before = await db.get(sql`
    SELECT win_streak_current FROM battle_stats WHERE uid = ${loser} AND chat_id = ${chatId}`);
  const winnerResult = await db.run(sql`
    INSERT INTO battle_stats (uid, chat_id, battles_total, battles_won, win_streak_current, win_streak_max, acquired_length)
    VALUES (${winner}, ${chatId}, 1, 1, 1, 1, ${bet})
    ON CONFLICT (uid, chat_id) DO UPDATE SET
      battles_total = battle_stats.battles_total + 1,
      battles_won = battle_stats.battles_won + 1,
      win_streak_current = battle_stats.win_streak_current + 1,
      win_streak_max = max(battle_stats.win_streak_max, battle_stats.win_streak_current + 1),
      acquired_length = battle_stats.acquired_length + excluded.acquired_length
    RETURNING ${COLUMNS}`);
  const loserResult = await db.run(sql`
    INSERT INTO battle_stats (uid, chat_id, battles_total, battles_won, win_streak_current, win_streak_max, lost_length)
    VALUES (${loser}, ${chatId}, 1, 0, 0, 0, ${bet})
    ON CONFLICT (uid, chat_id) DO UPDATE SET
      battles_total = battle_stats.battles_total + 1,
      win_streak_current = 0,
      lost_length = battle_stats.lost_length + excluded.lost_length
    RETURNING ${COLUMNS}`);
  return {
    winner: winnerResult.rows[0],
    loser: { ...loserResult.rows[0], prev_win_streak: before?.win_streak_current ?? 0 },
  };
}

export async function getBattleStats(uid, chatId) {
  const row = await db.get(sql`SELECT ${COLUMNS} FROM battle_stats WHERE uid = ${uid} AND chat_id = ${chatId}`);
  return row ?? {
    battles_total: 0, battles_won: 0, win_streak_current: 0, win_streak_max: 0, acquired_length: 0, lost_length: 0,
  };
}
