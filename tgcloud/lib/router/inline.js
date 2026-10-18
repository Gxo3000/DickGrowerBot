import { api } from 'sdk';
import { config, commandEnabled } from '../config.js';
import { fromTelegram, t } from '../i18n.js';
import { fullName } from '../html.js';
import { button, keyboard } from '../tg.js';
import { isBanned, upsertUser } from '../repo/users.js';
import { banNotice } from '../features/common.js';
import { grow } from '../features/grow.js';
import { top } from '../features/top.js';
import { dickOfDay } from '../features/dod.js';
import { inlineOffer } from '../features/pvp.js';
import { loan } from '../features/loan.js';
import { chatStats } from '../features/stats.js';
import { recent, shrinkEnabled } from '../features/shrink.js';
import { lotteryStatus } from '../features/lottery.js';
import { bossStatus } from '../features/boss.js';
import { adventureMenu } from '../features/adventure.js';
import { isPromoCode, promoStartParameter } from '../features/promo.js';
import { overLimit } from '../features/rate_limit.js';

const PREFIX = 'in:';
const MAX_BET = 65535;
const CACHE_SECONDS = 10;

// What each launcher of the inline mode runs once its button is pressed in the chat.
const LAUNCHERS = {
  grow: { command: 'grow', run: grow },
  top: { command: 'top', run: top },
  dick_of_day: { command: 'dod', run: dickOfDay },
  loan: { command: 'loan', run: loan },
  stats: { command: 'stats', run: chatStats },
  adventure: { command: 'adventure', run: adventureMenu },
  boss: { command: 'boss', run: bossStatus },
  lottery: { command: 'lottery', run: lotteryStatus },
  shrinks: { command: 'shrinks', run: recent, available: shrinkEnabled },
};

export async function handleInlineQuery(query) {
  const from = query.from;
  const limited = await overLimit(from.id, null);
  if (limited) {
    const lang = fromTelegram(from.language_code);
    await answer(query, limited.warn ? [notice('limited', t(lang, 'errors.rate_limited_inline_title'),
      t(lang, 'errors.rate_limited'))] : [], config.rateLimit.windowSeconds);
    return;
  }
  const user = await upsertUser(from.id, fullName(from));
  const lang = user.lang ?? fromTelegram(from.language_code);
  if (isBanned(user)) {
    await answer(query, [notice('banned', t(lang, 'errors.banned_inline_title'), banNotice(user, lang))], 1);
    return;
  }

  const text = query.query.trim();
  const inGroup = query.chat_type === 'group' || query.chat_type === 'supergroup';
  if (inGroup && /^\d{1,5}$/.test(text) && Number(text) >= 1 && Number(text) <= MAX_BET) {
    await answer(query, [inlineOffer(from, Number(text), lang)]);
    return;
  }
  if (text && isPromoCode(text)) {
    await api.answerInlineQuery({
      inline_query_id: query.id,
      results: [],
      is_personal: true,
      cache_time: CACHE_SECONDS,
      button: {
        text: t(lang, 'commands.promo.inline.switch_button', { code: text }),
        start_parameter: promoStartParameter(text),
      },
    });
    return;
  }
  if (!inGroup) {
    await answer(query, [notice('not_group', t(lang, 'errors.not_group_chat'), t(lang, 'errors.not_group_chat'))]);
    return;
  }

  const placeholder = t(lang, query.chat_type === 'group' ? 'inline.results.text_legacy_group' : 'inline.results.text');
  const results = Object.entries(LAUNCHERS)
    .filter(([, launcher]) => commandEnabled(launcher.command) && (launcher.available?.() ?? true))
    .map(([key]) => ({
      type: 'article',
      id: key,
      title: t(lang, `inline.results.titles.${key}`),
      input_message_content: { message_text: placeholder, parse_mode: 'HTML' },
      reply_markup: keyboard([[button(t(lang, 'inline.results.button'), `${PREFIX}${from.id}:${key}`)]]),
    }));
  if (commandEnabled('pvp')) results.push(inlineOffer(from, config.pvp.defaultBet, lang));
  await answer(query, results);
}

export function parseLauncherData(data) {
  if (!data.startsWith(PREFIX)) return null;
  const [uid, command] = data.slice(PREFIX.length).split(':');
  return LAUNCHERS[command] ? { uid: Number(uid), command } : null;
}

export function runLauncher(env, command) {
  return LAUNCHERS[command].run(env);
}

async function answer(query, results, cacheTime = CACHE_SECONDS) {
  await api.answerInlineQuery({ inline_query_id: query.id, results, is_personal: true, cache_time: cacheTime });
}

function notice(id, title, text) {
  return { type: 'article', id, title, input_message_content: { message_text: text, parse_mode: 'HTML' } };
}
