import { db } from 'sdk';
import { sql } from 'sdk/db';
import { nowSec } from '../time.js';

const COLUMNS = sql`uid, name, created_at, lang, banned_until`;

// Creates the user or refreshes their name. A banned user's row is not touched, so an erased name
// stays erased; the row comes back either way and `isBanned` tells the two apart.
export async function upsertUser(uid, name) {
  const now = nowSec();
  const result = await db.run(sql`
    INSERT INTO users (uid, name, created_at) VALUES (${uid}, ${name}, ${now})
    ON CONFLICT (uid) DO UPDATE SET name = excluded.name
      WHERE users.banned_until IS NULL OR users.banned_until <= ${now}
    RETURNING ${COLUMNS}`);
  return result.rows[0] ?? getUser(uid);
}

export async function getUser(uid) {
  return db.get(sql`SELECT ${COLUMNS} FROM users WHERE uid = ${uid}`);
}

export function isBanned(user) {
  return user?.banned_until != null && user.banned_until > nowSec();
}

export async function setUserLang(uid, lang) {
  await db.run(sql`UPDATE users SET lang = ${lang} WHERE uid = ${uid}`);
}

export async function ban(uid, until) {
  const result = await db.run(sql`
    INSERT INTO users (uid, name, created_at, banned_until) VALUES (${uid}, '', ${nowSec()}, ${until})
    ON CONFLICT (uid) DO UPDATE SET banned_until = excluded.banned_until`);
  return result.rowsAffected > 0;
}

export async function unban(uid) {
  const result = await db.run(sql`UPDATE users SET banned_until = NULL WHERE uid = ${uid}`);
  return result.rowsAffected > 0;
}
