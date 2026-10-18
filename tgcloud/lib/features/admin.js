import { config } from '../config.js';
import { LANGUAGES, t } from '../i18n.js';
import { escapeHtml } from '../html.js';
import { DAY_SECONDS, formatDate, formatDay, nowSec } from '../time.js';
import { ban, unban } from '../repo/users.js';
import { createCode, listCodes } from '../repo/promo.js';
import { isPromoCode } from './promo.js';
import { syncCommands } from '../commands.js';

export const ADMIN_COMMANDS = ['admin', 'ban', 'unban', 'promo_add', 'promo_list', 'sync_commands'];

export function isAdmin(uid) {
  return config.admins.includes(uid);
}

export async function adminCommand(name, args, lang) {
  const parts = args.split(/\s+/).filter(Boolean);
  switch (name) {
    case 'ban': {
      const [uid, days] = parts.map(Number);
      if (!Number.isSafeInteger(uid) || !(days > 0)) return t(lang, 'commands.admin.invalid');
      const until = nowSec() + Math.round(days * DAY_SECONDS);
      await ban(uid, until);
      return t(lang, 'commands.admin.banned', { uid, date: formatDate(until) });
    }
    case 'unban': {
      const uid = Number(parts[0]);
      if (!Number.isSafeInteger(uid)) return t(lang, 'commands.admin.invalid');
      await unban(uid);
      return t(lang, 'commands.admin.unbanned', { uid });
    }
    case 'promo_add': {
      const [code, bonus, capacity, days] = parts;
      const numbers = [Number(bonus), Number(capacity), days === undefined ? 0 : Number(days)];
      if (!isPromoCode(code ?? '') || !numbers.every(Number.isInteger) || numbers[1] < 1 || numbers[2] < 0) {
        return t(lang, 'commands.admin.invalid');
      }
      if (!(await createCode({ code, bonus: numbers[0], capacity: numbers[1], days: numbers[2] }))) {
        return t(lang, 'commands.admin.promo_exists', { code: escapeHtml(code) });
      }
      const created = (await listCodes()).find((row) => row.code === code);
      return t(lang, 'commands.admin.promo_added', describe(created, lang));
    }
    case 'promo_list': {
      const codes = await listCodes();
      if (codes.length === 0) return t(lang, 'commands.admin.promo_none');
      return codes.map((row) => t(lang, 'commands.admin.promo_line', describe(row, lang))).join('\n');
    }
    case 'sync_commands': {
      const count = await syncCommands(LANGUAGES);
      return t(lang, 'commands.admin.commands_synced', { count });
    }
    default:
      return t(lang, 'commands.admin.usage');
  }
}

function describe(row, lang) {
  return {
    code: escapeHtml(row.code),
    bonus: row.bonus_length,
    capacity: row.capacity,
    since: formatDay(row.since_day),
    until: row.until_day === null ? t(lang, 'commands.admin.forever') : formatDay(row.until_day),
  };
}
