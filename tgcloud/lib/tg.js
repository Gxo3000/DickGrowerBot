import { api, BotApiError } from 'sdk';

const MAX_TEXT = 4096;

let me = null;

// The bot's own user, asked for once per isolate.
export async function botInfo() {
  me ??= await api.getMe();
  return me;
}

export function isGroupChat(chat) {
  return chat?.type === 'group' || chat?.type === 'supergroup';
}

export function isForum(chat) {
  return chat?.type === 'supergroup' && chat.is_forum === true;
}

// The forum topic a message belongs to; the General topic, which has no id, is 1.
export function topicOf(message) {
  return message.is_topic_message ? message.message_thread_id : 1;
}

export function button(text, data) {
  return { text, callback_data: data };
}

export function keyboard(rows) {
  const filled = rows.filter((row) => row.length > 0);
  return filled.length > 0 ? { inline_keyboard: filled } : undefined;
}

// Answers a message: in a group as a reply to it, in a private chat as a plain message.
export async function reply(message, text, markup) {
  const replyTo = isGroupChat(message.chat)
    ? { message_id: message.message_id, allow_sending_without_reply: true }
    : undefined;
  return send({ chat_id: message.chat.id, reply_parameters: replyTo }, text, markup);
}

export async function sendMessage(chatId, text, { threadId, markup } = {}) {
  const thread = threadId && threadId !== 1 ? threadId : undefined;
  return send({ chat_id: chatId, message_thread_id: thread }, text, markup);
}

export async function answerCallback(query, text, { alert = false, cacheTime } = {}) {
  const params = { callback_query_id: query.id };
  if (text) {
    params.text = text;
    params.show_alert = alert;
  }
  if (cacheTime) params.cache_time = cacheTime;
  await api.answerCallbackQuery(params);
}

// Rewrites the message a button belongs to, whether it is in a chat or an inline one.
export async function editCallbackMessage(query, text, markup) {
  const params = { text, parse_mode: 'HTML', link_preview_options: { is_disabled: true } };
  if (query.inline_message_id) {
    params.inline_message_id = query.inline_message_id;
  } else {
    params.chat_id = query.message.chat.id;
    params.message_id = query.message.message_id;
  }
  if (markup) params.reply_markup = markup;
  try {
    await api.editMessageText(params);
  } catch (e) {
    if (!isNotModified(e)) throw e;
  }
}

export async function deleteCallbackMessage(query) {
  if (!query.message) return false;
  try {
    await api.deleteMessage({ chat_id: query.message.chat.id, message_id: query.message.message_id });
    return true;
  } catch (e) {
    if (e instanceof BotApiError) return false;
    throw e;
  }
}

export async function isChatAdmin(chatId, userId) {
  try {
    const member = await api.getChatMember({ chat_id: chatId, user_id: userId });
    return member.status === 'creator' || member.status === 'administrator';
  } catch (e) {
    if (e instanceof BotApiError) return false;
    throw e;
  }
}

// A text too long for one message goes out in several, cut at line ends; the keyboard goes with
// the last one, and only the first is a reply.
async function send(target, text, markup) {
  const parts = splitText(text);
  let sent;
  for (const [i, part] of parts.entries()) {
    const params = { ...target, text: part, parse_mode: 'HTML', link_preview_options: { is_disabled: true } };
    if (i > 0 || !params.reply_parameters) delete params.reply_parameters;
    if (!params.message_thread_id) delete params.message_thread_id;
    if (markup && i === parts.length - 1) params.reply_markup = markup;
    sent = await api.sendMessage(params);
  }
  return sent;
}

function splitText(text) {
  if (text.length <= MAX_TEXT) return [text];
  const parts = [];
  let current = '';
  for (const line of text.split('\n')) {
    const joined = current ? `${current}\n${line}` : line;
    if (joined.length > MAX_TEXT && current) {
      parts.push(current);
      current = line.slice(0, MAX_TEXT);
    } else {
      current = joined.slice(0, MAX_TEXT);
    }
  }
  if (current) parts.push(current);
  return parts;
}

function isNotModified(e) {
  return e instanceof BotApiError && e.code === 400 && /not modified/i.test(e.description ?? '');
}
