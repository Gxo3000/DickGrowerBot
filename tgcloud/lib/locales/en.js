export default {
  commands: {
    help: {
      description: 'I\'ll help you, my friend',
    },
    language: {
      description: 'Change the interface language',
      prompt: 'Choose your language:',
      success: 'Done! Your language preference is saved.',
      errors: {
        unsupported: 'Sorry, this language isn\'t supported. Try one of: 🇬🇧 en, 🇷🇺 ru, 🇮🇹 it, 🇮🇷 fa, 🇨🇳 zh.',
        admins_only: 'Only chat administrators can change the chat language.',
      },
      chat: {
        prompt: 'Choose the language for this whole chat:',
        success: 'Done! Everyone in this chat will now see me in the selected language.',
        reset: 'Done! The chat language was cleared — everyone will see me in their own language again.',
        auto_button: '🌐 Auto (each user\'s own)',
      },
    },
    topics: {
      description: 'Choose the topics the bot works in',
      state: {
        unrestricted: 'I work in <b>every topic</b> of this chat.',
        allowed_here: 'I work <b>in this topic</b>. Topics I am allowed in: <b>%{count}</b>.',
        forbidden_here: 'I <b>don\'t work in this topic</b>. Topics I am allowed in: <b>%{count}</b>.',
      },
      buttons: {
        only_here: '🔒 Work in this topic only',
        allow_here: '✅ Allow in this topic',
        forbid_here: '🚫 Forbid in this topic',
        allow_everywhere: '🌍 Allow in all topics',
      },
      errors: {
        not_a_forum: 'This chat has no topics, so there is nothing to restrict me to.',
        admins_only: 'Only chat administrators can choose the topics I work in.',
      },
    },
    privacy: {
      description: 'Privacy Policy detailing what data we store',
    },
    support: {
      description: 'Write to the bot\'s owner',
      request: 'Write your message and I\'ll pass it to my owner. Send any command to cancel.',
      sent: 'Your message is sent. I\'ll bring you the answer in a private chat.',
      cancelled: 'The request is cancelled.',
      too_often: 'You\'ve just sent a message. Please wait a minute before the next one.',
      reply_button: '↩️ Reply',
      answered: '✅ Delivered.',
      answer_failed: 'Couldn\'t deliver the answer: the user has blocked me or has never started a private chat with me.',
    },
    grow: {
      description: 'Grow your dick!',
      result: 'Your dick has %{event} by <b>%{incr} cm</b> and now it is <b>%{length} cm</b> long.',
      direction: {
        grown: 'grown',
        shrunk: 'shrunk',
      },
      position: 'Your position in the top is <b>%{pos}</b>.',
      tomorrow: 'You have already played with your dick today.',
    },
    top: {
      description: 'Get the biggest dicks of the chat',
      title: 'Top of the biggest dicks:',
      line: '%{n}|<b>%{name}</b> — <b>%{length}</b> cm',
      ending: '<i>[+] means a grower hasn\'t grown his dick today yet.</i>',
      ending_inactive: '<i>[~] means a grower hasn\'t grown his dick for more than %{days} days.</i>',
      empty: 'No one is in the game yet :(',
    },
    shrink: {
      notification: {
        header: '✂️ <b>Time to trim the neglected!</b> These dicks haven\'t grown in %{days}+ days and shrank a bit:',
        line: '— <b>%{name}</b> lost <b>%{lost}</b> cm (now <b>%{length}</b> cm)',
      },
      recent: {
        header: '✂️ <b>Who\'s been shrinking lately:</b>',
        line: '— <b>%{name}</b> lost <b>%{lost}</b> cm',
      },
      empty: 'Silence… No one has shrunk lately. Guess everybody\'s keeping up the pace 💪',
    },
    dod: {
      description: 'Elect the Dick of a Day',
      result: 'The Dick of the Day is <b><a href="tg://user?id=%{uid}">%{name}</a></b>!\n\nHis dick has become longer for <b>%{growth} cm</b> and is <b>%{length}</b> cm long now.',
      position: 'His position in the top is <b>%{pos}</b>.',
      already_chosen: 'The Dick of the Day has been already chosen for today! It\'s <b>%{name}</b>.',
      no_candidates: 'There is no candidates for election. In this chat nobody is in the game yet 😢',
    },
    pvp: {
      description: 'Fight with your friend\'s dick!',
      results: {
        start: '<b>%{name}</b> challenged the chat with a bet of <b>%{bet} cm</b>!',
        finish: 'The winner is <b>%{winner_name}</b>! His dick is now <b>%{winner_length} cm</b> long. The loser\'s one is <b>%{loser_length}</b>.\nThe bet was <b>%{bet} cm</b>.',
        position: {
          winner: '<b>%{name}</b>\'s position in the top is <b>%{pos}</b>.',
          loser: '<b>%{name}</b>\'s position in the top is <b>%{pos}</b>.',
        },
        stats: {
          text: 'Win rate of the <b>winner</b> — <b>%{winner_win_rate}</b>.\nHis current win streak — <b>%{winner_win_streak}</b>, max win streak — <b>%{winner_win_streak_max}</b>.\nWin rate of the <b>loser</b> — <b>%{loser_win_rate}</b>.',
          lost_win_streak: 'The streak of <b>%{lost_win_streak}</b> victories in a row was lost.',
        },
        withheld: '<b>%{payout} cm</b> were withheld from the winner to pay off the loan.',
      },
      button: 'Attack!',
      errors: {
        no_args: 'Call the command with a number of centimeters you\'re willing to bet.',
        not_enough: {
          initiator: 'Meh. The initiator\'s dick is not long enough for such a big bet!',
          acceptor: 'Your gun is not long enough 😣',
        },
        same_person: 'You cannot fight with yourself!',
        battle_already_in_progress: 'The fight is in progress already! The message will be updated in a moment…',
      },
    },
    stats: {
      description: 'Statistics',
      length: 'Length: <b>%{length}</b>\nPosition in the top: <b>%{pos}</b>',
      streak: 'Days in a row: <b>%{current}</b>\nThe longest series of growths: <b>%{max}</b>',
      pvp: 'Win rate: <b>%{win_rate}</b>.\nFights: <b>%{battles}</b>.\nWins: <b>%{wins}</b>.\nMax win streak: <b>%{win_streak}</b>.\nAcquired length: <b>%{acquired} cm</b>.\nLost length: <b>%{lost} cm</b>.',
      personal: '<i>Your personal statistics:</i>\n— Number of the chats in which you play: <b>%{chats}</b>.\n— Maximum length: <b>%{max_length}</b>.\n— Sum of dicks across all the chats: <b>%{total_length}</b>.',
    },
    loan: {
      description: 'Minus? Take a loan!',
      debt: 'Left to pay <b>%{debt} cm</b>',
      confirmation: {
        text: 'Your deep hole will be reset to zero, but each growth will be lowered by <b>%{payout_percentage}</b> until all <b>%{debt} cm</b> is repaid.',
        buttons: {
          agree: 'I\'m in!',
          disagree: 'Disagree',
        },
      },
      callback: {
        success: 'The microloan has been issued successfully!',
        refused: 'The patient refused gender reassignment on credit.',
        payout_ratio_changed: 'The payout rate has been changed since you sent the loan application. Please, invoke the command again.',
      },
      errors: {
        positive_length: 'Sorry, man, this social initiative is supposed only for girls have very very deep craves. I cannot make your big bro even longer :(',
      },
    },
    import: {
      description: 'Import dicks from other bots',
      result: {
        titles: {
          imported: 'The following users have been imported:',
          already_present: 'The following users were already imported earlier:',
          not_found: 'The following users are not in the game yet:',
        },
        line: {
          imported: '➖ <b>%{name}</b> (<i>%{length}</i> cm)',
          already_present: '➖ <b>%{name}</b> (<i>%{length}</i> cm)',
          not_found: '➖ <b>%{name}</b>',
        },
      },
      errors: {
        not_admin: 'This command is supposed to be used by admins only!',
        bot_not_admin: 'To import data from other bots, I also need admin rights in this chat — otherwise I won\'t be able to read their messages. Grant me admin rights and try again.',
        not_reply: 'You must reply to a non-forwarded message sent by any of %{origin_bots}',
        nothing_found: 'Couldn\'t find any leaderboard entries in that message.',
        ambiguous_names: 'Can\'t import: players can\'t be told apart by name. That bot shows only a name in its leaderboard, so names have to be unique.\n\nAmbiguous names: %{names}',
        legacy_group: 'Import doesn\'t work in this chat — it\'s a Telegram limitation: in basic (non-super) groups a bot can\'t read messages from other bots, even as an admin. Convert the group to a supergroup (e.g. by setting a public link in the group settings) and run the import again.\n\nImportant: after converting, don\'t reply to old messages sent before the conversion — Telegram won\'t deliver such replies to the bot at all. Ask for the leaderboard to be posted again and reply to the new message.',
        too_many_members: 'Import is only allowed in chats with 10 or fewer members: competitor bots\' leaderboards show just the top 10, so importing here would be unfair to everyone else.',
        invalid_lines: {
          template: 'Couldn\'t parse this message 🤔\nThe following lines are invalid:\n%{invalid_lines}',
          line: '➖ <b>%{line}</b>',
        },
      },
    },
    promo: {
      description: 'Activate a promo code',
      request: 'Enter a promo code:',
      success: {
        template: 'You has activated this promo code successfully! %{ending}',
        grown: {
          singular: 'Your dick has grown by <b>%{growth}</b> cm in one chat.',
          plural: 'Your dick has grown by <b>%{growth}</b> cm in <b>%{affected_chats}</b> chats!',
        },
        shrunk: {
          singular: 'Your dick has shrunk by <b>%{growth}</b> cm in one chat.',
          plural: 'Your dick has shrunk by <b>%{growth}</b> cm in <b>%{affected_chats}</b> chats!',
        },
      },
      errors: {
        not_found: 'I\'m so sorry but there\'s no such promo code 😞',
        not_started: 'This promo code isn\'t active yet — come back a bit later ⏳',
        expired: 'This promo code has expired 😞',
        exhausted: 'This promo code exists, but every activation of it has already been used up 😞',
        invalid_format: 'That doesn\'t look like a promo code 🤔 They are 3 to 16 characters long: letters, digits, hyphens and underscores.',
        already_activated: 'It seems you already used this promocode earlier 🤨',
        no_dicks: 'It seems you don\'t have any dicks yet. 🤔 Right now is the time to add me into a chat and execute the <code>/grow</code> command!',
      },
      inline: {
        switch_button: 'Activate promo code \'%{code}\'…',
      },
      confirmation: {
        text: '⚠️ Careful! This promo code doesn\'t grow your dick — it <b>shrinks</b> it by <b>%{length}</b> cm in every chat you play in (<b>%{chats}</b>). Activate it anyway?',
        buttons: {
          confirm: 'Yes, shrink it',
          cancel: 'No, thanks',
        },
        cancelled: 'Fine, the promo code wasn\'t activated 😌',
      },
    },
    shrinks: {
      description: 'Who\'s been shrinking lately',
    },
    admin: {
      usage: 'Admin commands:\n/ban <code>uid days</code>\n/unban <code>uid</code>\n/promo_add <code>code bonus capacity [days]</code>\n/promo_list\n/sync_commands',
      banned: 'User <code>%{uid}</code> is banned until %{date}.',
      unbanned: 'User <code>%{uid}</code> is unbanned.',
      promo_added: 'Promo code <code>%{code}</code>: %{bonus} cm, %{capacity} activations, valid from %{since} until %{until}.',
      promo_exists: 'Promo code <code>%{code}</code> already exists.',
      promo_line: '<code>%{code}</code>: %{bonus} cm, %{capacity} left, %{since} — %{until}',
      promo_none: 'There are no promo codes yet.',
      forever: 'forever',
      commands_synced: 'The command menu is updated: %{count} lists.',
      invalid: 'Invalid arguments.',
    },
  },
  inline: {
    results: {
      text: 'Since I cannot determine the chat by an inline query, you should click on the button below to get the result.',
      text_legacy_group: 'This group is not a supergroup, so I can\'t recognize it from an inline query — press the button below to get the result.\n\nThe button will be needed every time. Better yet, add the bot to the chat: then the plain commands will do, and as soon as anyone presses a button of mine there, the inline results will count towards the same score.',
      button: 'Click me!',
      titles: {
        grow: 'Grow your dick!',
        top: 'Get the biggest dicks of the chat',
        dick_of_day: 'Elect the Dick of a Day',
        pvp: 'Challenge others with a bet of %{bet} cm!',
        stats: 'Win statistics',
        loan: 'Minus? Take a loan!',
        shrinks: 'See recent shrinks',
      },
    },
    callback: {
      errors: {
        another_user: 'This message was sent by another person.',
        invalid_data: 'Possibly this message was sent via an older version of the bot. Try to resend it again.',
        unknown_data: 'Unknown command',
        no_data: 'Something went wrong…',
      },
    },
  },
  titles: {
    greeting: 'Hello',
    time_till_next_day: {
      none: ' Come back tomorrow!',
      some: '\n\nNext attempt in <b>%{hours}</b>h <b>%{minutes}</b>m.',
    },
    perks: {
      top_line: 'The following perks affected the result',
      'help-pussies': {
        name: 'deep hole',
      },
      'loan-payout': {
        name: 'micro-loaner',
      },
      streak: {
        name: 'day after day',
        note: '%{days} days in a row',
        next_grade: '+%{next_bonus} from day %{next_day}',
      },
    },
  },
  errors: {
    forbidden_topic_callback: 'I don\'t work in this topic.',
    forbidden_topic: 'I don\'t work in this topic. An administrator can change that with /topics.',
    not_group_chat: 'This bot is supposed to do its mission in group chats only!',
    group_account: 'You can\'t play on behalf of a group or channel — switch off anonymous mode and try again!',
    feature_disabled: 'This feature is currently temporarily disabled.',
    banned: 'You can\'t play until %{date}. Write via /support if you think it\'s a mistake.',
    banned_inline_title: 'You are blocked',
    rate_limited: 'Too many requests! Take a break and try again in a minute.',
    rate_limited_inline_title: 'Too many requests',
  },
  help: {
    intro: 'Do you want to have the biggest dick in the world? I\'m sure you do. Just /grow it once a day in every chat you\'re in! Get on the top of the leaderboard!\n\nThe growth range for the command is between <b>%{grow_min}</b> and <b>%{grow_max}</b> cm. Use the /top command to show the top of the biggest weapons in a chat.',
    streak: 'Playing on days in a row pays off: on days <b>%{grades}</b> of a streak your bonus grows by a centimetre, and from then on it is added to every change in length, a negative one included. Miss a day, and the streak starts over.',
    shrink: 'A dick that hasn\'t been grown for %{days} days shrinks a little every day, and the chat is told who lost how much. /shrinks shows it again.',
    dod: 'Also, there is a daily election of <i>the Dick of the Day</i> in every chat with /dod. This title brings its owner some bonus centimeters additionally. Only active players who have grown their cucumber at least once in the last week participate in the election.',
    pvp: 'If you want to make your little bro even longer and are ready to take some risk for it, fight with your friends. Just place a bet via the /pvp command! The winner gets the specified number of centimeters, the loser loses theirs. It\'s simple.',
    promo: 'Activate promo codes for extra centimetres with the /promo command in a private chat.',
    import: '<b>Wait, I already know similar bots in Telegram and have a very big thing there…</b>\n\nUsing the /import command, sent as a reply to a message from another bot describing positions of the users in its top, any administrator of a chat may import already existing cocks. Currently, the following bots are supported: %{bots}.\n\nFor import to be done successfully, a player must already have a dick in this bot! Both lengths will be summed, so no progress is lost. Also, the bot must be granted temporary administrator privileges to be able to read the message of the other bot.',
    inline: '<b>The administrator of the chat doesn\'t allow to add unknown bots?</b>\n\nThere is a way to play without the bot being in a chat at all! Just use inline queries: type the username of the bot after the <code>@</code> sign and a trailing space to get the same commands!',
    loan: '<b>For those who are stuck very deep below minus</b>\n\nUse the /loan command to reset your little sis to zero on credit: <b>%{payout}</b> of each subsequent growth goes to pay it off.',
    help_pussies: 'Also, every growth of yours is increased by <b>%{percentage}</b> of the "debt".',
    contacts: '<b>Contacts and links</b>\n\nThe bot is based on DickGrowerBot by kozalosev and runs on Telegram Serverless. Its source code is available under a modified MIT license that forbids using it for competitor bots or any commercial profit: %{repo}',
    contacts_support: 'In case of any problems, send my owner a message with the /support command.',
  },
  privacy: {
    text: 'Here is what I store, and why:\n\n1️⃣ Your Telegram ID and name — to show the top and the results of battles;\n2️⃣ The date I first saw you — newcomers get a grace period of growth without shrinks;\n3️⃣ The IDs of chats — so that every chat has its dicks of its own, both via commands and inline mode;\n4️⃣ Per chat: the lengths, the time of the last growth, loans, the statistics of battles and the streak of days in a row;\n5️⃣ A log of the Dick of the Day winners, the imports from other bots, the promo code activations and the shrinks;\n6️⃣ The interface language, if you choose one with /language.\n\nThe data is kept in the bot\'s database on Telegram Serverless, Telegram\'s own infrastructure, and is not given to anybody else. The whole schema is published with the source code: %{repo}',
    contacts_support: 'To have your data deleted or to get a copy of it, write via /support.',
  },
};
