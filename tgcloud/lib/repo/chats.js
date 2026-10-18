import { db } from 'sdk';
import { sql } from 'sdk/db';
import { nowSec } from '../time.js';

const COLUMNS = sql`id, chat_id, chat_instance, lang, topics, maintained_day`;

// The chat a command was given in, created on first sight. A chat is known by its Telegram id, by
// the `chat_instance` of the buttons pressed in it, or both; whatever is learnt about it is
// written down, and a chat that turns out to have been known twice is merged into one.
export async function resolveChat({ chatId = null, instance = null }) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const rows = await db.all(sql`
      SELECT ${COLUMNS} FROM chats WHERE chat_id = ${chatId} OR chat_instance = ${instance}`);
    if (rows.length === 0) {
      await db.run(sql`
        INSERT INTO chats (chat_id, chat_instance, created_at) VALUES (${chatId}, ${instance}, ${nowSec()})
        ON CONFLICT DO NOTHING`);
      continue;
    }
    if (rows.length === 1) {
      return fillIn(parse(rows[0]), chatId, instance);
    }
    const kept = rows.find((row) => row.chat_id === chatId) ?? rows[0];
    const dropped = rows.find((row) => row !== kept);
    await mergeChats(kept.id, dropped.id);
    return fillIn(parse(kept), chatId, instance);
  }
  throw new Error('could not create the chat');
}

export async function getChatByTelegramId(chatId) {
  const row = await db.get(sql`SELECT ${COLUMNS} FROM chats WHERE chat_id = ${chatId}`);
  return row && parse(row);
}

export async function setChatLang(id, lang) {
  await db.run(sql`UPDATE chats SET lang = ${lang} WHERE id = ${id}`);
}

export async function setTopics(id, topics) {
  await db.run(sql`UPDATE chats SET topics = ${topics.length > 0 ? JSON.stringify(topics) : null} WHERE id = ${id}`);
}

// True for exactly one caller a day: the one that gets to run the chat's daily chores.
export async function claimMaintenance(id, day) {
  const result = await db.run(sql`
    UPDATE chats SET maintained_day = ${day} WHERE id = ${id} AND maintained_day < ${day} RETURNING id`);
  return result.rows.length > 0;
}

// A group that became a supergroup gets a new id; everything played in it moves along.
export async function migrateChatId(fromChatId, toChatId) {
  const old = await getChatByTelegramId(fromChatId);
  if (!old) return;
  const existing = await getChatByTelegramId(toChatId);
  if (existing) {
    await mergeChats(existing.id, old.id);
    return;
  }
  await db.run(sql`UPDATE chats SET chat_id = ${toChatId} WHERE id = ${old.id}`);
}

async function fillIn(chat, chatId, instance) {
  const missingId = chatId !== null && chat.chat_id === null;
  const missingInstance = instance !== null && chat.chat_instance === null;
  if (!missingId && !missingInstance) return chat;
  await db.run(sql`
    UPDATE chats SET chat_id = coalesce(chat_id, ${chatId}), chat_instance = coalesce(chat_instance, ${instance})
    WHERE id = ${chat.id}`);
  return {
    ...chat,
    chat_id: chat.chat_id ?? chatId,
    chat_instance: chat.chat_instance ?? instance,
  };
}

// Moves everything of the chat `fromId` into `toId` and deletes it. The lengths and the counters of
// a player known in both are summed; where only one row may stay, the kept chat's wins.
async function mergeChats(toId, fromId) {
  const from = await db.get(sql`SELECT chat_instance FROM chats WHERE id = ${fromId}`);
  const statements = [
    sql`INSERT INTO dicks (uid, chat_id, length, grown_at, bonus_attempts)
        SELECT uid, ${toId}, length, grown_at, bonus_attempts FROM dicks WHERE chat_id = ${fromId} AND true
        ON CONFLICT (uid, chat_id) DO UPDATE SET
          length = dicks.length + excluded.length,
          grown_at = max(dicks.grown_at, excluded.grown_at),
          bonus_attempts = max(dicks.bonus_attempts, excluded.bonus_attempts)`,
    sql`DELETE FROM dicks WHERE chat_id = ${fromId}`,
    sql`INSERT INTO battle_stats (uid, chat_id, battles_total, battles_won, win_streak_current, win_streak_max,
                                  acquired_length, lost_length)
        SELECT uid, ${toId}, battles_total, battles_won, win_streak_current, win_streak_max, acquired_length, lost_length
        FROM battle_stats WHERE chat_id = ${fromId} AND true
        ON CONFLICT (uid, chat_id) DO UPDATE SET
          battles_total = battle_stats.battles_total + excluded.battles_total,
          battles_won = battle_stats.battles_won + excluded.battles_won,
          win_streak_max = max(battle_stats.win_streak_max, excluded.win_streak_max),
          acquired_length = battle_stats.acquired_length + excluded.acquired_length,
          lost_length = battle_stats.lost_length + excluded.lost_length`,
    sql`DELETE FROM battle_stats WHERE chat_id = ${fromId}`,
    sql`INSERT INTO pve_stats (uid, chat_id, adventure_day, adventures, adventures_won, boss_damage, boss_kills, earned)
        SELECT uid, ${toId}, adventure_day, adventures, adventures_won, boss_damage, boss_kills, earned
        FROM pve_stats WHERE chat_id = ${fromId} AND true
        ON CONFLICT (uid, chat_id) DO UPDATE SET
          adventure_day = max(pve_stats.adventure_day, excluded.adventure_day),
          adventures = pve_stats.adventures + excluded.adventures,
          adventures_won = pve_stats.adventures_won + excluded.adventures_won,
          boss_damage = pve_stats.boss_damage + excluded.boss_damage,
          boss_kills = pve_stats.boss_kills + excluded.boss_kills,
          earned = pve_stats.earned + excluded.earned`,
    sql`DELETE FROM pve_stats WHERE chat_id = ${fromId}`,
    sql`UPDATE loans AS kept SET debt = kept.debt + (
          SELECT sum(moved.debt) FROM loans moved
          WHERE moved.chat_id = ${fromId} AND moved.uid = kept.uid AND moved.repaid_at IS NULL)
        WHERE kept.chat_id = ${toId} AND kept.repaid_at IS NULL AND EXISTS (
          SELECT 1 FROM loans moved WHERE moved.chat_id = ${fromId} AND moved.uid = kept.uid AND moved.repaid_at IS NULL)`,
    sql`UPDATE OR IGNORE loans SET chat_id = ${toId} WHERE chat_id = ${fromId}`,
    sql`DELETE FROM loans WHERE chat_id = ${fromId}`,
    sql`UPDATE OR IGNORE perk_states SET chat_id = ${toId} WHERE chat_id = ${fromId}`,
    sql`DELETE FROM perk_states WHERE chat_id = ${fromId}`,
    sql`UPDATE OR IGNORE dicks_of_day SET chat_id = ${toId} WHERE chat_id = ${fromId}`,
    sql`DELETE FROM dicks_of_day WHERE chat_id = ${fromId}`,
    sql`UPDATE shrinks SET chat_id = ${toId} WHERE chat_id = ${fromId}`,
    sql`UPDATE bosses SET status = 'escaped', finished_at = ${nowSec()} WHERE chat_id = ${fromId} AND status = 'alive'`,
    sql`UPDATE bosses SET chat_id = ${toId} WHERE chat_id = ${fromId}`,
    sql`DELETE FROM announcements WHERE chat_id = ${fromId}`,
  ];
  for (const statement of statements) {
    await db.run(statement);
  }
  await moveLotteries(toId, fromId);
  await db.run(sql`DELETE FROM chats WHERE id = ${fromId}`);
  if (from?.chat_instance) {
    await db.run(sql`UPDATE chats SET chat_instance = coalesce(chat_instance, ${from.chat_instance}) WHERE id = ${toId}`);
  }
}

// An open lottery of the same day in both chats can't be moved, so its tickets are refunded.
async function moveLotteries(toId, fromId) {
  await db.run(sql`UPDATE OR IGNORE lotteries SET chat_id = ${toId} WHERE chat_id = ${fromId}`);
  const leftovers = await db.all(sql`SELECT id FROM lotteries WHERE chat_id = ${fromId} AND status = 'open'`);
  for (const { id } of leftovers) {
    await db.run(sql`
      UPDATE dicks SET length = length + (
        SELECT t.spent FROM lottery_tickets t WHERE t.lottery_id = ${id} AND t.uid = dicks.uid)
      WHERE chat_id = ${toId} AND uid IN (SELECT uid FROM lottery_tickets WHERE lottery_id = ${id})`);
    await db.run(sql`DELETE FROM lottery_tickets WHERE lottery_id = ${id}`);
  }
  await db.run(sql`DELETE FROM lotteries WHERE chat_id = ${fromId}`);
}

function parse(row) {
  return { ...row, topics: row.topics ? JSON.parse(row.topics) : [] };
}
