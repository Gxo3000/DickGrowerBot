import { db } from 'sdk';
import { sql } from 'sdk/db';
import { nowSec } from '../time.js';

const COLUMNS = sql`id, chat_id, day, pool, status, winner_uid, prize, finished_at`;

export async function lotteryOfDay(chatId, day) {
  await db.run(sql`
    INSERT INTO lotteries (chat_id, day) VALUES (${chatId}, ${day}) ON CONFLICT (chat_id, day) DO NOTHING`);
  return db.get(sql`SELECT ${COLUMNS} FROM lotteries WHERE chat_id = ${chatId} AND day = ${day}`);
}

export async function lastFinished(chatId) {
  return db.get(sql`
    SELECT l.id, l.day, l.status, l.prize, l.winner_uid, u.name AS winner_name
    FROM lotteries l LEFT JOIN users u ON u.uid = l.winner_uid
    WHERE l.chat_id = ${chatId} AND l.status IN ('drawn', 'refunded')
    ORDER BY l.day DESC LIMIT 1`);
}

// The open lotteries of the chat whose day is over.
export async function dueLotteries(chatId, day) {
  return db.all(sql`
    SELECT ${COLUMNS} FROM lotteries WHERE chat_id = ${chatId} AND status = 'open' AND day < ${day} ORDER BY day`);
}

export async function tickets(lotteryId) {
  return db.all(sql`
    SELECT t.uid, u.name, t.tickets, t.spent FROM lottery_tickets t JOIN users u ON u.uid = t.uid
    WHERE t.lottery_id = ${lotteryId}`);
}

export async function ticketsOf(lotteryId, uid) {
  const row = await db.get(sql`SELECT tickets FROM lottery_tickets WHERE lottery_id = ${lotteryId} AND uid = ${uid}`);
  return row?.tickets ?? 0;
}

// Adds tickets unless that would take the player past `max`. Returns the player's tickets, or
// null when refused.
export async function addTickets(lotteryId, uid, count, cost, max) {
  const result = await db.run(sql`
    INSERT INTO lottery_tickets (lottery_id, uid, tickets, spent)
    SELECT ${lotteryId}, ${uid}, ${count}, ${cost} WHERE ${count} <= ${max}
    ON CONFLICT (lottery_id, uid) DO UPDATE SET
      tickets = lottery_tickets.tickets + excluded.tickets,
      spent = lottery_tickets.spent + excluded.spent
      WHERE lottery_tickets.tickets + excluded.tickets <= ${max}
    RETURNING tickets`);
  return result.rows[0]?.tickets ?? null;
}

export async function removeTickets(lotteryId, uid, count, cost) {
  await db.run(sql`
    UPDATE lottery_tickets SET tickets = tickets - ${count}, spent = spent - ${cost}
    WHERE lottery_id = ${lotteryId} AND uid = ${uid}`);
}

export async function isOpen(lotteryId) {
  const row = await db.get(sql`SELECT status FROM lotteries WHERE id = ${lotteryId}`);
  return row?.status === 'open';
}

// True for the one caller that gets to draw the lottery.
export async function claimDraw(lotteryId) {
  const result = await db.run(sql`
    UPDATE lotteries SET status = 'drawing' WHERE id = ${lotteryId} AND status = 'open' RETURNING id`);
  return result.rows.length > 0;
}

export async function finishDraw(lotteryId, { status, pool, winnerUid = null, prize = null }) {
  await db.run(sql`
    UPDATE lotteries SET status = ${status}, pool = ${pool}, winner_uid = ${winnerUid}, prize = ${prize},
                         finished_at = ${nowSec()}
    WHERE id = ${lotteryId}`);
}
