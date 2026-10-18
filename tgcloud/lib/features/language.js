import { isSupported, LANGUAGE_LABELS, LANGUAGES, t } from '../i18n.js';
import { button, isChatAdmin, keyboard } from '../tg.js';
import { setChatLang } from '../repo/chats.js';
import { setUserLang } from '../repo/users.js';

const PREFIX = 'lang:';

// `/language` in a private chat picks the user's language, in a group the whole chat's.
export async function languageCommand({ message, chat, user, lang, args }) {
  const forChat = Boolean(chat);
  if (forChat && !(await isChatAdmin(message.chat.id, message.from.id))) {
    return { text: t(lang, 'commands.language.errors.admins_only') };
  }
  const requested = args.trim().toLowerCase();
  if (requested) {
    if (!isSupported(requested)) return { text: t(lang, 'commands.language.errors.unsupported') };
    return { text: await apply({ chat, user, choice: requested }) };
  }
  const scope = forChat ? 'c' : 'u';
  const rows = LANGUAGES.map((code) => [button(LANGUAGE_LABELS[code], `${PREFIX}${scope}:${code}`)]);
  if (forChat) rows.push([button(t(lang, 'commands.language.chat.auto_button'), `${PREFIX}c:auto`)]);
  return {
    text: t(lang, forChat ? 'commands.language.chat.prompt' : 'commands.language.prompt'),
    keyboard: keyboard(rows),
  };
}

export function parseLanguageData(data) {
  if (!data.startsWith(PREFIX)) return null;
  const [scope, choice] = data.slice(PREFIX.length).split(':');
  if (scope !== 'c' && scope !== 'u') return null;
  return isSupported(choice) || (scope === 'c' && choice === 'auto') ? { forChat: scope === 'c', choice } : null;
}

export async function answerLanguage({ query, chat, user, lang, data }) {
  if (data.forChat) {
    if (!chat || !query.message || !(await isChatAdmin(query.message.chat.id, query.from.id))) {
      return { alert: t(lang, 'commands.language.errors.admins_only') };
    }
    return { text: await apply({ chat, user, choice: data.choice }) };
  }
  return { text: await apply({ chat: null, user, choice: data.choice }) };
}

async function apply({ chat, user, choice }) {
  if (chat) {
    const lang = choice === 'auto' ? null : choice;
    await setChatLang(chat.id, lang);
    return t(lang ?? user.lang ?? 'en', lang ? 'commands.language.chat.success' : 'commands.language.chat.reset');
  }
  await setUserLang(user.uid, choice);
  return t(choice, 'commands.language.success');
}
