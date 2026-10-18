import { t } from '../i18n.js';
import { formatDate, secondsTillNextDay, splitDuration } from '../time.js';
import { addLength } from '../repo/dicks.js';
import { getActiveLoan, payLoan } from '../repo/loans.js';
import { isBanned } from '../repo/users.js';

export function timeTillNextDay(lang) {
  const { hours, minutes } = splitDuration(secondsTillNextDay());
  return t(lang, 'titles.time_till_next_day.some', { hours, minutes });
}

// The notice for a banned player, or null for anybody else.
export function banNotice(user, lang) {
  return isBanned(user) ? t(lang, 'errors.banned', { date: formatDate(user.banned_until) }) : null;
}

// Credits a prize. Returns the new length (null when the player has no dick in the chat) and what
// the active loan took of it.
export async function award(uid, chatId, prize) {
  const length = await addLength(uid, chatId, prize);
  if (length === null) return { length: null, withheld: 0 };
  return withholdForLoan(uid, chatId, prize, length);
}

// The active loan takes its share of a prize that is already credited, as it does of every growth.
export async function withholdForLoan(uid, chatId, prize, length) {
  const loan = prize > 0 ? await getActiveLoan(uid, chatId) : null;
  const withheld = loan ? Math.min(Math.round(prize * loan.payout_ratio), loan.debt) : 0;
  if (withheld <= 0) return { length, withheld: 0 };
  const newLength = await addLength(uid, chatId, -withheld);
  await payLoan(loan.id, withheld);
  return { length: newLength ?? length, withheld };
}

export function withheldNote(withheld, lang) {
  return withheld > 0 ? `\n\n${t(lang, 'commands.pvp.results.withheld', { payout: withheld })}` : '';
}
