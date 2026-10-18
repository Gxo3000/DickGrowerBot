import { api } from 'sdk';
import { config } from '../config.js';
import { t } from '../i18n.js';
import { escapeHtml } from '../html.js';
import { botInfo } from '../tg.js';
import { countMembers, members } from '../repo/dicks.js';
import { importedUids, importPlayer } from '../repo/imports.js';

const TOP_LINE = /\d{1,3}((\. )|\|)(?<name>.+?) — (?<length>\d+) см\.?/u;
const PIPISA_NAME_LENGTH = 13;
const PIPISA_MARKS = ['🍆', '🤥'];

class ImportRefusal extends Error {
  constructor(key, params = {}) {
    super(key);
    this.key = key;
    this.params = params;
  }
}

// The import of a leaderboard of another bot, replied to by an administrator.
export async function importFromBot({ message, chat, lang }) {
  try {
    const { bot, text } = await check(message, chat);
    const top = parseTop(text);
    const { found, notFound } = resolveUsers(bot, top, await members(chat.id));
    const already = await importedUids(message.chat.id);
    const imported = [];
    const present = [];
    for (const user of found) {
      if (already.has(user.uid) || !(await importPlayer(message.chat.id, chat.id, user.uid, user.length))) {
        present.push(user);
      } else {
        imported.push(user);
      }
    }
    return { text: report({ imported, present, notFound }, lang) };
  } catch (e) {
    if (!(e instanceof ImportRefusal)) throw e;
    return { text: refusal(e, lang) };
  }
}

// Whether a name shown by the bot `bot` belongs to the member called `fullName`.
export function matchesName(bot, fullName, shownName) {
  if (bot === 'pipisabot') {
    if (fullName === shownName || fullName === stripMark(shownName)) return true;
    if (!shownName.endsWith('...')) return false;
    const cut = stripMark(shownName.slice(0, -3));
    const chars = [...fullName];
    return chars.length > PIPISA_NAME_LENGTH && chars.slice(0, PIPISA_NAME_LENGTH).join('') === cut;
  }
  return fullName === shownName || (fullName.startsWith(shownName) && fullName[shownName.length] === ' ');
}

export function parseTop(text) {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => TOP_LINE.test(line));
  if (start < 0) throw new ImportRefusal('nothing_found');
  const entries = [];
  const invalid = [];
  for (const line of lines.slice(start)) {
    if (line.trim() === '') break;
    const match = TOP_LINE.exec(line);
    if (match) entries.push({ name: match.groups.name, length: Number(match.groups.length) });
    else invalid.push(line);
  }
  if (invalid.length > 0) throw new ImportRefusal('invalid_lines', { lines: invalid });
  if (entries.length === 0) throw new ImportRefusal('nothing_found');
  return entries;
}

async function check(message, chat) {
  if (message.chat.type === 'group') throw new ImportRefusal('legacy_group');
  const admins = await api.getChatAdministrators({ chat_id: message.chat.id });
  const adminIds = new Set(admins.map((member) => member.user.id));
  if (!adminIds.has(message.from.id)) throw new ImportRefusal('not_admin');
  if (!adminIds.has((await botInfo()).id)) throw new ImportRefusal('bot_not_admin');
  if ((await countMembers(chat.id)) > config.import.maxMembers) throw new ImportRefusal('too_many_members');

  const replied = message.reply_to_message;
  const bot = replied?.from?.is_bot ? replied.from.username : null;
  if (!replied || replied.forward_origin || !config.import.bots.includes(bot) || !replied.text) {
    const bots = config.import.bots.map((name) => `@${name}`).join(', ');
    throw new ImportRefusal('not_reply', { origin_bots: bots });
  }
  return { bot, text: replied.text };
}

function resolveUsers(bot, top, chatMembers) {
  const shown = new Set();
  const ambiguous = new Set();
  const found = [];
  const notFound = [];
  for (const entry of top) {
    const repeated = shown.has(entry.name);
    shown.add(entry.name);
    const fitting = chatMembers.filter((member) => matchesName(bot, member.name, entry.name));
    if (repeated || fitting.length > 1) {
      ambiguous.add(entry.name);
    } else if (fitting.length === 1) {
      found.push({ uid: fitting[0].uid, name: fitting[0].name, length: entry.length });
    } else {
      notFound.push(entry.name);
    }
  }
  if (ambiguous.size > 0) {
    throw new ImportRefusal('ambiguous_names', { names: [...ambiguous].map(escapeHtml).join(', ') });
  }
  return { found, notFound };
}

function report({ imported, present, notFound }, lang) {
  const sections = [
    ['imported', imported.map((u) => t(lang, 'commands.import.result.line.imported', { name: escapeHtml(u.name), length: u.length }))],
    ['already_present', present.map((u) => t(lang, 'commands.import.result.line.already_present', { name: escapeHtml(u.name), length: u.length }))],
    ['not_found', notFound.map((name) => t(lang, 'commands.import.result.line.not_found', { name: escapeHtml(name) }))],
  ];
  return sections
    .filter(([, lines]) => lines.length > 0)
    .map(([key, lines]) => `${t(lang, `commands.import.result.titles.${key}`)}\n${lines.join('\n')}`)
    .join('\n\n');
}

function refusal(e, lang) {
  if (e.key !== 'invalid_lines') return t(lang, `commands.import.errors.${e.key}`, e.params);
  const lines = e.params.lines
    .map((line) => t(lang, 'commands.import.errors.invalid_lines.line', { line: escapeHtml(line) }))
    .join('\n');
  return t(lang, 'commands.import.errors.invalid_lines.template', { invalid_lines: lines });
}

function stripMark(name) {
  const mark = PIPISA_MARKS.find((m) => name.endsWith(m));
  return mark ? name.slice(0, -mark.length) : name;
}
