import { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import * as schema from '../tgcloud/schema.js';
import { resetDatabase, db } from './sdk/db.js';
import { apiCalls, onApi, resetApi, BOT } from './sdk/api.js';
import { clock, DAY_SECONDS } from '../tgcloud/lib/time.js';
import { rng } from '../tgcloud/lib/random.js';
import { config } from '../tgcloud/lib/config.js';

export { apiCalls, onApi, db, BOT, config };

export const GROUP = { id: -1001234567890, type: 'supergroup', title: 'Test' };
export const ALICE = { id: 101, is_bot: false, first_name: 'Alice', language_code: 'en' };
export const BOB = { id: 202, is_bot: false, first_name: 'Bob', last_name: 'Smith', language_code: 'en' };

// 2026-08-17 12:00 UTC: the day number is 20682.
export const START = 20682 * DAY_SECONDS + 12 * 3600;

const DEFAULT_CONFIG = structuredClone(config);
const logged = [];
const consoleError = console.error;
let messageId = 1;
let updateId = 1;

// Registers a fresh database and API for every test, and fails a test in which a handler caught
// and logged an error: the handlers never throw, so a log line is the only trace a bug leaves.
export function useBot() {
  beforeEach(setup);
  afterEach(() => {
    console.error = consoleError;
    const errors = logged.splice(0);
    assert.deepEqual(errors, [], 'a handler logged an error');
  });
}

export function setup() {
  logged.length = 0;
  console.error = (...args) => logged.push(args.map((arg) => (arg instanceof Error ? arg.stack : arg)));
  resetDatabase(schema);
  resetApi();
  Object.assign(config, structuredClone(DEFAULT_CONFIG));
  setNow(START);
  rng.next = Math.random;
}

export function setNow(unixSeconds) {
  clock.now = () => unixSeconds * 1000;
}

export function advanceDays(days) {
  const now = clock.now() / 1000;
  setNow(now + days * DAY_SECONDS);
}

// Makes the RNG return the given values in turn, then 0.5 forever.
export function rollSequence(...values) {
  const queue = [...values];
  rng.next = () => (queue.length > 0 ? queue.shift() : 0.5);
}

export function message(from, text, { chat = GROUP, ...extra } = {}) {
  const entities = text.startsWith('/') ? [{ type: 'bot_command', offset: 0, length: text.split(/\s/)[0].length }] : [];
  return {
    message_id: messageId++,
    date: Math.floor(clock.now() / 1000),
    chat,
    from,
    text,
    entities,
    ...extra,
  };
}

export function privateChat(user) {
  return { id: user.id, type: 'private', first_name: user.first_name };
}

export function callback(from, data, { messageOf = null, inlineMessageId = null, chatInstance = 'instance-1' } = {}) {
  const query = { id: String(updateId++), from, data, chat_instance: chatInstance };
  if (messageOf) query.message = messageOf;
  if (inlineMessageId) query.inline_message_id = inlineMessageId;
  return query;
}

// The text of the last message the bot sent, or of the last edit.
export function lastText(method = 'sendMessage') {
  const calls = apiCalls(method);
  return calls.at(-1)?.params.text;
}

export function lastMarkup(method = 'sendMessage') {
  return apiCalls(method).at(-1)?.params.reply_markup;
}

export function buttonData(markup) {
  return (markup?.inline_keyboard ?? []).flat().map((key) => key.callback_data);
}

// A message the bot sent, as the `message` of a callback query pressed under it.
export function sentMessage(index = -1) {
  const call = apiCalls('sendMessage').at(index);
  return { message_id: 900 + messageId++, chat: { ...GROUP, id: call.params.chat_id }, from: BOT, text: call.params.text };
}

export async function dickOf(uid, chatId = GROUP.id) {
  return db.get(`
    SELECT d.length, d.grown_at, d.bonus_attempts FROM dicks d JOIN chats c ON c.id = d.chat_id
    WHERE d.uid = ${uid} AND c.chat_id = ${chatId}`);
}

export async function setLength(uid, length, chatId = GROUP.id) {
  await db.run(`
    UPDATE dicks SET length = ${length} WHERE uid = ${uid} AND chat_id = (SELECT id FROM chats WHERE chat_id = ${chatId})`);
}
