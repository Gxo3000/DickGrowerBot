// Every setting of the bot. The platform has no environment variables, so this module is where a
// deployment is tuned; see CLAUDE.md for what each knob does.

export const config = {
  // Telegram user ids allowed to use the admin commands (/ban, /promo_add, …) in a private chat.
  admins: [],

  // Where /support relays the messages; null switches the command off.
  supportChatId: null,

  // Commands that are switched off, by name without the slash (e.g. 'import').
  disabledCommands: [],

  links: {
    repo: 'https://github.com/Gxo3000/DickGrowerBot',
    channel: null,
    chat: null,
  },

  top: {
    limit: 10,
    pagination: true,
    hideInactiveZeroLength: true,
  },

  // A player who hasn't grown for this many days is inactive: marked in /top and left out of the
  // Dick of the Day election.
  inactivityDays: 7,

  growth: {
    min: -5,
    max: 10,
    // The chance of a positive roll; newcomers always grow.
    growShrinkRatio: 0.5,
    newcomersGraceDays: 7,
  },

  dod: {
    bonusMin: 1,
    bonusMax: 5,
    // 'random' | 'weights' (the poor are favoured) | 'exclusion' (the richest are left out)
    selection: 'random',
    richExclusionRatio: 0.1,
  },

  pvp: {
    defaultBet: 1,
    checkAcceptorLength: false,
    showStats: true,
  },

  loan: {
    // The share of every growth that goes to pay the debt off; 0 switches /loan off.
    payoutRatio: 0.1,
    multipleLoans: false,
  },

  perks: {
    // A deep negative length gets this share of its depth back with every growth; 0 is off.
    helpPussiesRatio: 0,
    // The days of a streak on which the daily bonus grows by a centimetre; empty is off.
    streakGrades: [2, 4, 8, 16, 32],
  },

  shrink: {
    // The share a neglected dick loses a day; 0 switches the shrink off.
    ratio: 0.01,
    inactivityDays: 7,
    rampUpDays: 7,
  },

  lottery: {
    ticketPrice: 5,
    maxTicketsPerDay: 10,
    // What the bot adds on top of the tickets sold.
    jackpotBonusRatio: 0.2,
    minParticipants: 2,
  },

  boss: {
    baseHp: 120,
    // Each level multiplies the hit points by this.
    hpGrowth: 1.3,
    // Every this many active players add the base hit points once more.
    playersPerHpStep: 3,
    hitCooldownMinutes: 60,
    damageMin: 5,
    damageMax: 20,
    critChance: 0.1,
    counterattackChance: 0.2,
    counterattackMin: 1,
    counterattackMax: 3,
    // A boss that hasn't been killed in this many days escapes.
    lifetimeDays: 2,
    rewardBase: 10,
    rewardPerLevel: 5,
    lastHitBonus: 3,
  },

  adventure: {
    difficulties: {
      easy: { winChance: 0.7, rewardMin: 2, rewardMax: 4, penaltyMin: 1, penaltyMax: 2 },
      medium: { winChance: 0.5, rewardMin: 4, rewardMax: 8, penaltyMin: 2, penaltyMax: 4 },
      hard: { winChance: 0.3, rewardMin: 8, rewardMax: 15, penaltyMin: 4, penaltyMax: 7 },
    },
    // The chance that a won hard adventure also brings an extra /grow attempt.
    bonusAttemptChance: 0.25,
  },

  import: {
    bots: ['pipisabot', 'kraft28_bot'],
    maxMembers: 10,
  },

  rateLimit: {
    // Requests per window; 0 switches a counter off.
    userRequests: 20,
    chatRequests: 60,
    windowSeconds: 60,
    warnings: 3,
  },

  support: {
    cooldownSeconds: 60,
  },

  dialogueSeconds: 3600,

  announcements: {
    maxShows: 5,
    // Texts by language (en, ru, it, fa, zh); `fallback` maps a language to the one it borrows from.
    texts: {},
    fallback: { it: 'en', fa: 'en', zh: 'en', 'zh-TW': 'en' },
  },
};

export function commandEnabled(name) {
  return !config.disabledCommands.includes(name);
}
