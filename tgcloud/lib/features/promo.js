import { t } from '../i18n.js';
import { button, keyboard } from '../tg.js';
import { today } from '../time.js';
import { countDicksOfUser, growAllOfUser } from '../repo/dicks.js';
import {
  findCode, recordActivation, returnCapacity, setAffectedChats, takeCapacity, wasActivated,
} from '../repo/promo.js';
import { base64UrlDecode, base64UrlEncode } from '../base64.js';

export const PROMO_START_PREFIX = 'promo-';
const PREFIX = 'promo:';
const CONFIRMATION_THRESHOLD = -100;
const FORMAT = /^[a-zA-Zа-яА-ЯёЁ0-9_-]{3,16}$/;

export function isPromoCode(text) {
  return FORMAT.test(text);
}

export function promoStartParameter(code) {
  return `${PROMO_START_PREFIX}${base64UrlEncode(code)}`;
}

export function codeFromStartParameter(parameter) {
  if (!parameter?.startsWith(PROMO_START_PREFIX)) return null;
  try {
    return base64UrlDecode(parameter.slice(PROMO_START_PREFIX.length));
  } catch {
    return null;
  }
}

// An attempt to activate a code a user typed. A code that would take away a lot is confirmed first.
export async function activateOrConfirm(uid, code, lang) {
  if (!isPromoCode(code)) {
    return { text: t(lang, 'commands.promo.errors.invalid_format') };
  }
  const found = await findCode(code);
  if (found && found.bonus_length < CONFIRMATION_THRESHOLD && checkWindow(found) === null
      && found.capacity > 0 && !(await wasActivated(uid, found.code))) {
    const chats = await countDicksOfUser(uid);
    if (chats > 0) {
      return {
        text: t(lang, 'commands.promo.confirmation.text', { length: Math.abs(found.bonus_length), chats }),
        keyboard: keyboard([[
          button(t(lang, 'commands.promo.confirmation.buttons.confirm'), `${PREFIX}confirm:${found.code}`),
          button(t(lang, 'commands.promo.confirmation.buttons.cancel'), `${PREFIX}cancel`),
        ]]),
      };
    }
  }
  return { text: await activate(uid, code, lang) };
}

export function parsePromoData(data) {
  if (data === `${PREFIX}cancel`) return { confirmed: false };
  if (data.startsWith(`${PREFIX}confirm:`)) return { confirmed: true, code: data.slice(`${PREFIX}confirm:`.length) };
  return null;
}

export async function answerConfirmation(uid, data, lang) {
  if (!data.confirmed) return t(lang, 'commands.promo.confirmation.cancelled');
  return activate(uid, data.code, lang);
}

async function activate(uid, code, lang) {
  const found = await findCode(code);
  if (!found) return error('not_found', lang);
  const windowError = checkWindow(found);
  if (windowError) return error(windowError, lang);
  if (await wasActivated(uid, found.code)) return error('already_activated', lang);
  if ((await countDicksOfUser(uid)) === 0) return error('no_dicks', lang);
  if (!(await takeCapacity(found.code))) return error('exhausted', lang);
  if (!(await recordActivation(uid, found.code, 0))) {
    await returnCapacity(found.code);
    return error('already_activated', lang);
  }
  const affected = await growAllOfUser(uid, found.bonus_length);
  await setAffectedChats(uid, found.code, affected);

  const direction = found.bonus_length < 0 ? 'shrunk' : 'grown';
  const plurality = affected > 1 ? 'plural' : 'singular';
  const ending = t(lang, `commands.promo.success.${direction}.${plurality}`, {
    growth: Math.abs(found.bonus_length),
    affected_chats: affected,
    word_chats: affected === 1 ? 'чате' : 'чатах',
  });
  return t(lang, 'commands.promo.success.template', { ending });
}

function checkWindow(found) {
  const day = today();
  if (day < found.since_day) return 'not_started';
  if (found.until_day !== null && day > found.until_day) return 'expired';
  return null;
}

function error(key, lang) {
  return t(lang, `commands.promo.errors.${key}`);
}
