import { db } from 'sdk';
import { sql } from 'sdk/db';
import { DAY_SECONDS, nowSec } from '../time.js';

export async function getDick(uid, chatId) {
  return db.get(sql`
    SELECT uid, chat_id, length, grown_at, bonus_attempts FROM dicks WHERE uid = ${uid} AND chat_id = ${chatId}`);
}

// The growth, and the only one: the row is written when its last growth was on an earlier day, or
// when a bonus attempt pays for another one today — and the attempt is spent only then. Returns
// the new length, or null when the day is already used up.
export async function commitGrowth(uid, chatId, increment) {
  const result = await db.run(sql`
    INSERT INTO dicks (uid, chat_id, length, grown_at) VALUES (${uid}, ${chatId}, ${increment}, ${nowSec()})
    ON CONFLICT (uid, chat_id) DO UPDATE SET
      length = dicks.length + excluded.length,
      grown_at = excluded.grown_at,
      bonus_attempts = CASE WHEN dicks.grown_at / ${DAY_SECONDS} >= excluded.grown_at / ${DAY_SECONDS}
                            THEN dicks.bonus_attempts - 1 ELSE dicks.bonus_attempts END
      WHERE dicks.grown_at / ${DAY_SECONDS} < excluded.grown_at / ${DAY_SECONDS} OR dicks.bonus_attempts > 0
    RETURNING length`);
  return result.rows[0]?.length ?? null;
}

// Any change of the length that is not a growth: it leaves `grown_at` and the attempts alone.
// Returns the new length, or null when the player has no dick in the chat.
export async function addLength(uid, chatId, change) {
  const result = await db.run(sql`
    UPDATE dicks SET length = length + ${change} WHERE uid = ${uid} AND chat_id = ${chatId} RETURNING length`);
  return result.rows[0]?.length ?? null;
}

// Takes `cost` away only if the dick is at least that long. Returns the new length or null.
export async function spendLength(uid, chatId, cost) {
  const result = await db.run(sql`
    UPDATE dicks SET length = length - ${cost}
    WHERE uid = ${uid} AND chat_id = ${chatId} AND length >= ${cost}
    RETURNING length`);
  return result.rows[0]?.length ?? null;
}

// Sets the length from `expected` to `value`, unless it has changed meanwhile.
export async function compareAndSetLength(uid, chatId, expected, value) {
  const result = await db.run(sql`
    UPDATE dicks SET length = ${value} WHERE uid = ${uid} AND chat_id = ${chatId} AND length = ${expected}
    RETURNING length`);
  return result.rows.length > 0;
}

export async function grantBonusAttempt(uid, chatId) {
  await db.run(sql`UPDATE dicks SET bonus_attempts = bonus_attempts + 1 WHERE uid = ${uid} AND chat_id = ${chatId}`);
}

export async function positionOf(uid, chatId) {
  const row = await db.get(sql`
    SELECT position FROM (
      SELECT d.uid, ROW_NUMBER() OVER (ORDER BY d.length DESC, d.grown_at DESC, u.name) AS position
      FROM dicks d JOIN users u ON u.uid = d.uid
      WHERE d.chat_id = ${chatId}
    ) WHERE uid = ${uid}`);
  return row?.position ?? null;
}

export async function getTop(chatId, { offset, limit, hideInactiveZero, inactivityDays }) {
  const activeSince = nowSec() - inactivityDays * DAY_SECONDS;
  return db.all(sql`
    SELECT d.uid, u.name, d.length, d.grown_at,
           ROW_NUMBER() OVER (ORDER BY d.length DESC, d.grown_at DESC, u.name) AS position
    FROM dicks d JOIN users u ON u.uid = d.uid
    WHERE d.chat_id = ${chatId}
      AND (${hideInactiveZero ? 0 : 1} OR d.length != 0 OR d.grown_at > ${activeSince})
    ORDER BY position
    LIMIT ${limit} OFFSET ${offset}`);
}

export async function activeMembers(chatId, inactivityDays) {
  const activeSince = nowSec() - inactivityDays * DAY_SECONDS;
  return db.all(sql`
    SELECT d.uid, u.name, d.length FROM dicks d JOIN users u ON u.uid = d.uid
    WHERE d.chat_id = ${chatId} AND d.grown_at > ${activeSince}`);
}

export async function countMembers(chatId) {
  const row = await db.get(sql`SELECT count(*) AS n FROM dicks WHERE chat_id = ${chatId}`);
  return row.n;
}

export async function members(chatId) {
  return db.all(sql`
    SELECT d.uid, u.name, d.length FROM dicks d JOIN users u ON u.uid = d.uid WHERE d.chat_id = ${chatId}`);
}

// Moves `bet` from the loser to the winner in one statement, provided both still qualify: the
// initiator has the bet and the acceptor has at least `acceptorMin`. Returns the new lengths by
// uid, or null when either no longer qualifies.
export async function settleBattle(chatId, { winner, loser, initiator, acceptor, bet, acceptorMin }) {
  const result = await db.run(sql`
    UPDATE dicks SET length = length + CASE WHEN uid = ${winner} THEN ${bet} ELSE ${-bet} END
    WHERE chat_id = ${chatId} AND uid IN (${winner}, ${loser})
      AND (SELECT length FROM dicks WHERE chat_id = ${chatId} AND uid = ${initiator}) >= ${bet}
      AND (SELECT length FROM dicks WHERE chat_id = ${chatId} AND uid = ${acceptor}) >= ${acceptorMin}
    RETURNING uid, length`);
  if (result.rows.length !== 2) return null;
  return Object.fromEntries(result.rows.map((row) => [row.uid, row.length]));
}

export async function personalStats(uid) {
  return db.get(sql`
    SELECT count(*) AS chats, coalesce(max(length), 0) AS max_length, coalesce(sum(length), 0) AS total_length
    FROM dicks WHERE uid = ${uid}`);
}

export async function growAllOfUser(uid, change) {
  const result = await db.run(sql`UPDATE dicks SET length = length + ${change} WHERE uid = ${uid}`);
  return result.rowsAffected;
}

export async function countDicksOfUser(uid) {
  const row = await db.get(sql`SELECT count(*) AS n FROM dicks WHERE uid = ${uid}`);
  return row.n;
}
