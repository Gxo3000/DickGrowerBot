DickGrowerBot for Telegram Serverless
=====================================

[![Serverless](https://github.com/Gxo3000/DickGrowerBot/actions/workflows/serverless.yaml/badge.svg)](https://github.com/Gxo3000/DickGrowerBot/actions/workflows/serverless.yaml)

A game bot for group chats that lets its users grow their virtual "dicks" every day for some random
count of centimeters (including negative values) and compete with friends and other chat members.

It runs on [Telegram Serverless](https://core.telegram.org/bots/serverless): plain JavaScript modules
in `tgcloud/`, executed by Telegram next to the Bot API and a built-in SQLite database — no server,
no Docker, nothing to keep alive. It is a rewrite of [DickGrowerBot](https://github.com/kozalosev/DickGrowerBot)
by kozalosev, originally written in Rust.

Mechanics
---------

* `/grow` once a day in every chat, with a grace period of growth only for newcomers;
* `/top` of the chat, page by page;
* **the Dick of the Day** (`/dod`), a daily election that brings the winner some bonus centimeters;
* `/pvp` battles with bets and statistics;
* `/loan` for those deep below zero, paid off by the following growths;
* a bonus for playing on days in a row;
* the daily shrink of dicks nobody has grown for a week, and `/shrinks` to see who lost what;
* promo codes (`/promo`, and a `/start` deeplink);
* `/import` from _@pipisabot_ and _@kraft28_bot_;
* the inline mode, to play in a chat without adding the bot to it;
* `/topics` to confine the bot to chosen forum topics;
* `/language` per user and per chat: English, Russian, Italian, Persian, Chinese (Simplified and
  Traditional);
* `/support` to reach the owner, a rate limit against floods, and bans.

Running it
----------

You need Node.js 22.5 or newer and a bot with Serverless switched on in
[@BotFather](https://t.me/BotFather) (your bot → Serverless).

```shell
npm install
npm test                  # offline, against an emulator of the platform
npx tgcloud login         # the CLI access token from @BotFather → your bot → Serverless → CLI Access
npx tgcloud push          # deploy tgcloud/
npx tgcloud migrate       # create the tables; a push never touches the database
```

In CI, or anywhere `login` can't prompt, the CLI reads the token from the `TGCLOUD_TOKEN` variable.

Settings live in [tgcloud/lib/config.js](tgcloud/lib/config.js) — the platform has no environment
variables. Put your Telegram user id into `admins` to get the owner's commands in a private chat:

| Command | What it does |
|---|---|
| `/sync_commands` | fills the command menus in every language; send it once after the first deploy |
| `/promo_add code bonus capacity [days]` | creates a promo code |
| `/promo_list` | lists the promo codes |
| `/ban uid days`, `/unban uid` | bans a player and lifts the ban |

How it is built is described in [AGENTS.md](AGENTS.md), and the platform's SDK in
[docs/tgcloud-sdk.md](docs/tgcloud-sdk.md).

License
-------

MIT with the "Commons Clause" condition, see [LICENSE](LICENSE): the code may not be used to create
competitor bots or for any commercial profit.
