import { db } from 'sdk';
import { sql } from 'sdk/db';

// Counts one more showing of the text with `hash` in the chat and returns how many it has had;
// a changed text starts the count again.
export async function countShowing(chatId, lang, hash) {
  const result = await db.run(sql`
    INSERT INTO announcements (chat_id, lang, hash, times_shown) VALUES (${chatId}, ${lang}, ${hash}, 1)
    ON CONFLICT (chat_id, lang) DO UPDATE SET
      times_shown = CASE WHEN announcements.hash = excluded.hash THEN announcements.times_shown + 1 ELSE 1 END,
      hash = excluded.hash
    RETURNING times_shown`);
  return result.rows[0].times_shown;
}
