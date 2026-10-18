export default {
  commands: {
    help: {
      description: '有什么问题吗',
    },
    language: {
      description: '更改界面语言',
      prompt: '请选择你的语言：',
      success: '完成！你的语言偏好已保存。',
      errors: {
        unsupported: '抱歉，不支持这种语言。请试试：🇬🇧 en、🇷🇺 ru、🇮🇹 it、🇮🇷 fa、🇨🇳 zh。',
        admins_only: '只有群管理员才能更改群聊语言。',
      },
      chat: {
        prompt: '请为整个群聊选择语言：',
        success: '完成！现在我会用这种语言回复本群所有人。',
        reset: '完成！群聊语言已清除 —— 我会重新按每个人自己的语言回复。',
        auto_button: '🌐 自动（各自的语言）',
      },
    },
    topics: {
      description: '选择我在哪些话题里干活',
      state: {
        unrestricted: '本群<b>所有话题</b>我都干活。',
        allowed_here: '我<b>在这个话题里干活</b>。允许我出没的话题共 <b>%{count}</b> 个。',
        forbidden_here: '我<b>不在这个话题里干活</b>。允许我出没的话题共 <b>%{count}</b> 个。',
      },
      buttons: {
        only_here: '🔒 只在这个话题里干活',
        allow_here: '✅ 允许在这个话题',
        forbid_here: '🚫 禁止在这个话题',
        allow_everywhere: '🌍 所有话题都允许',
      },
      errors: {
        not_a_forum: '本群没有话题，没什么可以限制我的。',
        admins_only: '只有群管理员才能选择我在哪些话题里干活。',
      },
    },
    privacy: {
      description: '存储数据说明详见隐私政策，',
    },
    support: {
      description: '联系机器人主人',
      request: '请写下你的留言，我会转交给我的主人。发送任意命令即可取消。',
      sent: '留言已发送。我会在私聊中把回复转给你。',
      cancelled: '请求已取消。',
      too_often: '你刚刚已经发过留言了，请等一分钟再发。',
      reply_button: '↩️ 回复',
      answered: '✅ 已送达。',
      answer_failed: '无法送达回复：该用户已屏蔽我，或从未与我开始私聊。',
    },
    grow: {
      description: '让你的丁丁变大！',
      result: '你的丁丁已经<b>%{incr} 厘米</b> %{event}，现在长度为<b>%{length} 厘米</b>。',
      direction: {
        grown: '增长了',
        shrunk: '缩短了',
      },
      position: '你在排行榜上的位置是<b>%{pos}</b>。',
      tomorrow: '你今天已经玩过你的丁丁了。',
    },
    top: {
      description: '获取聊天中最大的丁丁',
      title: '最大的丁丁排行榜：',
      line: '%{n}|<b>%{name}</b> — <b>%{length}</b> 厘米',
      ending: '<i>[+] 表示一个牛子怪今天还没有增长他的丁丁。</i>',
      ending_inactive: '<i>[~] 表示一个牛子怪超过 %{days} 天没有增长他的丁丁了。</i>',
      empty: '还没有人加入游戏 :(',
    },
    shrink: {
      notification: {
        header: '✂️ <b>该修剪被忽视的了！</b> 这些屌 %{days}+ 天没长还缩水了一点：',
        line: '— <b>%{name}</b> 缩了 <b>%{lost}</b> 厘米（现在 <b>%{length}</b> 厘米）',
      },
      recent: {
        header: '✂️ <b>最近都是谁缩水了：</b>',
        line: '— <b>%{name}</b> 缩了 <b>%{lost}</b> 厘米',
      },
      empty: '安静……最近没人缩水。看来大家都跟上节奏了 💪',
    },
    dod: {
      description: '选举今日丁丁',
      result: '今日丁丁是<b><a href="tg://user?id=%{uid}">%{name}</a></b>！\n\n他的丁丁增长了<b>%{growth} 厘米</b>，现在长度为<b>%{length}</b> 厘米。',
      position: '他在排行榜上的位置是<b>%{pos}</b>。',
      already_chosen: '今日丁丁已经被选出来了！是<b>%{name}</b>。',
      no_candidates: '没有候选人可以选举。在这个聊天中还没有人加入游戏 😢',
    },
    pvp: {
      description: '斗鸡！',
      results: {
        start: '<b>%{name}</b> 向聊天发起了一个<b>%{bet} 厘米</b>的挑战！',
        finish: '胜利者是<b>%{winner_name}</b>！他的丁丁现在长度为<b>%{winner_length} 厘米</b>。失败者的丁丁长度为<b>%{loser_length}</b>。\n赌注是<b>%{bet} 厘米</b>。',
        position: {
          winner: '<b>%{name}</b> 在排行榜上的位置是<b>%{pos}</b>。',
          loser: '<b>%{name}</b> 在排行榜上的位置是<b>%{pos}</b>。',
        },
        stats: {
          text: '<b>胜利者</b>的胜率 — <b>%{winner_win_rate}</b>。\n他当前的连胜 — <b>%{winner_win_streak}</b>，最大连胜 — <b>%{winner_win_streak_max}</b>。\n<b>失败者</b>的胜率 — <b>%{loser_win_rate}</b>。',
          lost_win_streak: '<b>%{lost_win_streak}</b> 连胜被终结了。',
        },
        withheld: '<b>%{payout} 厘米</b> 从胜利者那里被扣留以偿还贷款。',
      },
      button: '斗鸡！',
      errors: {
        no_args: '发起斗鸡要下注。',
        not_enough: {
          initiator: '呃。发起者的丁丁不够长，无法下这么大的赌注！',
          acceptor: '你的枪不够长 😣',
        },
        same_person: '你不能和自己斗鸡！',
        battle_already_in_progress: '已经在斗鸡！结果立等可取',
      },
    },
    stats: {
      description: '统计',
      length: '长度: <b>%{length}</b>\n在排行榜上的位置: <b>%{pos}</b>',
      streak: '连续天数: <b>%{current}</b>\n最长连续增长次数: <b>%{max}</b>',
      pvp: '胜率: <b>%{win_rate}</b>。\n战斗次数: <b>%{battles}</b>。\n胜利次数: <b>%{wins}</b>。\n最大连胜: <b>%{win_streak}</b>。\n获得长度: <b>%{acquired} 厘米</b>。\n失去长度: <b>%{lost} 厘米</b>。',
      personal: '<i>你的个人统计:</i>\n— 你参与的游戏聊天数量: <b>%{chats}</b>。\n— 最大长度: <b>%{max_length}</b>。\n— 所有聊天中的丁丁总长度: <b>%{total_length}</b>。',
    },
    loan: {
      description: '负数？申请贷款！',
      debt: '还需偿还 <b>%{debt} 厘米</b>',
      confirmation: {
        text: '你的浦西将被重置为零，但每次增长将减少 <b>%{payout_percentage}</b>，直到偿还所有 <b>%{debt} 厘米</b>。',
        buttons: {
          agree: '我同意！',
          disagree: '不同意',
        },
      },
      callback: {
        success: '小额贷款已成功发放！',
        refused: '患者拒绝了信用性别重置。',
        payout_ratio_changed: '自你发送贷款申请以来，支付率已更改。请重新调用该命令。',
      },
      errors: {
        positive_length: '抱歉，兄弟，这个提案只针对那些有非常非常深渴望的女孩。我不能让你的大兄弟变得更长 :(',
      },
    },
    import: {
      description: '从其他机器人导入丁丁',
      result: {
        titles: {
          imported: '以下用户已被导入：',
          already_present: '以下用户之前已被导入：',
          not_found: '以下用户尚未加入游戏：',
        },
        line: {
          imported: '➖ <b>%{name}</b> (<i>%{length}</i> 厘米)',
          already_present: '➖ <b>%{name}</b> (<i>%{length}</i> 厘米)',
          not_found: '➖ <b>%{name}</b>',
        },
      },
      errors: {
        not_admin: '此命令仅供管理员使用！',
        bot_not_admin: '要导入其他机器人的数据，我也需要在这个聊天中拥有管理员权限——否则我将无法读取它们的消息。请给我管理员权限后重试。',
        not_reply: '你必须回复由 %{origin_bots} 发送的非转发消息',
        nothing_found: '这条消息中没有找到排行榜条目。',
        ambiguous_names: '无法导入：无法仅凭名字区分这些玩家。那个机器人在排行榜中只显示名字，因此名字必须是唯一的。\n\n有歧义的名字：%{names}',
        legacy_group: '此聊天无法导入——这是 Telegram 的限制：在普通群组（非超级群组）中，机器人即使是管理员也无法读取其他机器人发送的消息。请将群组转换为超级群组（例如在群组设置中设置公开链接），然后重新导入。\n\n重要提示：转换之后，请不要回复转换之前发送的旧消息——Telegram 根本不会把这类回复发送给机器人。请让排行榜重新发一次，然后回复新消息。',
        too_many_members: '仅允许在成员不超过 10 人的聊天中导入：竞品机器人的排行榜只显示前 10 名，在此导入对其他人不公平。',
        invalid_lines: {
          template: '无法解析此消息 🤔\n以下行无效：\n%{invalid_lines}',
          line: '➖ <b>%{line}</b>',
        },
      },
    },
    promo: {
      description: '激活神秘代码',
      request: '输入神秘代码：',
      success: {
        template: '你已成功激活此神秘代码！%{ending}',
        grown: {
          singular: '你的丁丁在一个聊天中增长了 <b>%{growth}</b> 厘米。',
          plural: '你的丁丁在 <b>%{affected_chats}</b> 个聊天中增长了 <b>%{growth}</b> 厘米！',
        },
        shrunk: {
          singular: '你的丁丁在一个聊天中缩短了 <b>%{growth}</b> 厘米。',
          plural: '你的丁丁在 <b>%{affected_chats}</b> 个聊天中缩短了 <b>%{growth}</b> 厘米！',
        },
      },
      errors: {
        not_found: '没有这个神秘代码 😞',
        not_started: '这个神秘代码还没有生效，请稍后再试 ⏳',
        expired: '这个神秘代码已经过期了 😞',
        exhausted: '这个神秘代码的名额已经用完了 😞',
        invalid_format: '这看起来不像神秘代码 🤔 它由 3 到 16 个字符组成：字母、数字、连字符和下划线。',
        already_activated: '神秘代码已经激活过了 🤨',
        no_dicks: '看起来你还没有任何丁丁。🤔 现在是时候把我加入一个聊天并执行 <code>/grow</code> 命令了！',
      },
      inline: {
        switch_button: '激活神秘代码 \'%{code}\'…',
      },
      confirmation: {
        text: '⚠️ 小心！这个神秘代码不会让你的丁丁变长——它会在你参与的每个聊天中（<b>%{chats}</b> 个）让它<b>缩短</b> <b>%{length}</b> 厘米。仍然要激活吗？',
        buttons: {
          confirm: '是的，缩短吧',
          cancel: '不了，谢谢',
        },
        cancelled: '好的，神秘代码没有激活 😌',
      },
    },
    shrinks: {
      description: '最近谁缩短了',
    },
  },
  inline: {
    results: {
      text: '由于我无法通过内联查询确定聊天，你应该点击下面的按钮以获取结果。',
      text_legacy_group: '这个群组不是超级群组，所以我无法通过内联查询识别它——请点击下面的按钮获取结果。\n\n每次都需要点这个按钮。更好的办法是把机器人加进群：这样普通命令就够用了，而且只要有人在那里按下我的任意按钮，内联结果也会计入同一个排行。',
      button: '点我！',
      titles: {
        grow: '让你的丁丁变大！',
        top: '获取聊天中最大的丁丁',
        dick_of_day: '选举今日丁丁',
        pvp: '用 %{bet} 厘米的赌注挑战其他人！',
        stats: '胜利统计',
        loan: '负数？申请贷款！',
        shrinks: '查看最近的缩水',
      },
    },
    callback: {
      errors: {
        another_user: '此消息由其他人发送。',
        invalid_data: '可能此消息是通过旧版本的机器人发送的。请尝试重新发送。',
        unknown_data: '未知命令',
        no_data: '出了点问题…',
      },
    },
  },
  titles: {
    greeting: '你好',
    time_till_next_day: {
      none: ' 回去玩丁丁，明天再来！',
      some: '\n\n下次尝试在 <b>%{hours}</b>小时 <b>%{minutes}</b>分钟后。',
    },
    perks: {
      top_line: '以下特权影响了结果',
      'help-pussies': {
        name: '深洞',
      },
      'loan-payout': {
        name: '小贷人员',
      },
      streak: {
        name: '日复一日',
        note: '连续 %{days} 天',
        next_grade: '第 %{next_day} 天起 +%{next_bonus}',
      },
    },
  },
  errors: {
    forbidden_topic_callback: '我不在这个话题里干活。',
    forbidden_topic: '我不在这个话题里干活。管理员可以用 /topics 更改。',
    not_group_chat: '此机器人仅在群聊中执行任务！',
    group_account: '不能以群组或频道的身份游玩——请关闭匿名模式后重试！',
    feature_disabled: '此功能当前暂时禁用。',
    banned: '你在 %{date} 之前无法游玩。如果你认为这是误判，请用 /support 联系我们。',
    banned_inline_title: '你已被封禁',
    rate_limited: '请求过多！请稍作休息，一分钟后再试。',
    rate_limited_inline_title: '请求过多',
  },
  help: {
    intro: '你想拥有世界上最大的丁丁吗？我相信你想。只需在你所在的每个群里每天用一次 /grow 让它长大！登上排行榜的顶端！\n\n这个命令的增长范围在 <b>%{grow_min}</b> 到 <b>%{grow_max}</b> 厘米之间。使用 /top 命令查看群里最大武器的排行。',
    streak: '连续每天玩是有回报的：在连续第 <b>%{grades}</b> 天，你的奖励会增加一厘米，并且从那时起加到每一次长度变化上，包括负的变化。漏掉一天，连续记录就会重新开始。',
    shrink: '%{days} 天没有长大的丁丁每天都会缩短一点，群里会知道谁损失了多少。/shrinks 会再次显示。',
    dod: '此外，每个群每天都可以用 /dod 选出<i>今日之屌</i>。这个称号会给它的主人额外的厘米奖励。只有在过去一周内至少长过一次黄瓜的活跃玩家才能参加评选。',
    pvp: '如果你想让你的小兄弟变得更长并且愿意为此冒险，就和朋友们战斗吧。只需用 /pvp 命令下注！胜者获得指定的厘米数，败者失去相同的数量。就这么简单。',
    promo: '在私聊中用 /promo 命令激活兑换码，获得额外的厘米。',
    import: '<b>等等，我已经在 Telegram 里玩过类似的机器人，在那里我的可大了……</b>\n\n任何群管理员都可以用 /import 命令回复另一个机器人展示排行榜的消息，导入已有的丁丁。目前支持以下机器人：%{bots}。\n\n要成功导入，玩家必须已经在这个机器人里有丁丁！两个长度会相加，所以不会失去任何进度。此外，必须临时授予机器人管理员权限，它才能读取另一个机器人的消息。',
    inline: '<b>群管理员不允许添加陌生的机器人？</b>\n\n不把机器人加进群也能玩！使用内联查询：在 <code>@</code> 符号后输入机器人的用户名和一个空格，就能看到同样的命令！',
    loan: '<b>给那些深陷负数的人</b>\n\n用 /loan 命令赊账把你的小妹妹归零：之后每次增长的 <b>%{payout}</b> 用于还款。',
    help_pussies: '此外，你的每次增长都会额外增加“债务”的 <b>%{percentage}</b>。',
    contacts: '<b>联系方式和链接</b>\n\n本机器人基于 kozalosev 的 DickGrowerBot，运行在 Telegram Serverless 上。其源代码以一个修改过的 MIT 许可证发布，禁止将其用于竞争性机器人或任何商业牟利：%{repo}',
    contacts_support: '如果遇到任何问题，请用 /support 命令给我的主人发消息。',
  },
  privacy: {
    text: '以下是我保存的内容及原因：\n\n1️⃣ 你的 Telegram ID 和名字——用于显示排行榜以及战斗的结果；\n2️⃣ 我第一次见到你的日期——新玩家有一段只增长不缩短的宽限期；\n3️⃣ 群组的 ID——让每个群都有自己的丁丁，无论是通过命令还是内联模式；\n4️⃣ 每个群的：长度、上次增长的时间、贷款、战斗统计以及连续天数；\n5️⃣ 今日之屌获胜者、从其他机器人的导入、兑换码激活和缩短的记录；\n6️⃣ 界面语言，如果你用 /language 选择了的话。\n\n数据保存在机器人位于 Telegram Serverless（Telegram 自己的基础设施）上的数据库中，不会提供给任何其他人。完整的数据库结构与源代码一起公开：%{repo}',
    contacts_support: '如需删除你的数据或获取一份副本，请通过 /support 联系。',
  },
  bot: {
    description: '🍆 群里谁的最大？把我加进群，每天用 /grow 让丁丁长大，冲上 /top 排行榜，成为今日之屌，用 /pvp 和朋友下注对战，并保持连续天数。也支持内联模式：在任何聊天中输入我的用户名即可。',
    short_description: '群聊游戏：每天让丁丁长大，登上排行榜，和朋友对战。',
  },
};
