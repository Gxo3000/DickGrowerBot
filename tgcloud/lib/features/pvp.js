import { config } from '../config.js';
import { t } from '../i18n.js';
import { escapeHtml, fullName, percentage } from '../html.js';
import { chance } from '../random.js';
import { clock } from '../time.js';
import { button, keyboard } from '../tg.js';
import { getDick, positionOf, settleBattle } from '../repo/dicks.js';
import { claimBattle, recordBattle, releaseBattle } from '../repo/battles.js';
import { getUser } from '../repo/users.js';
import { banNotice, withheldNote, withholdForLoan } from './common.js';

const PREFIX = 'pvp:';
const EPOCH_2024 = 1719014400000;

export async function startBattle({ chat, user, from, lang, bet }) {
  const banned = banNotice(user, lang);
  if (banned) return { text: banned };
  const dick = await getDick(user.uid, chat.id);
  if (!dick || dick.length < bet) {
    return { text: t(lang, 'commands.pvp.errors.not_enough.initiator') };
  }
  return offer(from, bet, lang);
}

// The offer as an inline article: Telegram sends it on behalf of the user, so nothing is checked
// until somebody accepts it.
export function inlineOffer(from, bet, lang) {
  const { text, keyboard: markup } = offer(from, bet, lang);
  return {
    type: 'article',
    id: `pvp:${bet}`,
    title: t(lang, 'inline.results.titles.pvp', { bet }),
    input_message_content: { message_text: text, parse_mode: 'HTML' },
    reply_markup: markup,
  };
}

export function parseBattleData(data) {
  if (!data.startsWith(PREFIX)) return null;
  const [initiator, bet, stamp] = data.slice(PREFIX.length).split(':');
  const parsed = { initiator: Number(initiator), bet: Number(bet), stamp: stamp ?? '' };
  return Number.isSafeInteger(parsed.initiator) && Number.isSafeInteger(parsed.bet) && parsed.bet >= 0 ? parsed : null;
}

// What pressing "Attack!" does. `null` text means the offer stays and only `alert` is shown.
export async function acceptBattle({ chat, user, from, lang, data }) {
  if (data.initiator === from.id) {
    return { alert: t(lang, 'commands.pvp.errors.same_person') };
  }
  const banned = banNotice(user, lang);
  if (banned) return { alert: banned };

  const acceptorMin = config.pvp.checkAcceptorLength ? data.bet : 0;
  const [initiatorDick, acceptorDick] = await Promise.all([
    getDick(data.initiator, chat.id),
    getDick(from.id, chat.id),
  ]);
  if (!acceptorDick || acceptorDick.length < acceptorMin) {
    return { alert: t(lang, 'commands.pvp.errors.not_enough.acceptor') };
  }
  if (!initiatorDick || initiatorDick.length < data.bet) {
    return { text: t(lang, 'commands.pvp.errors.not_enough.initiator') };
  }

  const claimKey = `${chat.id}:${data.initiator}:${data.bet}:${data.stamp}`;
  if (!(await claimBattle(claimKey))) {
    return { alert: t(lang, 'commands.pvp.errors.battle_already_in_progress') };
  }
  const [winner, loser] = chance(0.5) ? [from.id, data.initiator] : [data.initiator, from.id];
  const lengths = await settleBattle(chat.id, {
    winner, loser, initiator: data.initiator, acceptor: from.id, bet: data.bet, acceptorMin,
  });
  if (!lengths) {
    await releaseBattle(claimKey);
    return { text: t(lang, 'commands.pvp.errors.not_enough.initiator') };
  }

  const stats = await recordBattle(chat.id, winner, loser, data.bet);
  const { length: winnerLength, withheld } = await withholdForLoan(winner, chat.id, data.bet, lengths[winner]);
  const names = {
    [from.id]: fullName(from),
    [data.initiator]: (await getUser(data.initiator))?.name ?? '?',
  };

  const finish = t(lang, 'commands.pvp.results.finish', {
    winner_name: escapeHtml(names[winner]),
    winner_length: winnerLength,
    loser_length: lengths[loser],
    bet: data.bet,
  });
  const winnerPos = t(lang, 'commands.pvp.results.position.winner', {
    name: escapeHtml(names[winner]), pos: await positionOf(winner, chat.id),
  });
  const loserPos = t(lang, 'commands.pvp.results.position.loser', {
    name: escapeHtml(names[loser]), pos: await positionOf(loser, chat.id),
  });
  let text = `${finish}\n\n${winnerPos}\n${loserPos}${withheldNote(withheld, lang)}`;
  if (config.pvp.showStats) {
    text += `\n\n${statsPart(stats, lang)}`;
  }
  return { text };
}

function offer(from, bet, lang) {
  const stamp = (clock.now() - EPOCH_2024).toString(36);
  return {
    text: t(lang, 'commands.pvp.results.start', { name: escapeHtml(fullName(from)), bet }),
    keyboard: keyboard([[button(t(lang, 'commands.pvp.button'), `${PREFIX}${from.id}:${bet}:${stamp}`)]]),
  };
}

function statsPart({ winner, loser }, lang) {
  let text = t(lang, 'commands.pvp.results.stats.text', {
    winner_win_rate: percentage(winner.battles_won, winner.battles_total),
    loser_win_rate: percentage(loser.battles_won, loser.battles_total),
    winner_win_streak: winner.win_streak_current,
    winner_win_streak_max: winner.win_streak_max,
  });
  if (loser.prev_win_streak > 1) {
    text += `\n${t(lang, 'commands.pvp.results.stats.lost_win_streak', { lost_win_streak: loser.prev_win_streak })}`;
  }
  return text;
}
