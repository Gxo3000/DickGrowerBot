import { config } from '../config.js';
import { t } from '../i18n.js';
import { escapeHtml } from '../html.js';
import { pickWeighted } from '../random.js';
import { button, keyboard } from '../tg.js';
import { formatDay, secondsTillNextDay, splitDuration, today } from '../time.js';
import { addLength, spendLength, getDick } from '../repo/dicks.js';
import {
  addTickets, claimDraw, dueLotteries, finishDraw, isOpen, lastFinished, lotteryOfDay, removeTickets, tickets, ticketsOf,
} from '../repo/lottery.js';
import { award, banNotice, withheldNote } from './common.js';

const PREFIX = 'lot:';
const BULK = 5;

export async function lotteryStatus({ chat, user, lang }) {
  const lottery = await lotteryOfDay(chat.id, today());
  const sold = await tickets(lottery.id);
  const pool = sold.reduce((sum, row) => sum + row.spent, 0);
  const { ticketPrice, maxTicketsPerDay } = config.lottery;
  const { hours, minutes } = splitDuration(secondsTillNextDay());
  let text = t(lang, 'commands.lottery.status', {
    pool,
    prize: prizeOf(pool),
    tickets: sold.reduce((sum, row) => sum + row.tickets, 0),
    players: sold.length,
    mine: sold.find((row) => row.uid === user.uid)?.tickets ?? 0,
    max: maxTicketsPerDay,
    price: ticketPrice,
    hours,
    minutes,
  });

  const last = await lastFinished(chat.id);
  if (last?.status === 'drawn') {
    text += `\n\n${t(lang, 'commands.lottery.last_won', { name: escapeHtml(last.winner_name ?? '?'), prize: last.prize })}`;
  } else if (last?.status === 'refunded') {
    text += `\n\n${t(lang, 'commands.lottery.last_refunded')}`;
  }

  const buttons = [buyButton(1, lang)];
  if (maxTicketsPerDay >= BULK) buttons.push(buyButton(BULK, lang));
  return {
    text,
    keyboard: keyboard([buttons, [button(t(lang, 'commands.lottery.buttons.refresh'), `${PREFIX}show`)]]),
  };
}

export function parseLotteryData(data) {
  if (!data.startsWith(PREFIX)) return null;
  const [action, count] = data.slice(PREFIX.length).split(':');
  if (action === 'show') return { action };
  const parsed = Number(count);
  return action === 'buy' && Number.isInteger(parsed) && parsed > 0 ? { action, count: parsed } : null;
}

// Buys tickets for today's lottery. Returns the notice for the button press.
export async function buyTickets({ chat, user, lang, count }) {
  const banned = banNotice(user, lang);
  if (banned) return { alert: banned };

  const { ticketPrice, maxTicketsPerDay } = config.lottery;
  const lottery = await lotteryOfDay(chat.id, today());
  const mine = await ticketsOf(lottery.id, user.uid);
  const wanted = Math.min(count, maxTicketsPerDay - mine);
  if (wanted <= 0) {
    return { alert: t(lang, 'commands.lottery.errors.limit', { max: maxTicketsPerDay }) };
  }
  const cost = wanted * ticketPrice;
  if ((await spendLength(user.uid, chat.id, cost)) === null) {
    const dick = await getDick(user.uid, chat.id);
    const key = dick ? 'commands.lottery.errors.not_enough' : 'commands.lottery.errors.no_dick';
    return { alert: t(lang, key, { cost }) };
  }
  const total = await addTickets(lottery.id, user.uid, wanted, cost, maxTicketsPerDay);
  if (total === null) {
    await addLength(user.uid, chat.id, cost);
    return { alert: t(lang, 'commands.lottery.errors.limit', { max: maxTicketsPerDay }) };
  }
  if (!(await isOpen(lottery.id))) {
    await removeTickets(lottery.id, user.uid, wanted, cost);
    await addLength(user.uid, chat.id, cost);
    return { alert: t(lang, 'commands.lottery.errors.limit', { max: maxTicketsPerDay }) };
  }
  return { toast: t(lang, 'commands.lottery.bought', { count: wanted, mine: total }) };
}

// Draws every lottery of the chat whose day is over. Returns the announcements to post.
export async function drawDueLotteries(chatId, lang) {
  const announcements = [];
  for (const lottery of await dueLotteries(chatId, today())) {
    if (!(await claimDraw(lottery.id))) continue;
    const text = await draw(chatId, lottery, lang);
    if (text) announcements.push(text);
  }
  return announcements;
}

async function draw(chatId, lottery, lang) {
  const sold = await tickets(lottery.id);
  const pool = sold.reduce((sum, row) => sum + row.spent, 0);
  const date = formatDay(lottery.day);
  if (sold.length === 0) {
    await finishDraw(lottery.id, { status: 'empty', pool });
    return null;
  }
  if (sold.length < config.lottery.minParticipants) {
    for (const row of sold) {
      await addLength(row.uid, chatId, row.spent);
    }
    await finishDraw(lottery.id, { status: 'refunded', pool });
    return t(lang, 'commands.lottery.draw.refunded', { date, min: config.lottery.minParticipants });
  }

  const winner = pickWeighted(sold, (row) => row.tickets);
  const prize = prizeOf(pool);
  const { length, withheld } = await award(winner.uid, chatId, prize);
  await finishDraw(lottery.id, { status: 'drawn', pool, winnerUid: winner.uid, prize });
  const text = t(lang, 'commands.lottery.draw.won', {
    date,
    name: escapeHtml(winner.name),
    tickets: winner.tickets,
    total: sold.reduce((sum, row) => sum + row.tickets, 0),
    prize,
    length: length ?? 0,
  });
  return `${text}${withheldNote(withheld, lang)}`;
}

function prizeOf(pool) {
  return pool + Math.floor(pool * config.lottery.jackpotBonusRatio);
}

function buyButton(count, lang) {
  const cost = count * config.lottery.ticketPrice;
  return button(t(lang, 'commands.lottery.buttons.buy', { count, cost }), `${PREFIX}buy:${count}`);
}
