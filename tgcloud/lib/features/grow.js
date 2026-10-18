import { config } from '../config.js';
import { t } from '../i18n.js';
import { DAY_SECONDS, dayOf, nowSec, today } from '../time.js';
import { commitGrowth, getDick, positionOf } from '../repo/dicks.js';
import { baseIncrement, computeIncrement, perksPartOfAnswer } from './increment.js';
import { banNotice, timeTillNextDay } from './common.js';

export async function grow({ chat, user, lang }) {
  const banned = banNotice(user, lang);
  if (banned) return { text: banned };

  const dick = await getDick(user.uid, chat.id);
  if (dick && dayOf(dick.grown_at) >= today() && dick.bonus_attempts <= 0) {
    return { text: tomorrow(lang) };
  }

  const daysSinceRegistration = Math.floor((nowSec() - user.created_at) / DAY_SECONDS);
  const { min, max, growShrinkRatio, newcomersGraceDays } = config.growth;
  const positiveRatio = daysSinceRegistration > newcomersGraceDays ? growShrinkRatio : 1;
  const increment = await computeIncrement({
    uid: user.uid,
    chatId: chat.id,
    length: dick?.length ?? 0,
    source: 'growth',
    lang,
    roll: () => baseIncrement(min, max, positiveRatio),
  });

  const length = await commitGrowth(user.uid, chat.id, increment.total);
  if (length === null) {
    return { text: tomorrow(lang) };
  }
  await increment.commit();

  const direction = t(lang, `commands.grow.direction.${increment.total < 0 ? 'shrunk' : 'grown'}`);
  const result = t(lang, 'commands.grow.result', { event: direction, incr: Math.abs(increment.total), length });
  const position = t(lang, 'commands.grow.position', { pos: await positionOf(user.uid, chat.id) });
  return { text: `${result}\n${position}${perksPartOfAnswer(increment, lang)}${timeTillNextDay(lang)}` };
}

function tomorrow(lang) {
  return `${t(lang, 'commands.grow.tomorrow')}${timeTillNextDay(lang)}`;
}
