import { db } from 'sdk';
import { sql } from 'sdk/db';
import { nowSec } from '../time.js';

export async function getActiveLoan(uid, chatId) {
  return db.get(sql`
    SELECT id, debt, payout_ratio FROM loans WHERE uid = ${uid} AND chat_id = ${chatId} AND repaid_at IS NULL`);
}

// Adds `debt` to the player's active loan, opening one if there is none.
export async function openOrExtendLoan(uid, chatId, debt, payoutRatio) {
  await db.run(sql`
    INSERT INTO loans (uid, chat_id, debt, payout_ratio, created_at)
    VALUES (${uid}, ${chatId}, ${debt}, ${payoutRatio}, ${nowSec()})
    ON CONFLICT (uid, chat_id) WHERE repaid_at IS NULL DO UPDATE SET
      debt = loans.debt + excluded.debt,
      payout_ratio = excluded.payout_ratio`);
}

// Pays `payout` off the loan; the loan that reaches zero is repaid. Returns the debt left.
export async function payLoan(loanId, payout) {
  const result = await db.run(sql`
    UPDATE loans SET
      debt = max(debt - ${payout}, 0),
      repaid_at = CASE WHEN debt - ${payout} <= 0 THEN ${nowSec()} ELSE NULL END
    WHERE id = ${loanId} AND repaid_at IS NULL
    RETURNING debt`);
  return result.rows[0]?.debt ?? null;
}
