// Checks tgcloud/ against the platform's module rules before a push: only the SDK and relative
// `.js` imports that stay inside tgcloud/, handlers named after update types, and no `.js` file
// where the platform would not deploy it.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', 'tgcloud');
const SDK = new Set(['sdk', 'sdk/db', 'sdk/api', 'sdk/fetch']);
const UPDATE_TYPES = new Set([
  'message', 'edited_message', 'channel_post', 'edited_channel_post', 'business_connection', 'business_message',
  'edited_business_message', 'deleted_business_messages', 'inline_query', 'chosen_inline_result', 'callback_query',
  'shipping_query', 'pre_checkout_query', 'purchased_paid_media', 'poll', 'poll_answer', 'my_chat_member',
  'chat_member', 'chat_join_request', 'chat_boost', 'removed_chat_boost', 'message_reaction', 'message_reaction_count',
]);
const IMPORT = /^\s*(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"]/gm;

const problems = [];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

for (const file of walk(ROOT).filter((path) => path.endsWith('.js'))) {
  const name = relative(ROOT, file);
  const [top, ...rest] = name.split('/');
  if (name !== 'schema.js' && !['lib', 'handlers', 'endpoints'].includes(top)) {
    problems.push(`${name}: not in a deployed location`);
  }
  if ((top === 'handlers' || top === 'endpoints') && rest.length !== 1) {
    problems.push(`${name}: ${top}/ must be flat`);
  }
  if (top === 'handlers' && !UPDATE_TYPES.has(rest[0]?.replace(/\.js$/, ''))) {
    problems.push(`${name}: not a Telegram update type`);
  }
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(IMPORT)) {
    const specifier = match[1] ?? match[2];
    if (SDK.has(specifier)) continue;
    if (!specifier.startsWith('.')) {
      problems.push(`${name}: imports '${specifier}', which is neither the SDK nor a project module`);
      continue;
    }
    if (!specifier.endsWith('.js')) {
      problems.push(`${name}: the relative import '${specifier}' must end in .js`);
    }
    const target = resolve(dirname(file), specifier);
    if (!target.startsWith(ROOT)) {
      problems.push(`${name}: '${specifier}' leads outside tgcloud/`);
    } else {
      try {
        statSync(target);
      } catch {
        problems.push(`${name}: '${specifier}' does not exist`);
      }
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('tgcloud/ follows the module rules');
