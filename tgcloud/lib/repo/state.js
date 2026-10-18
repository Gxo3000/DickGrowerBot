import { db } from 'sdk';
import { sql } from 'sdk/db';
import { nowSec } from '../time.js';
import { joinFragments } from './sql.js';

// The second step a private conversation is waiting for, kept for `seconds`.
export async function setDialogue(uid, kind, data, seconds) {
  await db.run(sql`
    INSERT INTO dialogues (uid, kind, data, expires_at) VALUES (${uid}, ${kind}, ${JSON.stringify(data ?? null)}, ${nowSec() + seconds})
    ON CONFLICT (uid) DO UPDATE SET kind = excluded.kind, data = excluded.data, expires_at = excluded.expires_at`);
}

export async function getDialogue(uid) {
  const row = await db.get(sql`
    SELECT kind, data FROM dialogues WHERE uid = ${uid} AND expires_at > ${nowSec()}`);
  return row && { kind: row.kind, data: row.data ? JSON.parse(row.data) : null };
}

export async function clearDialogue(uid) {
  await db.run(sql`DELETE FROM dialogues WHERE uid = ${uid}`);
}

// True when the cooldown under `key` was over and is now started again for `seconds`.
export async function takeCooldown(key, seconds) {
  const now = nowSec();
  const result = await db.run(sql`
    INSERT INTO cooldowns (key, until) VALUES (${key}, ${now + seconds})
    ON CONFLICT (key) DO UPDATE SET until = excluded.until WHERE cooldowns.until <= ${now}
    RETURNING key`);
  return result.rows.length > 0;
}

// Counts a request against every key in the current window; returns the counts by key.
export async function countRequests(keys, windowSeconds) {
  const window = Math.floor(nowSec() / windowSeconds);
  const values = joinFragments(keys.map((key) => sql`(${key}, ${window}, 1)`));
  const result = await db.run(sql`
    INSERT INTO rate_limits (key, window_no, hits) VALUES ${values}
    ON CONFLICT (key) DO UPDATE SET
      hits = CASE WHEN rate_limits.window_no = excluded.window_no THEN rate_limits.hits + 1 ELSE 1 END,
      window_no = excluded.window_no
    RETURNING key, hits`);
  return Object.fromEntries(result.rows.map((row) => [row.key, row.hits]));
}

export async function forgetOldRateLimits(windowSeconds) {
  const window = Math.floor(nowSec() / windowSeconds);
  await db.run(sql`DELETE FROM rate_limits WHERE window_no < ${window - 1}`);
}
