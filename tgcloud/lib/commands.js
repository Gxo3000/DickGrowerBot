import { api } from 'sdk';
import { commandEnabled } from './config.js';
import { t } from './i18n.js';
import { shrinkEnabled } from './features/shrink.js';
import { supportEnabled } from './features/support.js';

// Every command the bot answers, in the order the menus show them. `scope` says where it works;
// `menu` lists the Bot API menus it is shown in, described by `commands.<name>.description`.
export const COMMANDS = [
  { name: 'start', scope: 'any', menu: [], allowBanned: true },
  { name: 'grow', scope: 'group', menu: ['group'] },
  { name: 'top', scope: 'group', menu: ['group'] },
  { name: 'dod', aliases: ['dick_of_day'], scope: 'group', menu: ['group'] },
  { name: 'pvp', aliases: ['battle', 'attack', 'fight'], scope: 'group', menu: ['group'] },
  { name: 'loan', aliases: ['borrow'], scope: 'group', menu: ['group'] },
  { name: 'shrinks', scope: 'group', menu: ['group'], available: shrinkEnabled },
  { name: 'stats', scope: 'any', menu: ['private', 'group'] },
  { name: 'promo', scope: 'private', menu: ['private'] },
  { name: 'language', scope: 'any', menu: ['private', 'admin'] },
  { name: 'import', scope: 'group', menu: ['admin'] },
  { name: 'topics', scope: 'group', menu: ['admin'] },
  { name: 'support', scope: 'private', menu: ['private'], allowBanned: true, available: supportEnabled },
  { name: 'help', scope: 'any', menu: ['private', 'group'], allowBanned: true },
  { name: 'privacy', scope: 'any', menu: ['private'], allowBanned: true },
];

export function findCommand(name) {
  const spec = COMMANDS.find((c) => c.name === name || c.aliases?.includes(name));
  return spec && isAvailable(spec) ? spec : null;
}

// Fills the bot's profile for every language and for the default: the command menus of the private
// chats, the groups and the group admins, and the descriptions shown in an empty chat and on the
// profile page. Returns how many requests were made.
export async function syncProfile(languages) {
  const scopes = {
    private: { type: 'all_private_chats' },
    group: { type: 'all_group_chats' },
    admin: { type: 'all_chat_administrators' },
  };
  let count = 0;
  for (const language of [null, ...languages]) {
    const lang = language ?? 'en';
    const languageCode = language ? { language_code: language } : {};
    for (const [menu, scope] of Object.entries(scopes)) {
      const commands = COMMANDS
        .filter((spec) => isAvailable(spec))
        .filter((spec) => spec.menu.includes(menu) || (menu === 'admin' && spec.menu.includes('group')))
        .map((spec) => ({ command: spec.name, description: t(lang, `commands.${spec.name}.description`) }));
      await api.setMyCommands({ commands, scope, ...languageCode });
      count++;
    }
    await api.setMyDescription({ description: t(lang, 'bot.description'), ...languageCode });
    await api.setMyShortDescription({ short_description: t(lang, 'bot.short_description'), ...languageCode });
    count += 2;
  }
  return count;
}

function isAvailable(spec) {
  return commandEnabled(spec.name) && (spec.available?.() ?? true);
}
