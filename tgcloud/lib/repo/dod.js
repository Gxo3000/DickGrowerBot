import { db } from 'sdk';
import { sql } from 'sdk/db';

// The primary key is the rule: one winner per chat per day. True when this call took the day.
export async function claimDay(chatId, day, winnerUid) {
  const result = await db.run(sql`
    INSERT INTO dicks_of_day (chat_id, day, winner_uid) VALUES (${chatId}, ${day}, ${winnerUid})
    ON CONFLICT (chat_id, day) DO NOTHING RETURNING winner_uid`);
  return result.rows.length > 0;
}

export async function winnerOf(chatId, day) {
  return db.get(sql`
    SELECT u.uid, u.name FROM dicks_of_day d JOIN users u ON u.uid = d.winner_uid
    WHERE d.chat_id = ${chatId} AND d.day = ${day}`);
}
