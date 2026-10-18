import { config } from '../config.js';
import { t } from '../i18n.js';
import { escapeHtml, fullName } from '../html.js';
import { chance, randomInt } from '../random.js';
import { button, keyboard } from '../tg.js';
import { DAY_SECONDS, dayOf, nowSec, secondsTillNextDay, splitDuration, today } from '../time.js';
import { activeMembers, addLength, getDick } from '../repo/dicks.js';
import {
  aliveBoss, claimHit, claimKill, damageBoss, escapeBoss, getBoss, lastBoss, raiders, recordDamage, spawnBoss,
} from '../repo/bosses.js';
import { recordProgress } from '../repo/pve.js';
import { award, banNotice } from './common.js';

export const BOSS_KINDS = ['shrinker', 'frost', 'vacuum', 'crab', 'cucumber'];

const PREFIX = 'boss:';
const BAR_SEGMENTS = 10;
const RAIDERS_SHOWN = 5;
const REWARD_LINES = 30;

export async function bossStatus({ chat, lang }) {
  const boss = await currentBoss(chat.id);
  if (!boss) {
    const { hours, minutes } = splitDuration(secondsTillNextDay());
    return { text: t(lang, 'commands.boss.resting', { hours, minutes }) };
  }
  return render(boss, lang);
}

export function parseBossData(data) {
  if (!data.startsWith(PREFIX)) return null;
  const [action, id] = data.slice(PREFIX.length).split(':');
  const bossId = Number(id);
  return (action === 'hit' || action === 'show') && Number.isSafeInteger(bossId) ? { action, bossId } : null;
}

// A hit of the button. Returns the notice for the press, and what the message becomes.
export async function hitBoss({ chat, user, from, lang, bossId }) {
  const banned = banNotice(user, lang);
  if (banned) return { alert: banned };

  const boss = await getBoss(bossId);
  if (!boss || boss.chat_id !== chat.id || boss.status !== 'alive') {
    return { toast: t(lang, 'commands.boss.gone'), ...(await bossStatus({ chat, lang })) };
  }
  if (isExpired(boss)) {
    await escapeBoss(boss.id);
    return { toast: t(lang, 'commands.boss.gone'), ...(await bossStatus({ chat, lang })) };
  }
  const dick = await getDick(user.uid, chat.id);
  if (!dick) {
    return { alert: t(lang, 'commands.boss.no_dick') };
  }
  const { hitCooldownMinutes, damageMin, damageMax, critChance } = config.boss;
  const wait = await claimHit(boss.id, user.uid, hitCooldownMinutes * 60);
  if (wait !== null) {
    return { alert: t(lang, 'commands.boss.cooldown', { minutes: Math.ceil(wait / 60) }) };
  }

  const crit = chance(critChance);
  const damage = (randomInt(damageMin, damageMax) + Math.floor(Math.sqrt(Math.max(dick.length, 0)))) * (crit ? 2 : 1);
  const hp = await damageBoss(boss.id, damage);
  if (hp === null) {
    return { toast: t(lang, 'commands.boss.gone'), ...(await bossStatus({ chat, lang })) };
  }
  await recordDamage(boss.id, user.uid, damage);
  await recordProgress(user.uid, chat.id, { damage });

  const name = escapeHtml(fullName(from));
  const events = [];
  if (crit) events.push(t(lang, 'commands.boss.crit'));
  events.push(t(lang, 'commands.boss.hit', { name, damage }));

  if (hp === 0 && (await claimKill(boss.id, user.uid))) {
    return { toast: events.join(' ').replace(/<[^>]+>/g, ''), text: await defeat(chat.id, boss, user.uid, name, lang) };
  }
  if (chance(config.boss.counterattackChance)) {
    const lost = randomInt(config.boss.counterattackMin, config.boss.counterattackMax);
    await addLength(user.uid, chat.id, -lost);
    events.push(t(lang, 'commands.boss.counter', { name, lost }));
  }
  const view = await render({ ...boss, hp }, lang);
  return { toast: events.join(' ').replace(/<[^>]+>/g, ''), text: `${view.text}\n\n${events.join('\n')}`, keyboard: view.keyboard };
}

// Lets a boss that outlived its time escape. Returns the announcement, or null.
export async function escapeExpiredBoss(chatId, lang) {
  const boss = await aliveBoss(chatId);
  if (!boss || !isExpired(boss) || !(await escapeBoss(boss.id))) return null;
  return t(lang, 'commands.boss.escaped', { boss: kindName(boss, lang), level: boss.level });
}

// The live boss of the chat, a new one if it is due, or null while the chat rests after a kill.
async function currentBoss(chatId) {
  const alive = await aliveBoss(chatId);
  if (alive && !isExpired(alive)) return alive;
  if (alive) await escapeBoss(alive.id);

  const last = await lastBoss(chatId);
  if (last?.status === 'defeated' && dayOf(last.finished_at) >= today()) return null;
  const level = !last ? 1 : last.status === 'defeated' ? last.level + 1 : Math.max(1, last.level - 1);
  const { baseHp, hpGrowth, playersPerHpStep } = config.boss;
  const players = (await activeMembers(chatId, config.inactivityDays)).length;
  const hp = Math.round(baseHp * hpGrowth ** (level - 1) * Math.max(1, Math.ceil(players / playersPerHpStep)));
  return spawnBoss(chatId, { level, kind: BOSS_KINDS[(level - 1) % BOSS_KINDS.length], hp });
}

async function defeat(chatId, boss, killerUid, killerName, lang) {
  const { rewardBase, rewardPerLevel, lastHitBonus } = config.boss;
  const pot = rewardBase + rewardPerLevel * boss.level;
  const all = await raiders(boss.id);
  const totalDamage = all.reduce((sum, row) => sum + row.damage, 0);
  const lines = [];
  for (const raider of all) {
    const share = Math.max(1, Math.round((pot * raider.damage) / totalDamage));
    const reward = share + (raider.uid === killerUid ? lastHitBonus : 0);
    await award(raider.uid, chatId, reward);
    await recordProgress(raider.uid, chatId, { earned: reward, kills: raider.uid === killerUid ? 1 : 0 });
    lines.push(t(lang, 'commands.boss.reward_line', { name: escapeHtml(raider.name), reward, damage: raider.damage }));
  }
  const shown = lines.length > REWARD_LINES ? [...lines.slice(0, REWARD_LINES), '…'] : lines;
  return t(lang, 'commands.boss.defeated', {
    boss: kindName(boss, lang), level: boss.level, killer: killerName, rewards: shown.join('\n'),
  });
}

async function render(boss, lang) {
  const { rewardBase, rewardPerLevel, lastHitBonus, hitCooldownMinutes } = config.boss;
  const { hours, minutes } = splitDuration(escapesAt(boss) - nowSec());
  let text = t(lang, 'commands.boss.status', {
    boss: kindName(boss, lang),
    level: boss.level,
    bar: hpBar(boss.hp, boss.max_hp),
    hp: boss.hp,
    max_hp: boss.max_hp,
    reward: rewardBase + rewardPerLevel * boss.level,
    last_hit: lastHitBonus,
    cooldown: hitCooldownMinutes,
    hours,
    minutes,
  });
  const top = (await raiders(boss.id)).slice(0, RAIDERS_SHOWN);
  if (top.length > 0) {
    const lines = top.map((row, i) => t(lang, 'commands.boss.raider_line', {
      n: i + 1, name: escapeHtml(row.name), damage: row.damage,
    }));
    text += `\n\n${t(lang, 'commands.boss.raiders_title')}\n${lines.join('\n')}`;
  }
  return {
    text,
    keyboard: keyboard([[
      button(t(lang, 'commands.boss.buttons.hit'), `${PREFIX}hit:${boss.id}`),
      button(t(lang, 'commands.boss.buttons.refresh'), `${PREFIX}show:${boss.id}`),
    ]]),
  };
}

function kindName(boss, lang) {
  return t(lang, `commands.boss.kinds.${boss.kind}`);
}

function hpBar(hp, maxHp) {
  const filled = hp > 0 ? Math.max(1, Math.round((hp / maxHp) * BAR_SEGMENTS)) : 0;
  return '█'.repeat(filled) + '░'.repeat(BAR_SEGMENTS - filled);
}

function escapesAt(boss) {
  return boss.spawned_at + config.boss.lifetimeDays * DAY_SECONDS;
}

function isExpired(boss) {
  return escapesAt(boss) <= nowSec();
}
