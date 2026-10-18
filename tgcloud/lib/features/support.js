import { api, BotApiError } from 'sdk';
import { config } from '../config.js';
import { fromTelegram, t } from '../i18n.js';
import { escapeHtml, fullName, userLink } from '../html.js';
import { button, keyboard, reply } from '../tg.js';
import { clearDialogue, setDialogue, takeCooldown } from '../repo/state.js';

const PREFIX = 'support:';
const MARK = '🆘 ';
const DIALOGUE = 'support';

export function supportEnabled() {
  return config.supportChatId !== null;
}

export async function supportCommand({ message, lang }) {
  await setDialogue(message.from.id, DIALOGUE, null, config.dialogueSeconds);
  return { text: t(lang, 'commands.support.request') };
}

export function isSupportDialogue(dialogue) {
  return dialogue?.kind === DIALOGUE;
}

// Relays the user's message to the support chat, as a reply to `ticket` when it answers one.
export async function relayToSupport({ message, user, lang, ticket = null }) {
  await clearDialogue(message.from.id);
  if (!message.text) {
    await setDialogue(message.from.id, DIALOGUE, ticket ? { ticket } : null, config.dialogueSeconds);
    return { text: t(lang, 'commands.support.request') };
  }
  if (!(await takeCooldown(`support:${message.from.id}`, config.support.cooldownSeconds))) {
    return { text: t(lang, 'commands.support.too_often') };
  }
  const header = `${MARK}${userLink(message.from.id, fullName(message.from))}\n<code>${message.from.id}</code> ${lang}`;
  const params = {
    chat_id: config.supportChatId,
    text: `${header}\n\n${escapeHtml(message.text)}`,
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
  };
  if (ticket) params.reply_parameters = { message_id: ticket, allow_sending_without_reply: true };
  await api.sendMessage(params);
  return { text: t(lang, 'commands.support.sent') };
}

// The user a message in the support chat answers: the one named by the mention right after the
// mark of the ticket replied to. Only the bot can have written that mention, since the user's name
// and text are escaped.
export function supportRecipient(message) {
  if (!supportEnabled() || message.chat.id !== config.supportChatId) return null;
  const ticket = message.reply_to_message;
  if (!ticket?.from?.is_bot || !ticket.text?.startsWith(MARK)) return null;
  const entity = (ticket.entities ?? []).find((e) => e.offset === MARK.length
    && (e.type === 'text_mention' || (e.type === 'text_link' && e.url?.startsWith('tg://user?id='))));
  if (!entity) return null;
  const uid = entity.type === 'text_mention' ? entity.user.id : Number(entity.url.slice('tg://user?id='.length));
  const lang = ticket.text.split('\n')[1]?.split(' ')[1] ?? 'en';
  return Number.isSafeInteger(uid) ? { uid, ticket: ticket.message_id, lang: fromTelegram(lang) } : null;
}

export async function answerUser(message, recipient) {
  try {
    await api.copyMessage({
      chat_id: recipient.uid,
      from_chat_id: message.chat.id,
      message_id: message.message_id,
      reply_markup: keyboard([[button(t(recipient.lang, 'commands.support.reply_button'), `${PREFIX}${recipient.ticket}`)]]),
    });
  } catch (e) {
    if (!(e instanceof BotApiError)) throw e;
    await reply(message, t(fromTelegram(message.from?.language_code), 'commands.support.answer_failed'));
  }
}

// The ticket a user's reply in a private chat answers: the one under the button of the copied
// answer, which comes along with the replied-to message.
export function answeredTicket(message) {
  const rows = message.reply_to_message?.reply_markup?.inline_keyboard ?? [];
  for (const row of rows) {
    for (const key of row) {
      const ticket = parseSupportData(key.callback_data ?? '');
      if (ticket !== null) return ticket;
    }
  }
  return null;
}

export function parseSupportData(data) {
  if (!data.startsWith(PREFIX)) return null;
  const ticket = Number(data.slice(PREFIX.length));
  return Number.isSafeInteger(ticket) ? ticket : null;
}

export async function startReply(uid, ticket, lang) {
  await setDialogue(uid, DIALOGUE, { ticket }, config.dialogueSeconds);
  return t(lang, 'commands.support.request');
}
