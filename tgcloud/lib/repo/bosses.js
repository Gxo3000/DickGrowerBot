import { db } from 'sdk';
import { sql } from 'sdk/db';
import { nowSec } from '../time.js';

const COLUMNS = sql`id, chat_id, level, kind, max_hp, hp, status, spawned_at, finished_at, killer_uid`;

export async function aliveBoss(chatId) {
  return db.get(sql`SELECT ${COLUMNS} FROM bosses WHERE chat_id = ${chatId} AND status = 'alive'`);
}

export async function lastBoss(chatId) {
  return db.get(sql`SELECT ${COLUMNS} FROM bosses WHERE chat_id = ${chatId} ORDER BY id DESC LIMIT 1`);
}

export async function getBoss(id) {
  return db.get(sql`SELECT ${COLUMNS} FROM bosses WHERE id = ${id}`);
}

// Spawns a boss unless the chat already has a live one; returns the live one either way.
export async function spawnBoss(chatId, { level, kind, hp }) {
  await db.run(sql`
    INSERT INTO bosses (chat_id, level, kind, max_hp, hp, spawned_at)
    VALUES (${chatId}, ${level}, ${kind}, ${hp}, ${hp}, ${nowSec()})
    ON CONFLICT DO NOTHING`);
  return aliveBoss(chatId);
}

// Takes the player's turn if the cooldown is over. Returns null on success, or the seconds left.
export async function claimHit(bossId, uid, cooldownSeconds) {
  const now = nowSec();
  const result = await db.run(sql`
    INSERT INTO boss_hits (boss_id, uid, last_hit_at) VALUES (${bossId}, ${uid}, ${now})
    ON CONFLICT (boss_id, uid) DO UPDATE SET last_hit_at = excluded.last_hit_at
      WHERE boss_hits.last_hit_at <= ${now - cooldownSeconds}
    RETURNING uid`);
  if (result.rows.length > 0) return null;
  const row = await db.get(sql`SELECT last_hit_at FROM boss_hits WHERE boss_id = ${bossId} AND uid = ${uid}`);
  return Math.max(1, row.last_hit_at + cooldownSeconds - now);
}

export async function recordDamage(bossId, uid, damage) {
  await db.run(sql`
    UPDATE boss_hits SET damage = damage + ${damage}, hits = hits + 1 WHERE boss_id = ${bossId} AND uid = ${uid}`);
}

// Returns the hit points left, or null when the boss is no longer alive.
export async function damageBoss(bossId, damage) {
  const result = await db.run(sql`
    UPDATE bosses SET hp = max(hp - ${damage}, 0) WHERE id = ${bossId} AND status = 'alive' RETURNING hp`);
  return result.rows[0]?.hp ?? null;
}

// True for the one caller whose hit killed the boss.
export async function claimKill(bossId, killerUid) {
  const result = await db.run(sql`
    UPDATE bosses SET status = 'defeated', finished_at = ${nowSec()}, killer_uid = ${killerUid}
    WHERE id = ${bossId} AND status = 'alive' AND hp = 0
    RETURNING id`);
  return result.rows.length > 0;
}

export async function escapeBoss(bossId) {
  const result = await db.run(sql`
    UPDATE bosses SET status = 'escaped', finished_at = ${nowSec()} WHERE id = ${bossId} AND status = 'alive'
    RETURNING id`);
  return result.rows.length > 0;
}

export async function raiders(bossId) {
  return db.all(sql`
    SELECT h.uid, u.name, h.damage, h.hits FROM boss_hits h JOIN users u ON u.uid = h.uid
    WHERE h.boss_id = ${bossId} AND h.damage > 0
    ORDER BY h.damage DESC, h.uid`);
}
