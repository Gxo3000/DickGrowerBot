import { config } from '../config.js';
import { daysWordRu, t } from '../i18n.js';
import { escapeHtml } from '../html.js';
import { button, keyboard } from '../tg.js';
import { DAY_SECONDS, dayOf, nowSec, today } from '../time.js';
import { getTop } from '../repo/dicks.js';

export const TOP_PAGE_PREFIX = 'top:page:';

export async function top({ chat, from, lang, page = 0 }) {
  const { limit, pagination, hideInactiveZero } = config.top;
  const rows = await getTop(chat.id, {
    offset: page * limit,
    limit: limit + 1,
    hideInactiveZero,
    inactivityDays: config.inactivityDays,
  });
  if (rows.length === 0) {
    return { text: t(lang, 'commands.top.empty') };
  }

  const hasMore = rows.length > limit;
  const now = nowSec();
  let anyInactive = false;
  const lines = rows.slice(0, limit).map((row) => {
    const name = row.uid === from.id ? `<u>${escapeHtml(row.name)}</u>` : escapeHtml(row.name);
    let line = t(lang, 'commands.top.line', { n: row.position, name, length: row.length });
    if (now - row.grown_at > config.inactivityDays * DAY_SECONDS) {
      anyInactive = true;
      line += ' [~]';
    } else if (dayOf(row.grown_at) < today()) {
      line += ' [+]';
    }
    return line;
  });

  let text = `${t(lang, 'commands.top.title')}\n\n${lines.join('\n')}\n\n${t(lang, 'commands.top.ending')}`;
  if (anyInactive) {
    const days = config.inactivityDays;
    text += `\n${t(lang, 'commands.top.ending_inactive', { days, word_days: daysWordRu(days) })}`;
  }
  return { text, keyboard: pagination ? paginationKeyboard(page, hasMore) : undefined };
}

export function parseTopPage(data) {
  if (!data.startsWith(TOP_PAGE_PREFIX)) return null;
  const page = Number.parseInt(data.slice(TOP_PAGE_PREFIX.length), 10);
  return Number.isInteger(page) && page >= 0 ? page : null;
}

function paginationKeyboard(page, hasMore) {
  const buttons = [];
  if (page > 0) buttons.push(button('⬅️', `${TOP_PAGE_PREFIX}${page - 1}`));
  if (hasMore) buttons.push(button('➡️', `${TOP_PAGE_PREFIX}${page + 1}`));
  return keyboard([buttons]);
}
