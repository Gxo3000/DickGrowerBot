import { table, integer, text, real, json, index, uniqueIndex, primaryKey, sql } from 'sdk/db';

// Times are unix seconds, days are whole UTC days since the epoch (see lib/time.js).
// `chat_id` is the internal id of a `chats` row everywhere except in `chats` and `imports`,
// where it is Telegram's own.

export const users = table('users', {
  uid: integer('uid').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at').notNull(),
  lang: text('lang'),
  bannedUntil: integer('banned_until'),
});

export const chats = table('chats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  chatId: integer('chat_id').unique(),
  chatInstance: text('chat_instance').unique(),
  lang: text('lang'),
  topics: json('topics'),
  maintainedDay: integer('maintained_day').notNull().default(0),
  createdAt: integer('created_at').notNull(),
});

export const dicks = table('dicks', {
  uid: integer('uid').notNull(),
  chatId: integer('chat_id').notNull(),
  length: integer('length').notNull().default(0),
  grownAt: integer('grown_at').notNull(),
  bonusAttempts: integer('bonus_attempts').notNull().default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.uid, t.chatId] }),
  byChatLength: index('idx_dicks_chat_length').on(t.chatId, t.length),
  byUid: index('idx_dicks_uid').on(t.uid),
}));

export const dicksOfDay = table('dicks_of_day', {
  chatId: integer('chat_id').notNull(),
  day: integer('day').notNull(),
  winnerUid: integer('winner_uid').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.chatId, t.day] }),
}));

export const loans = table('loans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uid: integer('uid').notNull(),
  chatId: integer('chat_id').notNull(),
  debt: integer('debt').notNull(),
  payoutRatio: real('payout_ratio').notNull(),
  createdAt: integer('created_at').notNull(),
  repaidAt: integer('repaid_at'),
}, (t) => ({
  active: uniqueIndex('uidx_loans_active').on(t.uid, t.chatId).where(sql`repaid_at IS NULL`),
}));

export const battleStats = table('battle_stats', {
  uid: integer('uid').notNull(),
  chatId: integer('chat_id').notNull(),
  battlesTotal: integer('battles_total').notNull().default(0),
  battlesWon: integer('battles_won').notNull().default(0),
  winStreakCurrent: integer('win_streak_current').notNull().default(0),
  winStreakMax: integer('win_streak_max').notNull().default(0),
  acquiredLength: integer('acquired_length').notNull().default(0),
  lostLength: integer('lost_length').notNull().default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.uid, t.chatId] }),
}));

export const battleClaims = table('battle_claims', {
  key: text('key').primaryKey(),
  createdAt: integer('created_at').notNull(),
});

export const perkStates = table('perk_states', {
  uid: integer('uid').notNull(),
  chatId: integer('chat_id').notNull(),
  perk: text('perk').notNull(),
  state: json('state').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.uid, t.chatId, t.perk] }),
}));

export const promoCodes = table('promo_codes', {
  code: text('code').primaryKey(),
  bonusLength: integer('bonus_length').notNull(),
  sinceDay: integer('since_day').notNull(),
  untilDay: integer('until_day'),
  capacity: integer('capacity').notNull(),
  createdAt: integer('created_at').notNull(),
}, (t) => ({
  lowerCode: uniqueIndex('uidx_promo_codes_lower').on(sql`lower(code)`),
}));

export const promoActivations = table('promo_activations', {
  uid: integer('uid').notNull(),
  code: text('code').notNull(),
  affectedChats: integer('affected_chats').notNull(),
  activatedAt: integer('activated_at').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.uid, t.code] }),
}));

export const imports = table('imports', {
  chatId: integer('chat_id').notNull(),
  uid: integer('uid').notNull(),
  originalLength: integer('original_length').notNull(),
  importedAt: integer('imported_at').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.chatId, t.uid] }),
}));

export const announcements = table('announcements', {
  chatId: integer('chat_id').notNull(),
  lang: text('lang').notNull(),
  hash: text('hash').notNull(),
  timesShown: integer('times_shown').notNull().default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.chatId, t.lang] }),
}));

export const shrinks = table('shrinks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  chatId: integer('chat_id').notNull(),
  uid: integer('uid').notNull(),
  lostLength: integer('lost_length').notNull(),
  day: integer('day').notNull(),
}, (t) => ({
  byChatDay: index('idx_shrinks_chat_day').on(t.chatId, t.day),
}));

export const lotteries = table('lotteries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  chatId: integer('chat_id').notNull(),
  day: integer('day').notNull(),
  pool: integer('pool').notNull().default(0),
  status: text('status').notNull().default('open'),
  winnerUid: integer('winner_uid'),
  prize: integer('prize'),
  finishedAt: integer('finished_at'),
}, (t) => ({
  byChatDay: uniqueIndex('uidx_lotteries_chat_day').on(t.chatId, t.day),
}));

export const lotteryTickets = table('lottery_tickets', {
  lotteryId: integer('lottery_id').notNull(),
  uid: integer('uid').notNull(),
  tickets: integer('tickets').notNull().default(0),
  spent: integer('spent').notNull().default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.lotteryId, t.uid] }),
}));

export const bosses = table('bosses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  chatId: integer('chat_id').notNull(),
  level: integer('level').notNull(),
  kind: text('kind').notNull(),
  maxHp: integer('max_hp').notNull(),
  hp: integer('hp').notNull(),
  status: text('status').notNull().default('alive'),
  spawnedAt: integer('spawned_at').notNull(),
  finishedAt: integer('finished_at'),
  killerUid: integer('killer_uid'),
}, (t) => ({
  alive: uniqueIndex('uidx_bosses_alive').on(t.chatId).where(sql`status = 'alive'`),
  byChat: index('idx_bosses_chat').on(t.chatId, t.id),
}));

export const bossHits = table('boss_hits', {
  bossId: integer('boss_id').notNull(),
  uid: integer('uid').notNull(),
  damage: integer('damage').notNull().default(0),
  hits: integer('hits').notNull().default(0),
  lastHitAt: integer('last_hit_at').notNull().default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.bossId, t.uid] }),
}));

export const pveStats = table('pve_stats', {
  uid: integer('uid').notNull(),
  chatId: integer('chat_id').notNull(),
  adventureDay: integer('adventure_day').notNull().default(0),
  adventures: integer('adventures').notNull().default(0),
  adventuresWon: integer('adventures_won').notNull().default(0),
  bossDamage: integer('boss_damage').notNull().default(0),
  bossKills: integer('boss_kills').notNull().default(0),
  earned: integer('earned').notNull().default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.uid, t.chatId] }),
}));

export const dialogues = table('dialogues', {
  uid: integer('uid').primaryKey(),
  kind: text('kind').notNull(),
  data: json('data'),
  expiresAt: integer('expires_at').notNull(),
});

export const cooldowns = table('cooldowns', {
  key: text('key').primaryKey(),
  until: integer('until').notNull(),
});

export const rateLimits = table('rate_limits', {
  key: text('key').primaryKey(),
  windowNo: integer('window_no').notNull(),
  hits: integer('hits').notNull(),
});
