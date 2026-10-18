import { config } from '../config.js';
import { daysWordRu, t } from '../i18n.js';
import { chance, randomInt } from '../random.js';
import { signed } from '../html.js';
import { today } from '../time.js';
import { readPerkStates, writePerkState } from '../repo/perks.js';
import { getActiveLoan, payLoan } from '../repo/loans.js';

const MAX_REROLLS = 10;

export const STREAK = 'streak';

// A perk changes a length change. `apply` is pure: it says what the change should become and what
// has to be written once the change is committed — never before, so a refused growth leaves no
// trace of its perks.
const PERKS = [
  {
    name: 'help-pussies',
    enabled: () => config.perks.helpPussiesRatio > 0,
    apply({ length }) {
      if (length >= 0) return null;
      return { change: Math.round(Math.abs(length) * config.perks.helpPussiesRatio) };
    },
  },
  {
    name: 'loan-payout',
    enabled: () => true,
    apply({ base, loan }) {
      if (!loan || base <= 0) return null;
      const payout = Math.min(Math.round(base * loan.payout_ratio), loan.debt);
      if (payout <= 0) return null;
      return { change: -payout, commit: () => payLoan(loan.id, payout) };
    },
  },
  {
    name: STREAK,
    enabled: () => config.perks.streakGrades.length > 0,
    apply({ source, states, day, lang }) {
      if (source !== 'growth') return null;
      const previous = parseStreak(states[STREAK]);
      let streak = 1;
      if (previous?.last_grow === day) streak = previous.streak;
      else if (previous?.last_grow === day - 1) streak = previous.streak + 1;
      const state = { streak, max: Math.max(previous?.max ?? 0, streak), last_grow: day };
      const bonus = gradesReached(streak);
      const next = nextGrade(streak);
      let note = t(lang, 'titles.perks.streak.note', { days: streak, word_days: daysWordRu(streak) });
      if (next !== null) {
        note += `; ${t(lang, 'titles.perks.streak.next_grade', { next_bonus: bonus + 1, next_day: next })}`;
      }
      return { change: bonus, note, state };
    },
  },
];

// The change of a growth or of a Dick of the Day award, with what the perks made of it. The base
// is rolled again for as long as the perks cancel it out. `commit` writes what the perks owe and
// must be called only once the change itself is written.
export async function computeIncrement({ uid, chatId, length, source, lang, roll }) {
  const perks = PERKS.filter((perk) => perk.enabled());
  const states = perks.length > 0 ? await readPerkStates(uid, chatId) : {};
  const loan = await getActiveLoan(uid, chatId);
  const day = today();
  for (let attempt = 0; attempt < MAX_REROLLS; attempt++) {
    const base = roll();
    const effects = [];
    let total = base;
    for (const perk of perks) {
      const outcome = perk.apply({ base, length, loan, source, states, day, lang });
      if (!outcome) continue;
      effects.push({ name: perk.name, ...outcome });
      total += outcome.change;
    }
    if (total !== 0) {
      return {
        base,
        total,
        effects,
        commit: async () => {
          for (const effect of effects) {
            if (effect.state) await writePerkState(uid, chatId, effect.name, effect.state);
            if (effect.commit) await effect.commit();
          }
        },
      };
    }
  }
  const base = roll();
  return { base, total: base, effects: [], commit: async () => {} };
}

export function perksPartOfAnswer(increment, lang) {
  const visible = increment.effects.filter((effect) => effect.change !== 0);
  if (increment.base === increment.total || visible.length === 0) return '';
  const lines = visible.map((effect) => {
    const name = t(lang, `titles.perks.${effect.name}.name`);
    const value = signed(effect.change);
    return effect.note ? `— ${name} (${value}, ${effect.note})` : `— ${name} (${value})`;
  });
  return `\n\n${t(lang, 'titles.perks.top_line')}:\n${lines.join('\n')}`;
}

// A roll of the base: never zero when the range spans it, positive with `positiveRatio`.
export function baseIncrement(min, max, positiveRatio) {
  if (min > 0) return randomInt(min, max);
  if (max < 0) return randomInt(min, max);
  return chance(positiveRatio) ? randomInt(1, Math.max(1, max)) : randomInt(Math.min(-1, min), -1);
}

export function streakLine(states, lang) {
  if (config.perks.streakGrades.length === 0) return null;
  const state = parseStreak(states[STREAK]);
  if (!state) return null;
  return t(lang, 'commands.stats.streak', { current: state.streak, max: state.max });
}

function gradesReached(streak) {
  return config.perks.streakGrades.filter((day) => day <= streak).length;
}

function nextGrade(streak) {
  return config.perks.streakGrades.find((day) => day > streak) ?? null;
}

function parseStreak(state) {
  if (!state || !Number.isInteger(state.streak) || !Number.isInteger(state.last_grow)) return null;
  return { streak: state.streak, max: Number.isInteger(state.max) ? state.max : state.streak, last_grow: state.last_grow };
}
