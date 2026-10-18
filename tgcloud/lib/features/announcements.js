import { config } from '../config.js';
import { countShowing } from '../repo/announcements.js';

// The announcement to append for the chat, while it hasn't been shown there `maxShows` times.
export async function announcementFor(chatId, lang) {
  const { texts, fallback, maxShows } = config.announcements;
  const language = texts[lang] ? lang : fallback[lang];
  const text = language ? texts[language]?.trim() : null;
  if (!text || maxShows <= 0) return null;
  const shown = await countShowing(chatId, language, hash(text));
  return shown <= maxShows ? text : null;
}

function hash(text) {
  let value = 5381;
  for (let i = 0; i < text.length; i++) {
    value = ((value * 33) ^ text.charCodeAt(i)) >>> 0;
  }
  return value.toString(16);
}
