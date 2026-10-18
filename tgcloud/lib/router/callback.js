import { config } from '../config.js';
import { fromTelegram, t } from '../i18n.js';
import { fullName } from '../html.js';
import {
  answerCallback, deleteCallbackMessage, editCallbackMessage, isForum, isGroupChat, sendMessage, topicOf,
} from '../tg.js';
import { chatIdOfInlineMessage } from '../inline_id.js';
import { resolveChat } from '../repo/chats.js';
import { upsertUser } from '../repo/users.js';
import { banNotice } from '../features/common.js';
import { parseTopPage, top } from '../features/top.js';
import { acceptBattle, parseBattleData } from '../features/pvp.js';
import { answerLoan, parseLoanData } from '../features/loan.js';
import { answerConfirmation, parsePromoData } from '../features/promo.js';
import { answerLanguage, parseLanguageData } from '../features/language.js';
import { answerTopics, parseTopicsData, topicAllowed } from '../features/topics.js';
import { parseSupportData, startReply } from '../features/support.js';
import { overLimit } from '../features/rate_limit.js';
import { dailyChores } from '../features/maintenance.js';
import { parseLauncherData, runLauncher } from './inline.js';

// Each route: `parse` reads its data (null when it isn't its), `needsChat` says it only makes
// sense in a game chat, `owned` names the uid only whose press counts, `run` returns what to show.
const ROUTES = [
  { parse: parseTopPage, needsChat: true, run: (env, page) => top({ ...env, page }) },
  { parse: parseBattleData, needsChat: true, run: (env, data) => acceptBattle({ ...env, data }) },
  { parse: parseLoanData, needsChat: true, owned: (data) => data.uid, run: (env, data) => answerLoan({ ...env, data }) },
  { parse: parsePromoData, run: async (env, data) => ({ text: await answerConfirmation(env.user.uid, data, env.lang) }) },
  { parse: parseLanguageData, run: (env, data) => answerLanguage({ ...env, data }) },
  { parse: parseTopicsData, needsChat: true, run: (env, data) => answerTopics({ ...env, data }) },
  {
    parse: parseSupportData,
    run: async (env, ticket) => {
      await sendMessage(env.from.id, await startReply(env.from.id, ticket, env.lang));
      return {};
    },
  },
  { parse: parseLauncherData, needsChat: true, owned: (data) => data.uid, run: (env, data) => runLauncher(env, data.command) },
];

export async function handleCallback(query) {
  const data = query.data ?? '';
  const from = query.from;
  const fallbackLang = fromTelegram(from.language_code);
  const ref = chatRefOf(query);
  const limited = await overLimit(from.id, ref?.chatId ?? ref?.instance ?? null);
  if (limited) {
    await answerCallback(query, limited.warn ? t(fallbackLang, 'errors.rate_limited') : undefined, {
      alert: true, cacheTime: config.rateLimit.windowSeconds,
    });
    return;
  }

  const user = await upsertUser(from.id, fullName(from));
  const chat = ref ? await resolveChat(ref) : null;
  const lang = chat?.lang ?? user.lang ?? fallbackLang;
  const env = { query, chat, user, from, lang };

  for (const route of ROUTES) {
    const parsed = route.parse(data);
    if (parsed === null) continue;
    if (route.needsChat && !chat) break;
    if (route.owned && route.owned(parsed) !== from.id) {
      await answerCallback(query, t(lang, 'inline.callback.errors.another_user'), { alert: true });
      return;
    }
    const message = query.message;
    if (chat && message && isForum(message.chat) && route.parse !== parseTopicsData
        && !topicAllowed(chat, topicOf(message))) {
      await answerCallback(query, t(lang, 'errors.forbidden_topic_callback'), { alert: true });
      return;
    }
    if (route.parse !== parseLanguageData && route.parse !== parseSupportData) {
      const banned = banNotice(user, lang);
      if (banned) {
        await answerCallback(query, banned, { alert: true });
        return;
      }
    }
    if (chat) await postChores(query, chat, lang);
    await show(query, await route.run(env, parsed));
    return;
  }
  await answerCallback(query, t(lang, 'inline.callback.errors.unknown_data'), { alert: true });
}

// The chat a button was pressed in. A button of a group message names the chat both ways, which is
// what ties the chat to its inline messages; a button of an inline message knows the instance, and
// the id too when the message id encodes a supergroup.
function chatRefOf(query) {
  if (query.message) {
    return isGroupChat(query.message.chat) ? { chatId: query.message.chat.id, instance: query.chat_instance ?? null } : null;
  }
  if (query.inline_message_id && query.chat_instance) {
    return { chatId: chatIdOfInlineMessage(query.inline_message_id), instance: query.chat_instance };
  }
  return null;
}

async function postChores(query, chat, lang) {
  const messages = await dailyChores(chat, lang);
  if (!query.message) return;
  const threadId = isForum(query.message.chat) ? topicOf(query.message) : undefined;
  for (const text of messages) {
    await sendMessage(query.message.chat.id, text, { threadId });
  }
}

async function show(query, result) {
  await answerCallback(query, result.alert ?? result.toast, { alert: Boolean(result.alert) });
  if (result.alert) return;
  if (result.deletable && (await deleteCallbackMessage(query))) return;
  if (result.text) await editCallbackMessage(query, result.text, result.keyboard);
}
