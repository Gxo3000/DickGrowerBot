import { test } from 'node:test';
import assert from 'node:assert/strict';
import handleMessage from '../tgcloud/handlers/message.js';
import handleCallback from '../tgcloud/handlers/callback_query.js';
import {
  ALICE, BOB, GROUP, advanceDays, apiCalls, buttonData, callback, config, db, dickOf, lastMarkup, lastText, message,
  rollSequence, sentMessage, setLength, useBot,
} from './helpers.js';

useBot();

const CAROL = { id: 303, is_bot: false, first_name: 'Carol', language_code: 'ru' };

async function play(...users) {
  for (const user of users) {
    await handleMessage(message(user, '/grow'));
    await setLength(user.id, 50);
  }
}

function lastAnswer() {
  return apiCalls('answerCallbackQuery').at(-1).params;
}

test('lottery tickets cost centimetres and the draw after midnight pays the pot to a ticket holder', async () => {
  config.lottery.jackpotBonusRatio = 0.2;
  await play(ALICE, BOB);
  await handleMessage(message(ALICE, '/lottery'));
  assert.match(lastText(), /The pot: <b>0 cm<\/b>/);
  const [buyOne, buyFive] = buttonData(lastMarkup());
  const board = sentMessage();

  await handleCallback(callback(ALICE, buyFive, { messageOf: board }));
  assert.match(lastAnswer().text, /You bought 5 ticket/);
  await handleCallback(callback(BOB, buyOne, { messageOf: board }));
  assert.equal((await dickOf(ALICE.id)).length, 25);
  assert.equal((await dickOf(BOB.id)).length, 45);
  assert.match(lastText('editMessageText'), /The pot: <b>30 cm<\/b>, with the bot's bonus — <b>36 cm<\/b>/);

  await handleCallback(callback(ALICE, buyFive, { messageOf: board }));
  await handleCallback(callback(ALICE, buyFive, { messageOf: board }));
  assert.match(lastAnswer().text, /more than 10 tickets/);
  assert.equal((await dickOf(ALICE.id)).length, 0);

  advanceDays(1);
  rollSequence(0.0);
  await handleMessage(message(BOB, '/top'));
  const announcement = apiCalls('sendMessage').at(-2).params.text;
  assert.match(announcement, /The winner is <b>Alice<\/b> with 10 ticket\(s\) out of 11. The prize of <b>66 cm<\/b>/);
  assert.equal((await dickOf(ALICE.id)).length, 66);

  await handleMessage(message(BOB, '/lottery'));
  assert.match(lastText(), /Last draw: <b>Alice<\/b> won <b>66 cm<\/b>/);
});

test('a lottery with a single player refunds the tickets', async () => {
  await play(ALICE);
  await handleMessage(message(ALICE, '/lottery'));
  const [buyOne] = buttonData(lastMarkup());
  await handleCallback(callback(ALICE, buyOne, { messageOf: sentMessage() }));
  assert.equal((await dickOf(ALICE.id)).length, 45);
  advanceDays(1);
  await handleMessage(message(ALICE, '/top'));
  assert.equal((await dickOf(ALICE.id)).length, 50);
  assert.match(apiCalls('sendMessage').at(-2).params.text, /is cancelled: it needs at least 2 players/);
});

test('a raid boss takes hits with a cooldown and shares the reward when it falls', async () => {
  config.boss.baseHp = 40;
  config.boss.counterattackChance = 0;
  config.boss.critChance = 0;
  config.boss.damageMin = 10;
  config.boss.damageMax = 10;
  await play(ALICE, BOB);
  await setLength(ALICE.id, 0);
  await setLength(BOB.id, 0);

  await handleMessage(message(ALICE, '/boss'));
  assert.match(lastText(), /The Great Shrinker <b>\(level 1\)<\/b>\n❤️ █{10} <b>40\/40<\/b>/);
  const [hit] = buttonData(lastMarkup());
  const board = sentMessage();

  await handleCallback(callback(ALICE, hit, { messageOf: board }));
  assert.match(lastText('editMessageText'), /<b>30\/40<\/b>/);
  await handleCallback(callback(ALICE, hit, { messageOf: board }));
  assert.match(lastAnswer().text, /next hit in 60 min/);

  await handleCallback(callback(BOB, hit, { messageOf: board }));
  await handleMessage(message(CAROL, '/grow'));
  await setLength(CAROL.id, 0);
  await handleCallback(callback(CAROL, hit, { messageOf: board }));
  advanceDays(1 / 24);
  await handleCallback(callback(ALICE, hit, { messageOf: board }));
  const result = lastText('editMessageText');
  assert.match(result, /is defeated!<\/b> The killing blow was dealt by <b>Alice<\/b>/);
  assert.equal((await dickOf(ALICE.id)).length, 8 + 3, 'half of the 15 cm pot and the killing blow');
  assert.equal((await dickOf(BOB.id)).length, 4);

  await handleMessage(message(BOB, '/boss'));
  assert.match(lastText(), /The boss of today is defeated/);
  advanceDays(1);
  await handleMessage(message(BOB, '/boss'));
  assert.match(lastText(), /The Frost Giant <b>\(level 2\)<\/b>/);
});

test('a boss nobody beats escapes', async () => {
  await play(ALICE);
  await handleMessage(message(ALICE, '/boss'));
  advanceDays(config.boss.lifetimeDays);
  await handleMessage(message(ALICE, '/top'));
  assert.match(apiCalls('sendMessage').at(-2).params.text, /got away/);
});

test('an adventure is taken once a day and only by the one who started it', async () => {
  await play(ALICE);
  await handleMessage(message(ALICE, '/adventure'));
  assert.match(lastText(), /where are you heading today/);
  const [, , hard] = buttonData(lastMarkup());
  const board = sentMessage();

  await handleCallback(callback(BOB, hard, { messageOf: board }));
  assert.match(lastAnswer().text, /sent by another person/);

  rollSequence(0.0, 0.1, 0.99, 0.0);
  await handleCallback(callback(ALICE, hard, { messageOf: board }));
  assert.match(lastText('editMessageText'), /went on a hard adventure and beat .+! The loot: <b>\+15 cm<\/b>/);
  assert.match(lastText('editMessageText'), /extra \/grow attempt/);
  assert.deepEqual(await dickOf(ALICE.id).then((d) => [d.length, d.bonus_attempts]), [65, 1]);

  await handleCallback(callback(ALICE, hard, { messageOf: board }));
  assert.match(lastText('editMessageText'), /already been on an adventure today/);
  const stats = await db.get(`SELECT adventures, adventures_won, earned FROM pve_stats WHERE uid = ${ALICE.id}`);
  assert.deepEqual(stats, { adventures: 1, adventures_won: 1, earned: 15 });
});

test('a lost adventure costs centimetres, and the answer follows the player language', async () => {
  await play(CAROL);
  await handleMessage(message(CAROL, '/adventure'));
  const [easy] = buttonData(lastMarkup());
  rollSequence(0.0, 0.99, 0.0);
  await handleCallback(callback(CAROL, easy, { messageOf: sentMessage() }));
  assert.match(lastText('editMessageText'), /отправился в лёгкое приключение, но не одолел .+ Потеряно <b>1 см<\/b>/);
  assert.equal((await dickOf(CAROL.id)).length, 49);
});

test('PvE results show up in /stats', async () => {
  await play(ALICE);
  await handleMessage(message(ALICE, '/stats'));
  assert.match(lastText(), /Adventures: <b>0<\/b>/);
  assert.equal(apiCalls('sendMessage').at(-1).params.chat_id, GROUP.id);
});
