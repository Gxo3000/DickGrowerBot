import { config } from '../config.js';
import { t } from '../i18n.js';
import { escapeHtml } from '../html.js';
import { pickOne, pickWeighted, randomInt } from '../random.js';
import { today } from '../time.js';
import { activeMembers, addLength, positionOf } from '../repo/dicks.js';
import { claimDay, winnerOf } from '../repo/dod.js';
import { computeIncrement, perksPartOfAnswer } from './increment.js';
import { banNotice, timeTillNextDay } from './common.js';
import { announcementFor } from './announcements.js';

export async function dickOfDay({ chat, user, lang }) {
  const banned = banNotice(user, lang);
  if (banned) return { text: banned };

  const day = today();
  const chosen = await winnerOf(chat.id, day);
  let text;
  if (chosen) {
    text = t(lang, 'commands.dod.already_chosen', { name: escapeHtml(chosen.name) });
  } else {
    const candidates = await activeMembers(chat.id, config.inactivityDays);
    const winner = candidates.length > 0 ? choose(candidates) : null;
    if (!winner) {
      text = t(lang, 'commands.dod.no_candidates');
    } else if (!(await claimDay(chat.id, day, winner.uid))) {
      const actual = await winnerOf(chat.id, day);
      text = t(lang, 'commands.dod.already_chosen', { name: escapeHtml(actual?.name ?? winner.name) });
    } else {
      text = await award(chat, winner, lang);
    }
  }
  const announcement = await announcementFor(chat.id, lang);
  return { text: `${text}${timeTillNextDay(lang)}${announcement ? `\n\n<i>${announcement}</i>` : ''}` };
}

async function award(chat, winner, lang) {
  const { bonusMin, bonusMax } = config.dod;
  const increment = await computeIncrement({
    uid: winner.uid,
    chatId: chat.id,
    length: winner.length,
    source: 'dod',
    lang,
    roll: () => randomInt(bonusMin, bonusMax),
  });
  const length = await addLength(winner.uid, chat.id, increment.total);
  if (length === null) {
    return t(lang, 'commands.dod.no_candidates');
  }
  await increment.commit();
  const result = t(lang, 'commands.dod.result', {
    uid: winner.uid,
    name: escapeHtml(winner.name),
    growth: increment.total,
    length,
  });
  const position = t(lang, 'commands.dod.position', { pos: await positionOf(winner.uid, chat.id) });
  return `${result}\n${position}${perksPartOfAnswer(increment, lang)}`;
}

function choose(candidates) {
  const { selection, richExclusionRatio } = config.dod;
  if (selection === 'weights') {
    const mean = candidates.reduce((sum, c) => sum + c.length, 0) / candidates.length;
    const deviation = Math.sqrt(candidates.reduce((sum, c) => sum + (c.length - mean) ** 2, 0) / candidates.length);
    return pickWeighted(candidates, (c) => 1 / (1 + Math.exp(deviation > 0 ? (c.length - mean) / deviation : 0)));
  }
  if (selection === 'exclusion' && candidates.length > 1) {
    const sorted = [...candidates].sort((a, b) => a.length - b.length);
    const kept = sorted.filter((_, i) => i / (sorted.length - 1) <= 1 - richExclusionRatio);
    return pickOne(kept.length > 0 ? kept : sorted);
  }
  return pickOne(candidates);
}
