import { api } from 'sdk';
import { commandEnabled } from './config.js';
import { t } from './i18n.js';
import { shrinkEnabled } from './features/shrink.js';
import { supportEnabled } from './features/support.js';

// Every command the bot answers. `scope` says where it works; `menu` lists the Bot API menus it
// is shown in; `key` names its description, `commands.<key>.description`.
export const COMMANDS = [
  { name: 'start', scope: 'any', menu: [], allowBanned: true },
  { name: 'help', scope: 'any', menu: ['private', 'group'], allowBanned: true },
  { name: 'privacy', scope: 'any', menu: ['private'], allowBanned: true },
  { name: 'support', scope: 'private', menu: ['private'], allowBanned: true, available: supportEnabled },
  { name: 'promo', scope: 'private', menu: ['private'] },
  { name: 'stats', scope: 'any', menu: ['private', 'group'] },
  { name: 'language', scope: 'any', menu: ['private', 'admin'] },
  { name: 'grow', scope: 'group', menu: ['group'] },
  { name: 'top', scope: 'group', menu: ['group'] },
  { name: 'dod', aliases: ['dick_of_day'], scope: 'group', menu: ['group'] },
  { name: 'pvp', aliases: ['battle', 'attack', 'fight'], scope: 'group', menu: ['group'] },
  { name: 'loan', aliases: ['borrow'], scope: 'group', menu: ['group'] },
  { name: 'shrinks', scope: 'group', menu: ['group'], available: shrinkEnabled },
  { name: 'import', scope: 'group', menu: ['admin'] },
  { name: 'topics', scope: 'group', menu: ['admin'] },
];

export function findCommand(name) {
  const spec = COMMANDS.find((c) => c.name === name || c.aliases?.includes(name));
  return spec && isAvailable(spec) ? spec : null;
}

// Fills the Bot API command menus for every language and for the default. Returns how many
// lists were set.
export async function syncCommands(languages) {
  const scopes = {
    private: { type: 'all_private_chats' },
    group: { type: 'all_group_chats' },
    admin: { type: 'all_chat_administrators' },
  };
  let count = 0;
  for (const language of [null, ...languages]) {
    const lang = language ?? 'en';
    for (const [menu, scope] of Object.entries(scopes)) {
      const commands = COMMANDS
        .filter((spec) => isAvailable(spec))
        .filter((spec) => spec.menu.includes(menu) || (menu === 'admin' && spec.menu.includes('group')))
        .map((spec) => ({ command: spec.name, description: t(lang, `commands.${spec.name}.description`) }));
      const params = { commands, scope };
      if (language) params.language_code = language;
      await api.setMyCommands(params);
      count++;
    }
  }
  return count;
}

function isAvailable(spec) {
  return commandEnabled(spec.name) && (spec.available?.() ?? true);
}
