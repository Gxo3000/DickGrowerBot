import { config } from '../config.js';
import { list, t } from '../i18n.js';
import { escapeHtml, fullName } from '../html.js';
import { chance, pickOne, randomInt } from '../random.js';
import { button, keyboard } from '../tg.js';
import { today } from '../time.js';
import { addLength, getDick, grantBonusAttempt } from '../repo/dicks.js';
import { adventureDay, claimAdventure, recordProgress } from '../repo/pve.js';
import { award, banNotice, timeTillNextDay, withheldNote } from './common.js';

const PREFIX = 'adv:';
const DIFFICULTIES = ['easy', 'medium', 'hard'];

export async function adventureMenu({ chat, user, from, lang }) {
  const banned = banNotice(user, lang);
  if (banned) return { text: banned };
  if ((await adventureDay(user.uid, chat.id)) >= today()) {
    return { text: `${t(lang, 'commands.adventure.already')}${timeTillNextDay(lang)}` };
  }
  const params = { name: escapeHtml(fullName(from)) };
  for (const difficulty of DIFFICULTIES) {
    const d = config.adventure.difficulties[difficulty];
    params[`${difficulty}_chance`] = `${Math.round(d.winChance * 100)}%`;
    params[`${difficulty}_reward`] = `${d.rewardMin}–${d.rewardMax}`;
    params[`${difficulty}_penalty`] = `${d.penaltyMin}–${d.penaltyMax}`;
  }
  return {
    text: t(lang, 'commands.adventure.choose', params),
    keyboard: keyboard([DIFFICULTIES.map((difficulty) => button(
      t(lang, `commands.adventure.buttons.${difficulty}`), `${PREFIX}${user.uid}:${difficulty}`))]),
  };
}

export function parseAdventureData(data) {
  if (!data.startsWith(PREFIX)) return null;
  const [uid, difficulty] = data.slice(PREFIX.length).split(':');
  return DIFFICULTIES.includes(difficulty) ? { uid: Number(uid), difficulty } : null;
}

// The adventure itself, once a day per chat. Returns what the message becomes, or an alert.
export async function goOnAdventure({ chat, user, from, lang, difficulty }) {
  const banned = banNotice(user, lang);
  if (banned) return { alert: banned };
  if (!(await getDick(user.uid, chat.id))) {
    return { alert: t(lang, 'commands.adventure.no_dick') };
  }
  if (!(await claimAdventure(user.uid, chat.id, today()))) {
    return { text: `${t(lang, 'commands.adventure.already')}${timeTillNextDay(lang)}` };
  }

  const settings = config.adventure.difficulties[difficulty];
  const params = {
    name: escapeHtml(fullName(from)),
    difficulty: t(lang, `commands.adventure.difficulty.${difficulty}`),
    monster: pickOne(list(lang, `commands.adventure.monsters.${difficulty}`)) ?? '?',
  };
  if (!chance(settings.winChance)) {
    const penalty = randomInt(settings.penaltyMin, settings.penaltyMax);
    const length = await addLength(user.uid, chat.id, -penalty);
    return { text: t(lang, 'commands.adventure.lost', { ...params, penalty, length }) };
  }

  const reward = randomInt(settings.rewardMin, settings.rewardMax);
  const { length, withheld } = await award(user.uid, chat.id, reward);
  await recordProgress(user.uid, chat.id, { won: 1, earned: reward });
  let text = t(lang, 'commands.adventure.won', { ...params, reward, length });
  if (difficulty === 'hard' && chance(config.adventure.bonusAttemptChance)) {
    await grantBonusAttempt(user.uid, chat.id);
    text += `\n\n${t(lang, 'commands.adventure.bonus_attempt')}`;
  }
  return { text: `${text}${withheldNote(withheld, lang)}` };
}
