import { config } from '../config.js';
import { t } from '../i18n.js';
import { floatPercentage } from '../html.js';
import { button, keyboard } from '../tg.js';
import { compareAndSetLength, getDick } from '../repo/dicks.js';
import { getActiveLoan, openOrExtendLoan } from '../repo/loans.js';
import { banNotice } from './common.js';

const PREFIX = 'loan:';

export async function loan({ chat, user, lang }) {
  const banned = banNotice(user, lang);
  if (banned) return { text: banned };

  const active = await getActiveLoan(user.uid, chat.id);
  if (active && !config.loan.multipleLoans) {
    return { text: t(lang, 'commands.loan.debt', { debt: active.debt }) };
  }
  const ratio = config.loan.payoutRatio;
  if (!(ratio > 0 && ratio < 1)) {
    return { text: t(lang, 'errors.feature_disabled') };
  }
  const dick = await getDick(user.uid, chat.id);
  if (!dick || dick.length >= 0) {
    return { text: t(lang, 'commands.loan.errors.positive_length') };
  }
  const debt = -dick.length;
  const permille = Math.round(ratio * 1000);
  return {
    text: t(lang, 'commands.loan.confirmation.text', { debt, payout_percentage: floatPercentage(ratio) }),
    keyboard: keyboard([[
      button(t(lang, 'commands.loan.confirmation.buttons.agree'), `${PREFIX}${user.uid}:y:${permille}`),
      button(t(lang, 'commands.loan.confirmation.buttons.disagree'), `${PREFIX}${user.uid}:n`),
    ]]),
  };
}

export function parseLoanData(data) {
  if (!data.startsWith(PREFIX)) return null;
  const [uid, action, permille] = data.slice(PREFIX.length).split(':');
  return { uid: Number(uid), agreed: action === 'y', permille: Number(permille) };
}

// What a press of the confirmation buttons turns the message into; `null` means it is deleted.
export async function answerLoan({ chat, lang, data }) {
  if (!data.agreed) {
    return { text: t(lang, 'commands.loan.callback.refused'), deletable: true };
  }
  const ratio = config.loan.payoutRatio;
  if (!(ratio > 0 && ratio < 1)) {
    return { text: t(lang, 'errors.feature_disabled') };
  }
  if (data.permille !== Math.round(ratio * 1000)) {
    return { text: t(lang, 'commands.loan.callback.payout_ratio_changed') };
  }
  return { text: await borrow(data.uid, chat.id, ratio, lang) };
}

// Resets a negative length to zero and puts its depth on the loan. The reset is a compare-and-set,
// so two presses of the same button can't borrow twice.
async function borrow(uid, chatId, ratio, lang) {
  const active = config.loan.multipleLoans ? null : await getActiveLoan(uid, chatId);
  if (active) {
    return t(lang, 'commands.loan.debt', { debt: active.debt });
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    const dick = await getDick(uid, chatId);
    if (!dick || dick.length >= 0) {
      return t(lang, 'commands.loan.errors.positive_length');
    }
    if (await compareAndSetLength(uid, chatId, dick.length, 0)) {
      await openOrExtendLoan(uid, chatId, -dick.length, ratio);
      return t(lang, 'commands.loan.callback.success');
    }
  }
  return t(lang, 'commands.loan.errors.positive_length');
}
