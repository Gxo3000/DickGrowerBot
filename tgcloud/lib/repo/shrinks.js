import { db } from 'sdk';
import { sql } from 'sdk/db';
import { DAY_SECONDS, nowSec } from '../time.js';
import { chunks, joinFragments } from './sql.js';

const CHUNK = 100;

// The players of the chat who have something to lose and haven't grown for `graceDays`.
export async function staleDicks(chatId, graceDays) {
  return db.all(sql`
    SELECT d.uid, u.name, d.length, d.grown_at FROM dicks d JOIN users u ON u.uid = d.uid
    WHERE d.chat_id = ${chatId} AND d.length > 0 AND d.grown_at <= ${nowSec() - graceDays * DAY_SECONDS}`);
}

// Takes each victim's loss away and logs it. A dick grown since it was read is spared.
// Returns the victims that actually shrank, with their new lengths.
export async function applyShrinks(chatId, victims, day) {
  const shrunk = [];
  for (const chunk of chunks(victims, CHUNK)) {
    const values = joinFragments(chunk.map((v) => sql`(${v.uid}, ${v.loss}, ${v.grown_at})`));
    const result = await db.run(sql`
      UPDATE dicks SET length = length - v.column2
      FROM (VALUES ${values}) AS v
      WHERE dicks.chat_id = ${chatId} AND dicks.uid = v.column1 AND dicks.grown_at = v.column3
      RETURNING uid, length`);
    const byUid = new Map(result.rows.map((row) => [row.uid, row.length]));
    const done = chunk.filter((v) => byUid.has(v.uid)).map((v) => ({ ...v, length: byUid.get(v.uid) }));
    if (done.length > 0) {
      const rows = joinFragments(done.map((v) => sql`(${chatId}, ${v.uid}, ${v.loss}, ${day})`));
      await db.run(sql`INSERT INTO shrinks (chat_id, uid, lost_length, day) VALUES ${rows}`);
    }
    shrunk.push(...done);
  }
  return shrunk;
}

// The shrinks of the last day that had any.
export async function recentShrinks(chatId, limit) {
  return db.all(sql`
    SELECT u.name, s.lost_length FROM shrinks s JOIN users u ON u.uid = s.uid
    WHERE s.chat_id = ${chatId} AND s.day = (SELECT max(day) FROM shrinks WHERE chat_id = ${chatId})
    ORDER BY s.lost_length DESC LIMIT ${limit}`);
}
