import { test } from 'node:test';
import assert from 'node:assert/strict';
import handleMessage from '../tgcloud/handlers/message.js';
import handleCallback from '../tgcloud/handlers/callback_query.js';
import { promoStartParameter } from '../tgcloud/lib/features/promo.js';
import {
  ALICE, BOB, GROUP, advanceDays, apiCalls, buttonData, callback, config, db, dickOf, lastMarkup, lastText, message, onApi,
  privateChat, sentMessage, setLength, useBot,
} from './helpers.js';

useBot();

const ADMIN = { id: 999, is_bot: false, first_name: 'Owner', language_code: 'en' };

function pm(from, text, extra = {}) {
  return message(from, text, { chat: privateChat(from), ...extra });
}

async function adminSays(text) {
  config.admins = [ADMIN.id];
  await handleMessage(pm(ADMIN, text));
  return lastText();
}

test('the owner creates a promo code, and a player activates it once in every chat', async () => {
  assert.match(await adminSays('/promo_add SUMMER 10 2 7'), /Promo code <code>summer<\/code>: 10 cm, 2 activations/);
  assert.match(await adminSays('/promo_add SUMMER 10 2'), /already exists/);

  await handleMessage(pm(ALICE, '/promo summer'));
  assert.match(lastText(), /don't have any dicks yet/);

  await handleMessage(message(ALICE, '/grow'));
  await setLength(ALICE.id, 1);
  await handleMessage(pm(ALICE, '/promo'));
  assert.match(lastText(), /Enter a promo code/);
  await handleMessage(pm(ALICE, 'summer'));
  assert.match(lastText(), /grown by <b>10<\/b> cm in one chat/);
  assert.equal((await dickOf(ALICE.id)).length, 11);

  await handleMessage(pm(ALICE, `/start ${promoStartParameter('SUMMER')}`));
  assert.match(lastText(), /already used this promocode/);
  assert.equal((await db.get('SELECT capacity FROM promo_codes')).capacity, 1);
});

test('a promo code that takes a lot away is confirmed first', async () => {
  await adminSays('/promo_add OUCH -150 5');
  await handleMessage(message(ALICE, '/grow'));
  await handleMessage(pm(ALICE, '/promo OUCH'));
  assert.match(lastText(), /shrinks<\/b> it by <b>150<\/b> cm/);
  const [confirm, cancel] = buttonData(lastMarkup());
  const offer = { ...sentMessage(), chat: privateChat(ALICE) };
  await handleCallback(callback(ALICE, cancel, { messageOf: offer }));
  assert.match(lastText('editMessageText'), /wasn't activated/);
  const before = (await dickOf(ALICE.id)).length;
  await handleCallback(callback(ALICE, confirm, { messageOf: offer }));
  assert.equal((await dickOf(ALICE.id)).length, before - 150);
});

test('a ban stops the game but not the help, and is lifted', async () => {
  await handleMessage(message(ALICE, '/grow'));
  await adminSays(`/ban ${ALICE.id} 3`);
  await handleMessage(message(ALICE, '/grow'));
  assert.match(lastText(), /You can't play until/);
  await handleMessage(message(ALICE, '/help'));
  assert.match(lastText(), /biggest dick in the world/);
  await adminSays(`/unban ${ALICE.id}`);
  await handleMessage(message(ALICE, '/grow'));
  assert.match(lastText(), /already played with your dick today/);
});

test('the owner syncs the command menus and the descriptions; somebody else can not', async () => {
  await handleMessage(pm(ALICE, '/sync_commands'));
  assert.equal(apiCalls('setMyCommands').length, 0);
  assert.match(await adminSays('/sync_commands'), /30 requests/);

  const menu = (scope, language) => apiCalls('setMyCommands')
    .find((c) => c.params.scope.type === scope && c.params.language_code === language)
    .params.commands;
  const russianGroup = menu('all_group_chats', 'ru');
  assert.ok(russianGroup.some((c) => c.command === 'grow' && c.description === 'Вырасти пиписю!'));
  const admins = menu('all_chat_administrators', undefined).map((c) => c.command);
  assert.ok(admins.includes('topics') && admins.includes('grow'));
  const privates = menu('all_private_chats', undefined).map((c) => c.command);
  assert.deepEqual(privates, ['stats', 'promo', 'language', 'help', 'privacy']);
  const group = menu('all_group_chats', undefined).map((c) => c.command);
  assert.deepEqual(group, ['grow', 'top', 'dod', 'pvp', 'loan', 'shrinks', 'stats', 'help']);

  const russian = apiCalls('setMyDescription').find((c) => c.params.language_code === 'ru').params.description;
  assert.match(russian, /^🍆 У кого самая большая в чате\?/);
  assert.equal(apiCalls('setMyShortDescription').length, 6);
});

test('every menu command and description is translated and fits Telegram limits', async () => {
  await adminSays('/sync_commands');
  for (const { params } of apiCalls('setMyCommands')) {
    for (const { command, description } of params.commands) {
      assert.ok(!description.startsWith('commands.'), `${command} has no description in ${params.language_code}`);
      assert.ok(description.length <= 256, `${command} is too long in ${params.language_code}`);
    }
  }
  for (const { params } of apiCalls('setMyDescription')) {
    assert.ok(params.description.length <= 512 && !params.description.startsWith('bot.'));
  }
  for (const { params } of apiCalls('setMyShortDescription')) {
    assert.ok(params.short_description.length <= 120 && !params.short_description.startsWith('bot.'));
  }
});

test('game commands in a private chat and plain private texts get the group notice', async () => {
  await handleMessage(pm(ALICE, '/grow'));
  assert.match(lastText(), /in group chats only/);
  await handleMessage(pm(ALICE, 'hello'));
  assert.match(lastText(), /in group chats only/);
  await handleMessage(pm(ALICE, '/start'));
  assert.match(lastText(), /^Hello, <b>Alice<\/b>!/);
});

test('a personal language applies everywhere a chat has none, and a chat language beats it', async () => {
  await handleMessage(pm(ALICE, '/language'));
  const ru = buttonData(lastMarkup()).find((data) => data === 'lang:u:ru');
  await handleCallback(callback(ALICE, ru, { messageOf: { ...sentMessage(), chat: privateChat(ALICE) } }));
  assert.match(lastText('editMessageText'), /Твой язык сохранён/);
  await handleMessage(message(ALICE, '/grow'));
  assert.match(lastText(), /Твоя пися/);

  onApi('getChatMember', () => ({ status: 'administrator' }));
  await handleMessage(message(BOB, '/language it'));
  await handleMessage(message(ALICE, '/top'));
  assert.match(lastText(), /^Classifica dei peni più grandi:/);
  const chat = await db.get(`SELECT lang FROM chats WHERE chat_id = ${GROUP.id}`);
  assert.equal(chat.lang, 'it');
});

test('only admins choose the chat language', async () => {
  await handleMessage(message(BOB, '/language ru'));
  assert.match(lastText(), /Only chat administrators/);
});

test('the support relays a request and brings the answer back', async () => {
  config.supportChatId = -100777;
  await handleMessage(pm(ALICE, '/support'));
  assert.match(lastText(), /Write your message/);
  await handleMessage(pm(ALICE, 'my dick <vanished>'));
  const relayed = apiCalls('sendMessage').at(-2).params;
  assert.equal(relayed.chat_id, -100777);
  assert.match(relayed.text, /^🆘 <a href="tg:\/\/user\?id=101">Alice<\/a>\n<code>101<\/code> en\n\nmy dick &lt;vanished&gt;$/);
  assert.match(lastText(), /Your message is sent/);

  const ticket = {
    message_id: 555,
    chat: { id: -100777, type: 'supergroup' },
    from: { id: 4242, is_bot: true, first_name: 'Grower' },
    text: '🆘 Alice\n101 en\n\nmy dick <vanished>',
    entities: [{ type: 'text_mention', offset: 3, length: 5, user: { id: ALICE.id } }],
  };
  await handleMessage(message(BOB, 'we are on it', { chat: { id: -100777, type: 'supergroup' }, reply_to_message: ticket }));
  const copy = apiCalls('copyMessage').at(-1).params;
  assert.equal(copy.chat_id, ALICE.id);
  assert.deepEqual(buttonData(copy.reply_markup), ['support:555']);

  const reply = { message_id: 9, chat: privateChat(ALICE), reply_markup: copy.reply_markup };
  await handleMessage(pm(ALICE, 'thanks', { reply_to_message: reply }));
  assert.match(lastText(), /wait a minute/);

  advanceDays(1 / 1440);
  await handleMessage(pm(ALICE, 'thanks', { reply_to_message: reply }));
  const followUp = apiCalls('sendMessage').at(-2).params;
  assert.equal(followUp.chat_id, -100777);
  assert.equal(followUp.reply_parameters.message_id, 555);
  assert.match(lastText(), /Your message is sent/);
});

test('the rate limit answers the first excess requests and then drops them', async () => {
  config.rateLimit.userRequests = 2;
  config.rateLimit.warnings = 1;
  for (let i = 0; i < 4; i++) {
    await handleMessage(message(ALICE, '/top'));
  }
  const texts = apiCalls('sendMessage').map((c) => c.params.text);
  assert.equal(texts.length, 3);
  assert.match(texts[2], /Too many requests/);
});

test('the help lists the games', async () => {
  await handleMessage(message(ALICE, '/help'));
  const text = lastText();
  for (const fragment of ['/grow', '/top', '/dod', '/pvp', '/loan', '/promo', 'Telegram Serverless']) {
    assert.ok(text.includes(fragment), `the help mentions ${fragment}`);
  }
  assert.ok(text.length < 4096, `the help fits a message: ${text.length}`);
});

test('a promo code is case-insensitive in any alphabet', async () => {
  await adminSays('/promo_add ПромоКод 7 5');
  assert.match(await adminSays('/promo_add промокод 1 1'), /already exists/);
  await handleMessage(message(ALICE, '/grow'));
  await setLength(ALICE.id, 10);
  await handleMessage(pm(ALICE, '/promo ПРОМОКОД'));
  assert.match(lastText(), /grown by <b>7<\/b>/);
  const dick = await dickOf(ALICE.id);
  assert.equal(dick.length, 17);
});
