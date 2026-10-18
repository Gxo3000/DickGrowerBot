import { test } from 'node:test';
import assert from 'node:assert/strict';
import handleMessage from '../tgcloud/handlers/message.js';
import handleCallback from '../tgcloud/handlers/callback_query.js';
import { matchesName, parseTop } from '../tgcloud/lib/features/import.js';
import {
  ALICE, BOB, BOT, GROUP, advanceDays, apiCalls, buttonData, callback, config, db, dickOf, lastMarkup, lastText,
  message, onApi, sentMessage, setLength, useBot,
} from './helpers.js';

useBot();

test('a dick neglected for a week shrinks with the first command of the day, and /shrinks repeats it', async () => {
  config.shrink.ratio = 0.1;
  config.shrink.inactivityDays = 7;
  config.shrink.rampUpDays = 1;
  await handleMessage(message(ALICE, '/grow'));
  await handleMessage(message(BOB, '/grow'));
  await setLength(ALICE.id, 100);
  await setLength(BOB.id, 100);
  advanceDays(7);
  await db.run(`UPDATE dicks SET grown_at = grown_at + 86400 WHERE uid = ${BOB.id}`);

  await handleMessage(message(BOB, '/top'));
  const summary = apiCalls('sendMessage').at(-2).params.text;
  assert.match(summary, /haven't grown in 7\+ days and shrank a bit:\n— <b>Alice<\/b> lost <b>10<\/b> cm \(now <b>90<\/b> cm\)$/);
  assert.equal((await dickOf(BOB.id)).length, 100);

  await handleMessage(message(BOB, '/top'));
  assert.equal(apiCalls('sendMessage').length, 5, 'the chores run once a day');
  await handleMessage(message(BOB, '/shrinks'));
  assert.match(lastText(), /<b>Alice<\/b> lost <b>10<\/b> cm/);
});

test('the shrink ramps up over the days of neglect', async () => {
  config.shrink.ratio = 0.1;
  config.shrink.inactivityDays = 2;
  config.shrink.rampUpDays = 4;
  await handleMessage(message(ALICE, '/grow'));
  await setLength(ALICE.id, 100);
  advanceDays(2);
  await handleMessage(message(BOB, '/top'));
  assert.equal((await dickOf(ALICE.id)).length, 97, 'a quarter of the full 10%, rounded up');
});

test('an import adds the lengths shown by another bot to the players it can tell apart', async () => {
  onApi('getChatAdministrators', () => [{ user: ALICE }, { user: BOT }]);
  await handleMessage(message(ALICE, '/grow'));
  await handleMessage(message(BOB, '/grow'));
  await setLength(ALICE.id, 1);
  await setLength(BOB.id, 1);
  const leaderboard = {
    message_id: 7,
    chat: GROUP,
    from: { id: 1, is_bot: true, first_name: 'Pipisa', username: 'pipisabot' },
    text: 'Топ 10 игроков 🔝\n\n1|Bob Smith🍆 — 30 см.\n2|Alice — 12 см.\n3|Carol🤥 — 1 см.\n\nраздача см в канале',
  };
  await handleMessage(message(ALICE, '/import', { reply_to_message: leaderboard }));
  assert.match(lastText(), /have been imported:\n➖ <b>Bob Smith<\/b> \(<i>30<\/i> cm\)\n➖ <b>Alice<\/b>/);
  assert.match(lastText(), /not in the game yet:\n➖ <b>Carol🤥<\/b>/);
  assert.equal((await dickOf(BOB.id)).length, 31);

  await handleMessage(message(ALICE, '/import', { reply_to_message: leaderboard }));
  assert.match(lastText(), /already imported earlier/);
  assert.equal((await dickOf(BOB.id)).length, 31);

  await handleMessage(message(BOB, '/import', { reply_to_message: leaderboard }));
  assert.match(lastText(), /admins only/);
});

test('the names of the other bots are matched the way they cut them', () => {
  assert.ok(matchesName('pipisabot', 'Leonid SadBot Rust\'a\'man', 'Leonid SadBot🍆...'));
  assert.ok(matchesName('pipisabot', 'Кошка', 'Кошка🤥'));
  assert.ok(!matchesName('pipisabot', 'Leonid Kozari', 'Leonid Kozari🤥...'));
  assert.ok(matchesName('kraft28_bot', 'Alice Smith', 'Alice'));
  assert.ok(!matchesName('kraft28_bot', 'Alicette', 'Alice'));
  assert.deepEqual(parseTop('Топ\n\n1|A — 3 см.\n\nfooter'), [{ name: 'A', length: 3 }]);
  assert.throws(() => parseTop('1|A — 3 см.\nnot a line'));
});

test('an admin confines the bot to a forum topic, and the other topics are refused', async () => {
  const forum = { ...GROUP, is_forum: true };
  onApi('getChatMember', ({ user_id: uid }) => ({ status: uid === ALICE.id ? 'administrator' : 'member' }));
  const inTopic = (from, text, topic) => message(from, text, {
    chat: forum, is_topic_message: true, message_thread_id: topic,
  });

  await handleMessage(inTopic(BOB, '/topics', 5));
  assert.match(lastText(), /Only chat administrators/);
  await handleMessage(inTopic(ALICE, '/topics', 5));
  assert.match(lastText(), /every topic/);
  const [onlyHere] = buttonData(lastMarkup());
  await handleCallback(callback(ALICE, onlyHere, { messageOf: { ...sentMessage(), chat: forum, message_thread_id: 5, is_topic_message: true } }));
  assert.match(lastText('editMessageText'), /in this topic<\/b>. Topics I am allowed in: <b>1<\/b>/);

  await handleMessage(inTopic(BOB, '/grow', 6));
  assert.match(lastText(), /I don't work in this topic/);
  await handleMessage(inTopic(BOB, '/grow', 5));
  assert.match(lastText(), /Your dick has grown/);
});

test('a group that becomes a supergroup keeps its game', async () => {
  const legacy = { id: -555, type: 'group', title: 'Old' };
  await handleMessage(message(ALICE, '/grow', { chat: legacy }));
  await handleMessage({ message_id: 1, chat: legacy, from: ALICE, migrate_to_chat_id: GROUP.id });
  await handleMessage(message(ALICE, '/stats'));
  assert.match(lastText(), /Position in the top: <b>1<\/b>/);
  const chats = await db.all('SELECT chat_id FROM chats');
  assert.deepEqual(chats, [{ chat_id: GROUP.id }]);
});
