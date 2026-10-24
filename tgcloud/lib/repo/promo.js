import { db } from 'sdk';
import { sql } from 'sdk/db';
import { nowSec, today } from '../time.js';

// Codes are kept in lower case, folded here rather than by SQLite, whose lower() knows only ASCII.
export async function findCode(code) {
  return db.get(sql`
    SELECT code, bonus_length, since_day, until_day, capacity FROM promo_codes
    WHERE code = ${code.toLowerCase()} OR lower(code) = lower(${code})
    LIMIT 1`);
}

export async function wasActivated(uid, code) {
  const row = await db.get(sql`SELECT 1 AS found FROM promo_activations WHERE uid = ${uid} AND code = ${code}`);
  return row !== null;
}

// Takes one activation of the code, if any is left. True on success.
export async function takeCapacity(code) {
  const result = await db.run(sql`
    UPDATE promo_codes SET capacity = capacity - 1 WHERE code = ${code} AND capacity > 0 RETURNING capacity`);
  return result.rows.length > 0;
}

export async function returnCapacity(code) {
  await db.run(sql`UPDATE promo_codes SET capacity = capacity + 1 WHERE code = ${code}`);
}

// True when this is the first activation of the code by the user.
export async function recordActivation(uid, code, affectedChats) {
  const result = await db.run(sql`
    INSERT INTO promo_activations (uid, code, affected_chats, activated_at)
    VALUES (${uid}, ${code}, ${affectedChats}, ${nowSec()})
    ON CONFLICT (uid, code) DO NOTHING RETURNING uid`);
  return result.rows.length > 0;
}

export async function setAffectedChats(uid, code, affectedChats) {
  await db.run(sql`
    UPDATE promo_activations SET affected_chats = ${affectedChats} WHERE uid = ${uid} AND code = ${code}`);
}

// True when the code is new.
export async function createCode({ code: given, bonus, capacity, days }) {
  const code = given.toLowerCase();
  const since = today();
  const until = days ? since + days - 1 : null;
  const result = await db.run(sql`
    INSERT INTO promo_codes (code, bonus_length, since_day, until_day, capacity, created_at)
    VALUES (${code}, ${bonus}, ${since}, ${until}, ${capacity}, ${nowSec()})
    ON CONFLICT DO NOTHING RETURNING code`);
  return result.rows.length > 0;
}

export async function listCodes() {
  return db.all(sql`
    SELECT code, bonus_length, since_day, until_day, capacity FROM promo_codes ORDER BY created_at DESC LIMIT 30`);
}
