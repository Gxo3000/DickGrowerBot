import { test } from 'node:test';
import assert from 'node:assert/strict';
import handleMessage from '../tgcloud/handlers/message.js';
import {
  ALICE, BOB, advanceDays, apiCalls, config, db, dickOf, lastText, message, rollSequence, setLength, useBot,
} from './helpers.js';

useBot();

test('the first growth of a newcomer is always positive and creates the dick', async () => {
  rollSequence(0.99, 0.0);
  await handleMessage(message(ALICE, '/grow'));
  const dick = await dickOf(ALICE.id);
  assert.ok(dick.length > 0, `a newcomer grew by ${dick.length}`);
  assert.match(lastText(), /has grown by <b>\d+ cm<\/b>/);
  assert.match(lastText(), /position in the top is <b>1<\/b>/);
});

test('a second growth on the same day is refused, and the next day is allowed', async () => {
  await handleMessage(message(ALICE, '/grow'));
  const first = await dickOf(ALICE.id);
  await handleMessage(message(ALICE, '/grow'));
  assert.match(lastText(), /already played with your dick today/);
  assert.equal((await dickOf(ALICE.id)).length, first.length);

  advanceDays(1);
  await handleMessage(message(ALICE, '/grow'));
  assert.match(lastText(), /Your dick has (grown|shrunk)/);
});

test('a bonus attempt pays for a second growth and is spent', async () => {
  await handleMessage(message(ALICE, '/grow'));
  await db.run('UPDATE dicks SET bonus_attempts = 1');
  await handleMessage(message(ALICE, '/grow'));
  assert.match(lastText(), /Your dick has (grown|shrunk)/);
  assert.equal((await dickOf(ALICE.id)).bonus_attempts, 0);
  await handleMessage(message(ALICE, '/grow'));
  assert.match(lastText(), /already played/);
});

test('the first growth of the day keeps a bonus attempt for later', async () => {
  await handleMessage(message(ALICE, '/grow'));
  await db.run('UPDATE dicks SET bonus_attempts = 1');
  advanceDays(1);
  await handleMessage(message(ALICE, '/grow'));
  assert.equal((await dickOf(ALICE.id)).bonus_attempts, 1);
});

test('a streak adds a centimetre from its second day and is shown in the answer', async () => {
  config.perks.streakGrades = [2, 4];
  config.growth.newcomersGraceDays = -1;
  config.growth.growShrinkRatio = 1;
  rollSequence(0.5, 0.0);
  await handleMessage(message(ALICE, '/grow'));
  const day1 = (await dickOf(ALICE.id)).length;
  advanceDays(1);
  rollSequence(0.5, 0.0);
  await handleMessage(message(ALICE, '/grow'));
  const day2 = (await dickOf(ALICE.id)).length;
  assert.equal(day2 - day1, 2, 'a roll of 1 and the streak bonus of 1');
  assert.match(lastText(), /day after day \(\+1, 2 days in a row; \+2 from day 4\)/);
});

test('the top lists the players with the caller underlined', async () => {
  await handleMessage(message(ALICE, '/grow'));
  await handleMessage(message(BOB, '/grow'));
  await setLength(ALICE.id, 10);
  await setLength(BOB.id, 20);
  await handleMessage(message(ALICE, '/top'));
  const text = lastText();
  assert.match(text, /1\|<b>Bob Smith<\/b> — <b>20<\/b> cm/);
  assert.match(text, /2\|<b><u>Alice<\/u><\/b> — <b>10<\/b> cm/);
});

test('a command addressed to another bot is ignored', async () => {
  await handleMessage(message(ALICE, '/grow@SomeOtherBot'));
  assert.equal(apiCalls('sendMessage').length, 0);
  await handleMessage(message(ALICE, '/grow@TestGrowerBot'));
  assert.equal(apiCalls('sendMessage').length, 1);
});
