import { config } from '../config.js';
import { daysWordRu, t } from '../i18n.js';
import { escapeHtml } from '../html.js';
import { DAY_SECONDS, nowSec } from '../time.js';
import { applyShrinks, recentShrinks, staleDicks } from '../repo/shrinks.js';

const MAX_LINES = 30;

export function shrinkEnabled() {
  return config.shrink.ratio > 0 && config.shrink.inactivityDays > 0;
}

// The day's shrink of the chat's neglected dicks. Returns the summary to post, or null.
export async function shrinkChat(chatId, day, lang) {
  if (!shrinkEnabled()) return null;
  const { ratio, inactivityDays, rampUpDays } = config.shrink;
  const now = nowSec();
  const victims = (await staleDicks(chatId, inactivityDays)).map((dick) => {
    const staleDays = Math.floor((now - dick.grown_at) / DAY_SECONDS);
    const ramp = Math.min(1, (staleDays - inactivityDays + 1) / Math.max(rampUpDays, 1));
    const loss = Math.min(dick.length, Math.max(1, Math.ceil(dick.length * ratio * ramp)));
    return { ...dick, loss };
  });
  if (victims.length === 0) return null;
  const shrunk = await applyShrinks(chatId, victims, day);
  if (shrunk.length === 0) return null;

  shrunk.sort((a, b) => b.loss - a.loss);
  const lines = shrunk.slice(0, MAX_LINES).map((v) => t(lang, 'commands.shrink.notification.line', {
    name: escapeHtml(v.name), lost: v.loss, length: v.length,
  }));
  if (shrunk.length > MAX_LINES) lines.push('…');
  const header = t(lang, 'commands.shrink.notification.header', {
    days: inactivityDays, word_days: daysWordRu(inactivityDays),
  });
  return `${header}\n${lines.join('\n')}`;
}

export async function recent({ chat, lang }) {
  const rows = await recentShrinks(chat.id, MAX_LINES);
  if (rows.length === 0) return { text: t(lang, 'commands.shrink.empty') };
  const lines = rows.map((row) => t(lang, 'commands.shrink.recent.line', {
    name: escapeHtml(row.name), lost: row.lost_length,
  }));
  return { text: `${t(lang, 'commands.shrink.recent.header')}\n${lines.join('\n')}` };
}
