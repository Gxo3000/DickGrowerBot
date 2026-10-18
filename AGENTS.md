# AGENTS.md

DickGrowerBot for [Telegram Serverless](https://core.telegram.org/bots/serverless) (tgcloud): the
bot is the JavaScript in `tgcloud/`, run by the platform. It is a rewrite of the Rust bot by
kozalosev, which lives on in this repository's history. The platform's own reference is
[docs/tgcloud-sdk.md](docs/tgcloud-sdk.md).

## Commands

```bash
npm install          # the tgcloud CLI, a dev-dependency
npm test             # the whole suite, offline (Node 22.5+: it uses node:sqlite)
npm run check        # the platform's module rules, checked locally

npx tgcloud login    # once: paste the CLI access token from @BotFather → your bot → Serverless
npx tgcloud push     # deploy tgcloud/
npx tgcloud migrate  # apply schema.js to the database — push never does
```

Before a push, all three of `npm run check`, `npm test` and `npx tgcloud status` must be clean.
`.tgcloud/` holds the access token and is git-ignored; never commit it, never paste a token anywhere.

After the first deploy, an admin sends `/sync_commands` in a private chat to fill the command menus.

## Layout

| Path | What it is |
|---|---|
| `tgcloud/schema.js` | every table; the only file `migrate` reads |
| `tgcloud/handlers/` | `message`, `callback_query`, `inline_query` — thin entry points that catch and log |
| `tgcloud/lib/router/` | which update goes to which feature, and the gates in front of them |
| `tgcloud/lib/features/` | the game: one module per feature, returning `{ text, keyboard }` |
| `tgcloud/lib/repo/` | SQL, and nothing else |
| `tgcloud/lib/locales/` | the texts, one module per language |
| `tgcloud/lib/config.js` | every setting — the platform has no environment variables |
| `test/` | the tests, and `test/sdk/`, an offline stand-in for the platform's `sdk` |
| `scripts/check-imports.mjs` | the module rules, checked before a push |

A feature never talks to Telegram itself unless it has to (`import`, `language`, `topics`,
`support`): it returns `{ text, keyboard }` for a command, and `{ text, keyboard, alert, toast }` for
a button. The routers decide whether that becomes a reply, an edit of a chat message or an edit of an
inline message. That is what lets every game run both from a command and from the inline mode.

## The rules of the platform that shape the code

* **Only `sdk` and relative `.js` imports inside `tgcloud/`.** No npm packages, no `fs`, no Node
  built-ins, and none of `atob`/`TextEncoder`/`crypto` is promised — `lib/base64.js` exists for that.
* **No transactions.** Every rule that two concurrent updates could break is one conditional
  statement: the once-a-day growth is the `WHERE` of the upsert in `commitGrowth`, the Dick of the Day
  is the primary key of `dicks_of_day`, a battle offer is taken once by `claimBattle`, a loan resets
  the length with a compare-and-set, the day's chores of a chat are claimed by `claimMaintenance`.
  Add a feature the same way: claim first, in one statement, then do the rest.
* **What the perks write is written after the growth.** `computeIncrement` is pure and returns a
  `commit` for the loan payment and the perk states; the caller runs it only once its own write went
  through, so a refused growth leaves no trace of its perks.
* **No foreign keys.** Integrity is the code's: `mergeChats` in `repo/chats.js` moves every
  chat-scoped table, so a new chat-scoped table must be added there.
* **No scheduler.** Whatever happens once a day — the shrink of neglected dicks, the cleanup of
  stale counters — is done by `dailyChores`, run by the first request of a chat after UTC midnight
  and claimed with `maintained_day`, so it runs once. A chat where nobody plays has nothing to do.
* **The database is SQLite.** Raw SQL through the `sql` tag; times are unix seconds and days are
  whole UTC days since the epoch (`lib/time.js`).
* **Schema changes go through `migrate`.** Adding a table, a column or an index is safe. A column is
  dropped only by `.deprecated()`, and a type is changed by hand.

## What counts as a growth

`commitGrowth` is the growth and the only one: it moves `grown_at` and spends a bonus attempt only
when one is needed. Every other change of a length — a battle, the Dick of the Day award, a promo
code, an import, a shrink — goes through `addLength` (or a statement of its own) and leaves
`grown_at` alone.

The winner of a battle pays the active loan its share of the bet (`withholdForLoan`), the same share
a growth pays.

## Chats

A chat is known by its Telegram id, by the `chat_instance` of its buttons, or both. A button pressed
under a group message carries both and ties them together; an inline message carries the instance,
and the id too when its `inline_message_id` encodes a supergroup (`lib/inline_id.js`). A chat known
twice is merged into one, lengths and counters summed (`resolveChat`).

## Tests

`npm test` runs the handlers end to end against `test/sdk/`, which keeps a real SQLite database in
memory built from `schema.js`, and records every Bot API call. The emulator implements the schema DSL,
the `sql` tag and the raw query methods — not the fluent query builder, so the bot uses raw SQL only.

`useBot()` gives each test a fresh database and fails a test in which a handler logged an error: the
handlers never throw, so a log line is the only trace a bug leaves. `clock.now` and `rng.next` are
the two seams for time and luck.

## Code style

* **A comment describes the code, never the change.** What the code does, and why if that isn't
  obvious — no mention of a diff, an issue or the previous version, and no comment left behind by
  removed code. The reasoning worth keeping goes here or in the commit message; when nothing
  non-obvious is left to say, write no comment.
* **A comment never points against the dependencies.** A module may say what it is and what it uses,
  never who uses it: no roll-call of callers in `repo/` or `lib/`. Such a comment rots silently when a
  caller moves.
* **A file reads from its public surface downwards.** Constants first, then the exported functions,
  then the private helpers under what they serve.
* **A log message is a constant; the values go in an object.** `console.error('could not handle a
  message', { chatId }, e)`, so repeated events read alike. Messages are lower-case with no trailing
  dot.
* **Lines stay under 120 characters.** Break a long call at its arguments, and in a test bind a
  result to a name before asserting on it.
* **A setting is a field of `config`**, never a literal in a feature. Tests change `config` directly;
  `useBot()` restores it.
