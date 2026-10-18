import { config } from '../config.js';
import { fromTelegram, t } from '../i18n.js';
import { fullName } from '../html.js';
import { botInfo, isForum, isGroupChat, reply, sendMessage, topicOf } from '../tg.js';
import { findCommand } from '../commands.js';
import { migrateChatId, resolveChat } from '../repo/chats.js';
import { clearDialogue, getDialogue, setDialogue } from '../repo/state.js';
import { upsertUser } from '../repo/users.js';
import { banNotice } from '../features/common.js';
import { grow } from '../features/grow.js';
import { top } from '../features/top.js';
import { dickOfDay } from '../features/dod.js';
import { startBattle } from '../features/pvp.js';
import { loan } from '../features/loan.js';
import { chatStats, personal } from '../features/stats.js';
import { recent } from '../features/shrink.js';
import { lotteryStatus } from '../features/lottery.js';
import { bossStatus } from '../features/boss.js';
import { adventureMenu } from '../features/adventure.js';
import { activateOrConfirm, codeFromStartParameter } from '../features/promo.js';
import { importFromBot } from '../features/import.js';
import { languageCommand } from '../features/language.js';
import { topicAllowed, topicsCommand } from '../features/topics.js';
import { helpText, privacyText, startText } from '../features/help.js';
import {
  answeredTicket, answerUser, isSupportDialogue, relayToSupport, supportCommand, supportRecipient,
} from '../features/support.js';
import { ADMIN_COMMANDS, adminCommand, isAdmin } from '../features/admin.js';
import { overLimit } from '../features/rate_limit.js';
import { dailyChores } from '../features/maintenance.js';

const MAX_BET = 65535;
const PROMO_DIALOGUE = 'promo';

const RUN = {
  start: async ({ from, user, lang, args }) => {
    const code = codeFromStartParameter(args);
    return code ? activateOrConfirm(user.uid, code, lang) : { text: startText(fullName(from), lang) };
  },
  help: async ({ lang }) => ({ text: helpText(lang) }),
  privacy: async ({ lang }) => ({ text: privacyText(lang) }),
  support: (env) => supportCommand(env),
  promo: async ({ user, lang, args }) => {
    if (args) return activateOrConfirm(user.uid, args, lang);
    await setDialogue(user.uid, PROMO_DIALOGUE, null, config.dialogueSeconds);
    return { text: t(lang, 'commands.promo.request') };
  },
  stats: (env) => (env.chat ? chatStats(env) : personal(env)),
  language: (env) => languageCommand(env),
  grow: (env) => grow(env),
  top: (env) => top(env),
  dod: (env) => dickOfDay(env),
  pvp: async (env) => {
    const bet = Number(env.args);
    if (!env.args || !Number.isInteger(bet) || bet < 1 || bet > MAX_BET) {
      return { text: t(env.lang, 'commands.pvp.errors.no_args') };
    }
    return startBattle({ ...env, bet });
  },
  loan: (env) => loan(env),
  adventure: (env) => adventureMenu(env),
  boss: (env) => bossStatus(env),
  lottery: (env) => lotteryStatus(env),
  shrinks: (env) => recent(env),
  import: (env) => importFromBot(env),
  topics: (env) => topicsCommand(env),
};

export async function handleMessage(message) {
  if (message.migrate_to_chat_id) {
    await migrateChatId(message.chat.id, message.migrate_to_chat_id);
    return;
  }
  if (!message.from || (message.from.is_bot && !message.sender_chat)) return;

  const recipient = supportRecipient(message);
  if (recipient) {
    await answerUser(message, recipient);
    return;
  }

  const command = await parseCommand(message);
  const isPrivate = message.chat.type === 'private';
  if (!command) {
    if (isPrivate) await handlePrivateText(message);
    return;
  }
  if (isPrivate && ADMIN_COMMANDS.includes(command.name) && isAdmin(message.from.id)) {
    const lang = fromTelegram(message.from.language_code);
    await reply(message, await adminCommand(command.name, command.args, lang));
    return;
  }
  const spec = findCommand(command.name);
  if (!spec) return;
  if (message.sender_chat && spec.scope === 'group') {
    await reply(message, t(fromTelegram(message.from.language_code), 'errors.group_account'));
    return;
  }
  if (message.from.is_bot) return;
  await runCommand(message, spec, command.args);
}

async function runCommand(message, spec, args) {
  const from = message.from;
  const isGroup = isGroupChat(message.chat);
  const limited = await overLimit(from.id, isGroup ? message.chat.id : null);
  if (limited) {
    if (limited.warn) await reply(message, t(fromTelegram(from.language_code), 'errors.rate_limited'));
    return;
  }

  const user = await upsertUser(from.id, fullName(from));
  if (!isGroup) {
    const dialogue = await getDialogue(from.id);
    if (dialogue) {
      await clearDialogue(from.id);
      if (isSupportDialogue(dialogue) && spec.name !== 'support') {
        await reply(message, t(user.lang ?? fromTelegram(from.language_code), 'commands.support.cancelled'));
      }
    }
  }
  if (spec.scope === 'group' && !isGroup) {
    await reply(message, t(user.lang ?? fromTelegram(from.language_code), 'errors.not_group_chat'));
    return;
  }
  if (spec.scope === 'private' && isGroup) return;

  const chat = isGroup ? await resolveChat({ chatId: message.chat.id }) : null;
  const lang = chat?.lang ?? user.lang ?? fromTelegram(from.language_code);

  if (isGroup && isForum(message.chat) && spec.name !== 'topics' && !topicAllowed(chat, topicOf(message))) {
    await reply(message, t(lang, 'errors.forbidden_topic'));
    return;
  }
  if (!spec.allowBanned) {
    const banned = banNotice(user, lang);
    if (banned) {
      await reply(message, banned);
      return;
    }
  }

  if (chat) {
    for (const text of await dailyChores(chat, lang)) {
      await sendMessage(message.chat.id, text, { threadId: isForum(message.chat) ? topicOf(message) : undefined });
    }
  }
  const result = await RUN[spec.name]({ message, chat, user, from, lang, args });
  if (result?.text) {
    await reply(message, result.text, result.keyboard);
  }
}

async function handlePrivateText(message) {
  const ticket = answeredTicket(message);
  const dialogue = ticket === null ? await getDialogue(message.from.id) : null;
  if (ticket === null && !dialogue) {
    await reply(message, t(fromTelegram(message.from.language_code), 'errors.not_group_chat'));
    return;
  }
  const user = await upsertUser(message.from.id, fullName(message.from));
  const lang = user.lang ?? fromTelegram(message.from.language_code);
  let result;
  if (ticket !== null || isSupportDialogue(dialogue)) {
    result = await relayToSupport({ message, user, lang, ticket: ticket ?? dialogue.data?.ticket ?? null });
  } else {
    await clearDialogue(message.from.id);
    const banned = banNotice(user, lang);
    result = banned ? { text: banned } : await activateOrConfirm(user.uid, (message.text ?? '').trim(), lang);
  }
  await reply(message, result.text, result.keyboard);
}

// The command a message carries, unless it is addressed to another bot.
async function parseCommand(message) {
  const text = message.text ?? message.caption;
  const entity = (message.entities ?? message.caption_entities ?? [])[0];
  if (!text || !text.startsWith('/') || (entity && (entity.type !== 'bot_command' || entity.offset !== 0))) {
    return null;
  }
  const head = text.split(/\s/, 1)[0];
  const [name, addressee] = head.slice(1).split('@');
  if (addressee && addressee.toLowerCase() !== (await botInfo()).username.toLowerCase()) return null;
  return { name: name.toLowerCase(), args: text.slice(head.length).trim() };
}
