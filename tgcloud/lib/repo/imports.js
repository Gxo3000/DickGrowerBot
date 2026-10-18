import { db } from 'sdk';
import { sql } from 'sdk/db';
import { nowSec } from '../time.js';

export async function importedUids(telegramChatId) {
  const rows = await db.all(sql`SELECT uid FROM imports WHERE chat_id = ${telegramChatId}`);
  return new Set(rows.map((row) => row.uid));
}

// Records the import of a player and adds the length; a player imported before is skipped.
// True when the length was added.
export async function importPlayer(telegramChatId, internalChatId, uid, length) {
  const result = await db.run(sql`
    INSERT INTO imports (chat_id, uid, original_length, imported_at) VALUES (${telegramChatId}, ${uid}, ${length}, ${nowSec()})
    ON CONFLICT (chat_id, uid) DO NOTHING RETURNING uid`);
  if (result.rows.length === 0) return false;
  await db.run(sql`UPDATE dicks SET length = length + ${length} WHERE uid = ${uid} AND chat_id = ${internalChatId}`);
  return true;
}
