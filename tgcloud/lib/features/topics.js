import { t } from '../i18n.js';
import { button, isChatAdmin, isForum, keyboard, topicOf } from '../tg.js';
import { setTopics } from '../repo/chats.js';

const PREFIX = 'topics:';

// Whether the bot may answer in the topic. An empty allowlist means every topic.
export function topicAllowed(chat, topic) {
  return chat.topics.length === 0 || chat.topics.includes(topic);
}

export async function topicsCommand({ message, chat, lang }) {
  if (!isForum(message.chat)) return { text: t(lang, 'commands.topics.errors.not_a_forum') };
  if (!(await isChatAdmin(message.chat.id, message.from.id))) {
    return { text: t(lang, 'commands.topics.errors.admins_only') };
  }
  return picker(chat.topics, topicOf(message), lang);
}

export function parseTopicsData(data) {
  if (!data.startsWith(PREFIX)) return null;
  const [action, topic] = data.slice(PREFIX.length).split(':');
  const id = Number(topic);
  return ['only', 'allow', 'forbid', 'all'].includes(action) && Number.isSafeInteger(id) ? { action, topic: id } : null;
}

export async function answerTopics({ query, chat, lang, data }) {
  const message = query.message;
  if (!message || !isForum(message.chat) || !(await isChatAdmin(message.chat.id, query.from.id))) {
    return { alert: t(lang, 'commands.topics.errors.admins_only') };
  }
  let topics = chat.topics;
  if (data.action === 'only') topics = [data.topic];
  else if (data.action === 'allow') topics = [...new Set([...topics, data.topic])];
  else if (data.action === 'forbid') topics = topics.filter((id) => id !== data.topic);
  else topics = [];
  if (data.action === 'forbid' && topics.length === 0) {
    topics = chat.topics;
  }
  await setTopics(chat.id, topics);
  return picker(topics, data.topic, lang);
}

function picker(topics, here, lang) {
  if (topics.length === 0) {
    return {
      text: t(lang, 'commands.topics.state.unrestricted'),
      keyboard: keyboard([[button(t(lang, 'commands.topics.buttons.only_here'), `${PREFIX}only:${here}`)]]),
    };
  }
  const allowedHere = topics.includes(here);
  const toggle = allowedHere
    ? button(t(lang, 'commands.topics.buttons.forbid_here'), `${PREFIX}forbid:${here}`)
    : button(t(lang, 'commands.topics.buttons.allow_here'), `${PREFIX}allow:${here}`);
  const rows = [[toggle], [button(t(lang, 'commands.topics.buttons.allow_everywhere'), `${PREFIX}all:${here}`)]];
  if (allowedHere && topics.length === 1) rows.shift();
  return {
    text: t(lang, `commands.topics.state.${allowedHere ? 'allowed_here' : 'forbidden_here'}`, { count: topics.length }),
    keyboard: keyboard(rows),
  };
}
