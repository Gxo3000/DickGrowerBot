import { test } from 'node:test';
import assert from 'node:assert/strict';
import handleMessage from '../tgcloud/handlers/message.js';
import handleCallback from '../tgcloud/handlers/callback_query.js';
import handleInlineQuery from '../tgcloud/handlers/inline_query.js';
import { chatIdOfInlineMessage } from '../tgcloud/lib/inline_id.js';
import { base64UrlDecode, base64UrlEncode } from '../tgcloud/lib/base64.js';
import {
  ALICE, BOB, GROUP, advanceDays, apiCalls, callback, db, message, sentMessage, useBot,
} from './helpers.js';

useBot();

function inlineQuery(from, query, chatType = 'supergroup') {
  return { id: 'q1', from, query, offset: '', chat_type: chatType };
}

function inlineResults() {
  return apiCalls('answerInlineQuery').at(-1).params;
}

function encodeInlineId(chatId) {
  const bytes = new Uint8Array(24);
  const view = new DataView(bytes.buffer);
  view.setInt32(0, 2, true);
  view.setBigInt64(4, BigInt(chatId), true);
  view.setInt32(12, 77, true);
  view.setBigInt64(16, 123456789n, true);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return Buffer.from(binary, 'binary').toString('base64url');
}

test('the inline mode offers the launchers, and a press plays in the chat of the instance', async () => {
  await handleInlineQuery(inlineQuery(ALICE, ''));
  const { results } = inlineResults();
  const ids = results.map((r) => r.id);
  for (const id of ['grow', 'top', 'dick_of_day', 'loan', 'stats', 'shrinks', 'pvp:1']) {
    assert.ok(ids.includes(id), `${id} is offered`);
  }
  const grow = results.find((r) => r.id === 'grow').reply_markup.inline_keyboard[0][0].callback_data;
  assert.equal(grow, `in:${ALICE.id}:grow`);

  await handleCallback(callback(BOB, grow, { inlineMessageId: 'AgAAAA', chatInstance: 'inst-42' }));
  assert.match(apiCalls('answerCallbackQuery').at(-1).params.text, /sent by another person/);

  await handleCallback(callback(ALICE, grow, { inlineMessageId: 'AgAAAA', chatInstance: 'inst-42' }));
  const edit = apiCalls('editMessageText').at(-1).params;
  assert.equal(edit.inline_message_id, 'AgAAAA');
  assert.match(edit.text, /Your dick has grown/);
  const chats = await db.all('SELECT chat_id, chat_instance FROM chats');
  assert.deepEqual(chats, [{ chat_id: null, chat_instance: 'inst-42' }]);
});

test('a number offers a battle, a promo code offers its activation, a private chat gets a notice', async () => {
  await handleInlineQuery(inlineQuery(ALICE, '25'));
  assert.equal(inlineResults().results[0].id, 'pvp:25');

  await handleInlineQuery(inlineQuery(ALICE, 'SUMMER', 'private'));
  assert.match(inlineResults().button.start_parameter, /^promo-/);
  assert.equal(base64UrlDecode(inlineResults().button.start_parameter.slice(6)), 'SUMMER');

  await handleInlineQuery(inlineQuery(ALICE, '', 'private'));
  assert.equal(inlineResults().results[0].id, 'not_group');
});

test('inline play is merged into the chat once a button in the chat ties the two together', async () => {
  await handleCallback(callback(ALICE, `in:${ALICE.id}:grow`, { inlineMessageId: 'AgAAAA', chatInstance: 'inst-7' }));
  await db.run('UPDATE dicks SET length = 10');

  await handleMessage(message(ALICE, '/grow'));
  advanceDays(1);
  await handleMessage(message(BOB, '/grow'));
  await db.run(`UPDATE dicks SET length = 5 WHERE chat_id = (SELECT id FROM chats WHERE chat_id = ${GROUP.id})`);
  assert.equal((await db.all('SELECT * FROM chats')).length, 2);

  await handleMessage(message(BOB, '/top'));
  await handleCallback(callback(BOB, 'top:page:0', { messageOf: sentMessage(), chatInstance: 'inst-7' }));

  const chats = await db.all('SELECT chat_id, chat_instance FROM chats');
  assert.deepEqual(chats, [{ chat_id: GROUP.id, chat_instance: 'inst-7' }]);
  const alice = await db.get(`SELECT length FROM dicks WHERE uid = ${ALICE.id}`);
  assert.equal(alice.length, 15, 'the inline length and the chat length are summed');
});

test('the chat id of an inline message is read from its id', () => {
  assert.equal(chatIdOfInlineMessage(encodeInlineId(-1234567890)), -1001234567890);
  assert.equal(chatIdOfInlineMessage(encodeInlineId(42)), null);
  assert.equal(chatIdOfInlineMessage('garbage'), null);
});

test('base64url round-trips UTF-8', () => {
  for (const text of ['SUMMER', 'промо-код', 'T34', '🍆x']) {
    assert.equal(base64UrlDecode(base64UrlEncode(text)), text);
    assert.equal(base64UrlEncode(text), Buffer.from(text).toString('base64url'));
  }
});
