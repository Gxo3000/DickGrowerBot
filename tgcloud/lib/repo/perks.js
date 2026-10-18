import { db } from 'sdk';
import { sql } from 'sdk/db';

// The states of every perk of the player, by perk name. A state is whatever its perk stored.
export async function readPerkStates(uid, chatId) {
  const rows = await db.all(sql`SELECT perk, state FROM perk_states WHERE uid = ${uid} AND chat_id = ${chatId}`);
  return Object.fromEntries(rows.map((row) => [row.perk, safeParse(row.state)]));
}

export async function writePerkState(uid, chatId, perk, state) {
  await db.run(sql`
    INSERT INTO perk_states (uid, chat_id, perk, state) VALUES (${uid}, ${chatId}, ${perk}, ${JSON.stringify(state)})
    ON CONFLICT (uid, chat_id, perk) DO UPDATE SET state = excluded.state`);
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
