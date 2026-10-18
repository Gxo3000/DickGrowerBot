import { test } from 'node:test';
import assert from 'node:assert/strict';
import handleMessage from '../tgcloud/handlers/message.js';
import handleCallback from '../tgcloud/handlers/callback_query.js';
import {
  ALICE, BOB, advanceDays, apiCalls, buttonData, callback, config, db, dickOf, lastMarkup, lastText, message,
  rollSequence, sentMessage, setLength, useBot,
} from './helpers.js';

useBot();

async function bothPlay() {
  await handleMessage(message(ALICE, '/grow'));
  await handleMessage(message(BOB, '/grow'));
  await setLength(ALICE.id, 30);
  await setLength(BOB.id, 30);
}

test('a battle moves the bet from the loser to the winner, once', async () => {
  await bothPlay();
  await handleMessage(message(ALICE, '/pvp 10'));
  assert.match(lastText(), /challenged the chat with a bet of <b>10 cm<\/b>/);
  const [data] = buttonData(lastMarkup());
  const offer = sentMessage();

  rollSequence(0.1);
  await handleCallback(callback(BOB, data, { messageOf: offer }));
  const lengths = [(await dickOf(ALICE.id)).length, (await dickOf(BOB.id)).length].sort();
  assert.deepEqual(lengths, [20, 40]);
  assert.match(lastText('editMessageText'), /The winner is <b>Bob Smith<\/b>/);

  await handleCallback(callback(BOB, data, { messageOf: offer }));
  assert.match(apiCalls('answerCallbackQuery').at(-1).params.text, /in progress already/);
  assert.equal((await dickOf(BOB.id)).length, 40, 'the same offer is not fought twice');

  const stats = await db.get(`SELECT battles_won, win_streak_max FROM battle_stats WHERE uid = ${BOB.id}`);
  assert.deepEqual(stats, { battles_won: 1, win_streak_max: 1 });
});

test('nobody can fight themselves, and a bet must be covered', async () => {
  await bothPlay();
  await handleMessage(message(ALICE, '/pvp 100'));
  assert.match(lastText(), /not long enough for such a big bet/);

  await handleMessage(message(ALICE, '/pvp 5'));
  const [data] = buttonData(lastMarkup());
  await handleCallback(callback(ALICE, data, { messageOf: sentMessage() }));
  assert.match(apiCalls('answerCallbackQuery').at(-1).params.text, /cannot fight with yourself/);
});

test('a loan resets the length to zero and is paid off by the following growths', async () => {
  config.growth.newcomersGraceDays = -1;
  config.growth.growShrinkRatio = 1;
  config.perks.streakGrades = [];
  config.loan.payoutRatio = 0.5;
  await handleMessage(message(ALICE, '/grow'));
  await setLength(ALICE.id, -6);

  await handleMessage(message(ALICE, '/loan'));
  const [agree] = buttonData(lastMarkup());
  await handleCallback(callback(BOB, agree, { messageOf: sentMessage() }));
  assert.match(apiCalls('answerCallbackQuery').at(-1).params.text, /sent by another person/);

  await handleCallback(callback(ALICE, agree, { messageOf: sentMessage() }));
  assert.equal((await dickOf(ALICE.id)).length, 0);
  assert.equal((await db.get('SELECT debt FROM loans')).debt, 6);
  await handleCallback(callback(ALICE, agree, { messageOf: sentMessage() }));
  assert.equal((await db.get('SELECT debt FROM loans')).debt, 6, 'a second press borrows nothing');

  advanceDays(1);
  rollSequence(0.5, 0.99);
  await handleMessage(message(ALICE, '/grow'));
  assert.equal((await dickOf(ALICE.id)).length, 5, 'a roll of 10, half of it to the debt');
  assert.equal((await db.get('SELECT debt FROM loans')).debt, 1);
  assert.match(lastText(), /micro-loaner \(-5\)/);

  advanceDays(1);
  rollSequence(0.5, 0.99);
  await handleMessage(message(ALICE, '/grow'));
  const loan = await db.get('SELECT debt, repaid_at FROM loans');
  assert.equal(loan.debt, 0);
  assert.ok(loan.repaid_at > 0);
  assert.equal((await dickOf(ALICE.id)).length, 14);
});

test('a positive dick gets no loan', async () => {
  await handleMessage(message(ALICE, '/grow'));
  await handleMessage(message(ALICE, '/loan'));
  assert.match(lastText(), /supposed only for girls/);
});

test('the Dick of the Day is elected once a day among the active players', async () => {
  await handleMessage(message(ALICE, '/dod'));
  assert.match(lastText(), /no candidates/);

  await bothPlay();
  await handleMessage(message(ALICE, '/dod'));
  assert.match(lastText(), /The Dick of the Day is <b><a href="tg:\/\/user\?id=\d+">/);
  const total = (await dickOf(ALICE.id)).length + (await dickOf(BOB.id)).length;
  assert.ok(total > 60 && total <= 65, `the bonus is 1 to 5, the total is ${total}`);

  await handleMessage(message(BOB, '/dick_of_day'));
  assert.match(lastText(), /has been already chosen for today/);
});
