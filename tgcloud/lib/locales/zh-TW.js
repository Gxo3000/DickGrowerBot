export default {
  commands: {
    language: {
      description: '變更介面語言',
      prompt: '請選擇你的語言：',
      success: '完成！你的語言偏好已儲存。',
      errors: {
        unsupported: '抱歉，不支援這種語言。請試試：🇬🇧 en、🇷🇺 ru、🇮🇹 it、🇮🇷 fa、🇨🇳 zh。',
        admins_only: '只有群組管理員才能變更群組語言。',
      },
      chat: {
        prompt: '請為整個群組選擇語言：',
        success: '完成！現在我會用這種語言回覆本群所有人。',
        reset: '完成！群組語言已清除 —— 我會重新依每個人自己的語言回覆。',
        auto_button: '🌐 自動（各自的語言）',
      },
    },
    support: {
      description: '聯絡機器人主人',
      request: '請寫下你的留言，我會轉交給我的主人。發送任意指令即可取消。',
      sent: '留言已發送。我會在私聊中把回覆轉給你。',
      cancelled: '請求已取消。',
      too_often: '你剛剛已經發過留言了，請等一分鐘再發。',
      reply_button: '↩️ 回覆',
      answered: '✅ 已送達。',
      answer_failed: '無法送達回覆：該使用者已封鎖我，或從未與我開始私聊。',
    },
    grow: {
      result: '你的老二已經<b>%{incr} 公分</b> %{event}，現在長度為<b>%{length} 公分</b>。',
      direction: {
        grown: '增長了',
        shrunk: '縮短了',
      },
      position: '你在排行榜上的位置是<b>%{pos}</b>。',
      tomorrow: '你今天已經玩過你的老二了。',
    },
    top: {
      title: '最大的老二排行榜：',
      line: '%{n}|<b>%{name}</b> — <b>%{length}</b> 公分',
      ending: '<i>[+] 表示一個成長者今天還沒有增長他的老二。</i>',
      ending_inactive: '<i>[~] 表示一個成長者超過 %{days} 天沒有增長他的老二了。</i>',
      empty: '還沒有人加入遊戲 :(',
    },
    shrink: {
      notification: {
        header: '✂️ <b>該修剪被忽視的了！</b> 這些屌 %{days}+ 天沒長還縮水了一點：',
        line: '— <b>%{name}</b> 縮了 <b>%{lost}</b> 公分（現在 <b>%{length}</b> 公分）',
      },
      recent: {
        header: '✂️ <b>最近都是誰縮水了：</b>',
        line: '— <b>%{name}</b> 縮了 <b>%{lost}</b> 公分',
      },
      empty: '安靜……最近沒人縮水。看來大家都跟上節奏了 💪',
    },
    dod: {
      result: '今日老二是<b><a href="tg://user?id=%{uid}">%{name}</a></b>！\n\n他的老二增長了<b>%{growth} 公分</b>，現在長度為<b>%{length}</b> 公分。',
      position: '他在排行榜上的位置是<b>%{pos}</b>。',
      already_chosen: '今日老二已經被選出來了！是<b>%{name}</b>。',
      no_candidates: '沒有候選人可以選舉。在這個聊天中還沒有人加入遊戲 😢',
    },
    pvp: {
      results: {
        start: '<b>%{name}</b> 向聊天發起了一個<b>%{bet} 公分</b>的挑戰！',
        finish: '勝利者是<b>%{winner_name}</b>！他的老二現在長度為<b>%{winner_length} 公分</b>。失敗者的老二長度為<b>%{loser_length}</b>。\n賭注是<b>%{bet} 公分</b>。',
        position: {
          winner: '<b>%{name}</b> 在排行榜上的位置是<b>%{pos}</b>。',
          loser: '<b>%{name}</b> 在排行榜上的位置是<b>%{pos}</b>。',
        },
        stats: {
          text: '<b>勝利者</b>的勝率 — <b>%{winner_win_rate}</b>。\n他當前的連勝 — <b>%{winner_win_streak}</b>，最大連勝 — <b>%{winner_win_streak_max}</b>。\n<b>失敗者</b>的勝率 — <b>%{loser_win_rate}</b>。',
          lost_win_streak: '<b>%{lost_win_streak}</b> 連勝被終結了。',
        },
        withheld: '<b>%{payout} 公分</b> 從勝利者那裡被扣留以償還貸款。',
      },
      button: 'PK！',
      errors: {
        no_args: '發起PK要下注。',
        not_enough: {
          initiator: '呃。發起者的老二不夠長，無法下這麼大的賭注！',
          acceptor: '你的老二不夠長 😣',
        },
        same_person: '你不能和自己PK！',
        battle_already_in_progress: '已經在對戰了！結果稍後就會更新……',
      },
    },
    stats: {
      length: '長度: <b>%{length}</b>\n在排行榜上的位置: <b>%{pos}</b>',
      streak: '連續天數: <b>%{current}</b>\n最長連續增長次數: <b>%{max}</b>',
      pvp: '勝率: <b>%{win_rate}</b>。\n戰鬥次數: <b>%{battles}</b>。\n勝利次數: <b>%{wins}</b>。\n最大連勝: <b>%{win_streak}</b>。\n獲得長度: <b>%{acquired} 公分</b>。\n失去長度: <b>%{lost} 公分</b>。',
      personal: '<i>你的個人統計:</i>\n— 你參與的遊戲聊天數量: <b>%{chats}</b>。\n— 最大長度: <b>%{max_length}</b>。\n— 所有聊天中的老二總長度: <b>%{total_length}</b>。',
      pve: '冒險：<b>%{adventures}</b> 次，勝利 <b>%{won}</b> 次。\n對首領的傷害：<b>%{damage}</b>，最後一擊：<b>%{kills}</b> 次。\nPvE 收益：<b>%{earned} 公分</b>。',
    },
    loan: {
      debt: '還需償還 <b>%{debt} 公分</b>',
      confirmation: {
        text: '你的長度將重設為零，但每次增長將減少 <b>%{payout_percentage}</b>，直到償還所有 <b>%{debt} 公分</b>。',
        buttons: {
          agree: '我同意！',
          disagree: '不同意',
        },
      },
      callback: {
        success: '小額貸款已成功發放！',
        refused: '拒絕了信用變性方案。',
        payout_ratio_changed: '自你發送貸款申請以來，支付率已更改。請重新調用該命令。',
      },
      errors: {
        positive_length: '抱歉，兄弟，這個提案只針對那些有非常非常深渴望的女孩。我不能讓你的大兄弟變得更長 :(',
      },
    },
    import: {
      result: {
        titles: {
          imported: '以下使用者已被導入：',
          already_present: '以下使用者之前已被導入：',
          not_found: '以下使用者尚未加入遊戲：',
        },
        line: {
          imported: '➖ <b>%{name}</b> (<i>%{length}</i> 公分)',
          already_present: '➖ <b>%{name}</b> (<i>%{length}</i> 公分)',
          not_found: '➖ <b>%{name}</b>',
        },
      },
      errors: {
        not_admin: '此命令僅供管理員使用！',
        bot_not_admin: '要匯入其他機器人的資料，我也需要在這個聊天中擁有管理員權限——否則我將無法讀取它們的訊息。請給我管理員權限後重試。',
        not_reply: '你必須回覆由 %{origin_bots} 發送的非轉發訊息',
        nothing_found: '在這則訊息中找不到排行榜項目。',
        ambiguous_names: '無法匯入：無法僅憑名字區分這些玩家。那個機器人在排行榜中只顯示名字，因此名字必須是唯一的。\n\n有歧義的名字：%{names}',
        legacy_group: '此聊天無法匯入——這是 Telegram 的限制：在普通群組（非超級群組）中，機器人即使是管理員也無法讀取其他機器人發送的訊息。請將群組轉換為超級群組（例如在群組設定中設定公開連結），然後重新匯入。\n\n重要提示：轉換之後，請不要回覆轉換之前發送的舊訊息——Telegram 根本不會把這類回覆傳給機器人。請讓排行榜重新發一次，然後回覆新訊息。',
        too_many_members: '僅允許在成員不超過 10 人的聊天中導入：競品機器人的排行榜只顯示前 10 名，在此導入對其他人不公平。',
        invalid_lines: {
          template: '無法解析此訊息 🤔\n以下行無效：\n%{invalid_lines}',
          line: '➖ <b>%{line}</b>',
        },
      },
    },
    promo: {
      request: '輸入神秘代碼：',
      success: {
        template: '你已成功啟用此神秘代碼！%{ending}',
        grown: {
          singular: '你的老二在一個聊天中增長了 <b>%{growth}</b> 公分。',
          plural: '你的老二在 <b>%{affected_chats}</b> 個聊天中增長了 <b>%{growth}</b> 公分！',
        },
        shrunk: {
          singular: '你的老二在一個聊天中縮短了 <b>%{growth}</b> 公分。',
          plural: '你的老二在 <b>%{affected_chats}</b> 個聊天中縮短了 <b>%{growth}</b> 公分！',
        },
      },
      errors: {
        not_found: '沒有這個神秘代碼 😞',
        not_started: '這個神秘代碼還沒有生效，請稍後再試 ⏳',
        expired: '這個神秘代碼已經過期了 😞',
        exhausted: '這個神秘代碼的名額已經用完了 😞',
        invalid_format: '這看起來不像神秘代碼 🤔 它由 3 到 16 個字元組成：字母、數字、連字號和底線。',
        already_activated: '神秘代碼已經啟用過了 🤨',
        no_dicks: '看起來你還沒有任何老二。🤔 現在是時候把我加入一個聊天並執行 <code>/grow</code> 命令了！',
      },
      inline: {
        switch_button: '啟用神秘代碼 \'%{code}\'…',
      },
      confirmation: {
        text: '⚠️ 小心！這個神秘代碼不會讓你的老二變長——它會在你參與的每個聊天中（<b>%{chats}</b> 個）讓它<b>縮短</b> <b>%{length}</b> 公分。仍然要啟用嗎？',
        buttons: {
          confirm: '是的，縮短吧',
          cancel: '不了，謝謝',
        },
        cancelled: '好的，神秘代碼沒有啟用 😌',
      },
    },
    topics: {
      description: '選擇我在哪些主題裡幹活',
      state: {
        unrestricted: '本群<b>所有主題</b>我都幹活。',
        allowed_here: '我<b>在這個主題裡幹活</b>。允許我出沒的主題共 <b>%{count}</b> 個。',
        forbidden_here: '我<b>不在這個主題裡幹活</b>。允許我出沒的主題共 <b>%{count}</b> 個。',
      },
      buttons: {
        only_here: '🔒 只在這個主題裡幹活',
        allow_here: '✅ 允許在這個主題',
        forbid_here: '🚫 禁止在這個主題',
        allow_everywhere: '🌍 所有主題都允許',
      },
      errors: {
        not_a_forum: '本群沒有主題，沒什麼可以限制我的。',
        admins_only: '只有群組管理員才能選擇我在哪些主題裡幹活。',
      },
    },
    shrinks: {
      description: '最近誰縮短了',
    },
    lottery: {
      description: '每日公分彩票',
      status: '🎰 <b>今日彩票</b>\n\n獎池：<b>%{pool} 公分</b>，加上機器人的獎勵共 <b>%{prize} 公分</b>。\n已售彩票：<b>%{tickets}</b>，玩家：<b>%{players}</b>。\n你的彩票：<b>%{mine}</b> / %{max}。\n\n每張彩票 <b>%{price} 公分</b>。彩票越多，機會越大。UTC 午夜後開獎，還剩 <b>%{hours}</b> 小時 <b>%{minutes}</b> 分鐘。',
      last_won: '上一期：<b>%{name}</b> 贏得了 <b>%{prize} 公分</b>。',
      last_refunded: '上一期因玩家不足而取消，彩票已退款。',
      buttons: {
        buy: '🎟 購買 ×%{count}（%{cost} 公分）',
        refresh: '🔄 重新整理',
      },
      bought: '你買了 %{count} 張彩票，現在共有 %{mine} 張。',
      errors: {
        not_enough: '你的丁丁太短了：需要 %{cost} 公分。',
        limit: '每天最多只能買 %{max} 張彩票。',
        no_dick: '先用 /grow 讓你的丁丁長起來！',
      },
      draw: {
        won: '🎰 <b>%{date} 的彩票已開獎！</b>\n\n獲勝者是 <b>%{name}</b>，持有 %{total} 張中的 %{tickets} 張。<b>%{prize} 公分</b> 的獎品歸他所有，現在他的丁丁長 <b>%{length} 公分</b>。',
        refunded: '🎰 %{date} 的彩票已取消：至少需要 %{min} 名玩家。所有人的公分都已退回。',
      },
    },
    boss: {
      description: '團隊首領：和全群一起打敗它',
      kinds: {
        shrinker: '✂️ 偉大的縮短者',
        frost: '🥶 冰霜巨人',
        vacuum: '🌀 虛空吸塵器',
        crab: '🦀 鋼鐵螃蟹',
        cucumber: '🥒 變異黃瓜',
      },
      status: '%{boss} <b>（等級 %{level}）</b>\n❤️ %{bar} <b>%{hp}/%{max_hp}</b>\n\n擊敗獎勵：<b>%{reward} 公分</b>，按造成的傷害分配；最後一擊額外獲得 <b>+%{last_hit} 公分</b>。\n每人每 %{cooldown} 分鐘可攻擊一次。首領將在 <b>%{hours}</b> 小時 <b>%{minutes}</b> 分鐘後逃跑。',
      raiders_title: '參戰者：',
      raider_line: '%{n}. <b>%{name}</b> — %{damage}',
      buttons: {
        hit: '⚔️ 攻擊！',
        refresh: '🔄 重新整理',
      },
      hit: '⚔️ <b>%{name}</b> 對首領造成了 <b>%{damage}</b> 點傷害。',
      crit: '💥 爆擊！',
      counter: '首領反擊了：<b>%{name}</b> 失去了 <b>%{lost} 公分</b>。',
      cooldown: '你正在喘口氣。%{minutes} 分鐘後才能再次攻擊。',
      no_dick: '先用 /grow 讓你的丁丁長起來！',
      gone: '這個首領已經不在了。',
      defeated: '🏆 <b>%{boss}（等級 %{level}）被擊敗了！</b> 最後一擊來自 <b>%{killer}</b>。\n\n獎勵：\n%{rewards}\n\n下一個首領明天到來。',
      reward_line: '— <b>%{name}</b>：+%{reward} 公分（傷害 %{damage}）',
      escaped: '💨 %{boss}（等級 %{level}）逃跑了——團隊沒來得及擊敗它。',
      resting: '今天的首領已被擊敗。下一個將在 <b>%{hours}</b> 小時 <b>%{minutes}</b> 分鐘後到來。',
    },
    adventure: {
      description: '冒險：每天獨自挑戰一隻怪物',
      choose: '🗺 <b>%{name}</b>，今天去哪兒？\n\n🟢 <b>簡單</b> — 勝率 %{easy_chance}：+%{easy_reward} 或 −%{easy_penalty} 公分\n🟡 <b>普通</b> — %{medium_chance}：+%{medium_reward} 或 −%{medium_penalty} 公分\n🔴 <b>困難</b> — %{hard_chance}：+%{hard_reward} 或 −%{hard_penalty} 公分，戰利品中可能還有一次額外的 /grow',
      buttons: {
        easy: '🟢 簡單',
        medium: '🟡 普通',
        hard: '🔴 困難',
      },
      difficulty: {
        easy: '一次簡單的',
        medium: '一次普通的',
        hard: '一次困難的',
      },
      monsters: {
        easy: ['一隻野鼠', '一個瞌睡的哥布林', '一隻憤怒的鵝', '一團史萊姆'],
        medium: ['一個沼澤巨魔', '一個獸人掠奪者', '一隻巨型蜘蛛', '一個狼人'],
        hard: ['一條龍', '一個巫妖', '一隻克拉肯', '黃瓜之王'],
      },
      won: '⚔️ <b>%{name}</b> 踏上了%{difficulty}冒險，打敗了%{monster}！戰利品：<b>+%{reward} 公分</b>，現在丁丁長 <b>%{length} 公分</b>。',
      lost: '🩸 <b>%{name}</b> 踏上了%{difficulty}冒險，但%{monster}更強。失去了 <b>%{penalty} 公分</b>，現在丁丁長 <b>%{length} 公分</b>。',
      bonus_attempt: '🎁 怪物掉落了一次額外的 /grow 機會！它會一直留到你需要的時候。',
      already: '你今天已經冒險過了。',
      no_dick: '先用 /grow 讓你的丁丁長起來！',
    },
  },
  inline: {
    results: {
      text: '由於我無法透過內聯查詢確定聊天，你應該點擊下面的按鈕以取得結果。',
      text_legacy_group: '這個群組不是超級群組，所以我無法透過內聯查詢識別它——請點擊下面的按鈕取得結果。\n\n每次都需要點這個按鈕。更好的辦法是把機器人加進群：這樣普通指令就夠用了，而且只要有人在那裡按下我的任意按鈕，內聯結果也會計入同一個排行。',
      button: '點我！',
      titles: {
        grow: '讓你的老二變大！',
        top: '取得聊天中最大的老二',
        dick_of_day: '選出今日老二',
        pvp: '用 %{bet} 公分的賭注挑戰其他人！',
        stats: '勝利統計',
        loan: '負數？申請貸款！',
        shrinks: '查看最近的縮水',
        lottery: '今日彩票',
        boss: '團隊首領',
        adventure: '去冒險',
      },
    },
    callback: {
      errors: {
        another_user: '此訊息由其他人發送。',
        invalid_data: '可能此訊息是透過舊版本的機器人發送的。請嘗試重新發送。',
        unknown_data: '未知命令',
        no_data: '出了點問題…',
      },
    },
  },
  titles: {
    greeting: '你好',
    time_till_next_day: {
      none: ' 回去玩老二，明天再來！',
      some: '\n\n下次嘗試在 <b>%{hours}</b>小時 <b>%{minutes}</b>分鐘後。',
    },
    perks: {
      top_line: '以下特權影響了結果',
      'help-pussies': {
        name: '深洞',
      },
      'loan-payout': {
        name: '貸款人',
      },
      streak: {
        name: '日復一日',
        note: '連續 %{days} 天',
        next_grade: '第 %{next_day} 天起 +%{next_bonus}',
      },
    },
  },
  errors: {
    forbidden_topic_callback: '我不在這個主題裡幹活。',
    forbidden_topic: '我不在這個主題裡幹活。管理員可以用 /topics 更改。',
    not_group_chat: '此機器人僅在群聊中執行任務！',
    group_account: '不能以群組或頻道的身份遊玩——請關閉匿名模式後重試！',
    feature_disabled: '此功能當前暫時禁用。',
    banned: '你在 %{date} 之前無法遊玩。如果你認為這是誤判，請用 /support 聯絡我們。',
    banned_inline_title: '你已被封鎖',
    rate_limited: '請求過多！請稍作休息，一分鐘後再試。',
    rate_limited_inline_title: '請求過多',
  },
  help: {
    intro: '你想擁有世界上最大的丁丁嗎？我相信你想。只需在你所在的每個群裡每天用一次 /grow 讓它長大！登上排行榜的頂端！\n\n這個指令的增長範圍在 <b>%{grow_min}</b> 到 <b>%{grow_max}</b> 公分之間。使用 /top 指令查看群裡最大武器的排行。',
    streak: '連續每天玩是有回報的：在連續第 <b>%{grades}</b> 天，你的獎勵會增加一公分，並且從那時起加到每一次長度變化上，包括負的變化。漏掉一天，連續紀錄就會重新開始。',
    shrink: '%{days} 天沒有長大的丁丁每天都會縮短一點，群裡會知道誰損失了多少。/shrinks 會再次顯示。',
    dod: '此外，每個群每天都可以用 /dod 選出<i>今日之屌</i>。這個稱號會給它的主人額外的公分獎勵。只有在過去一週內至少長過一次黃瓜的活躍玩家才能參加評選。',
    pvp: '如果你想讓你的小兄弟變得更長並且願意為此冒險，就和朋友們戰鬥吧。只需用 /pvp 指令下注！勝者獲得指定的公分數，敗者失去相同的數量。就這麼簡單。',
    adventure: '⚔️ <b>PvE。</b> 每天可以進行一次 /adventure：選擇簡單、普通或困難的怪物。越難，戰利品越多——可能失去的也越多。',
    boss: '和全群一起挑戰團隊首領——/boss。每人每 %{cooldown} 分鐘可以攻擊一次，丁丁越長攻擊越強，但首領會反擊。首領倒下時，獎勵按造成的傷害分配，最後一擊還有額外獎勵。%{lifetime} 天內沒被擊敗的首領會逃跑。',
    lottery: '🎰 <b>彩票。</b> 每個群每天都有 /lottery：每張彩票 <b>%{price} 公分</b>，每天最多 %{max} 張。UTC 午夜後開獎——彩票越多，機會越大——獲勝者拿走整個獎池，外加機器人 %{bonus} 的獎勵。玩家少於 %{min} 人時彩票退款。',
    promo: '在私聊中用 /promo 指令啟用兌換碼，獲得額外的公分。',
    import: '<b>等等，我已經在 Telegram 裡玩過類似的機器人，在那裡我的可大了……</b>\n\n任何群管理員都可以用 /import 指令回覆另一個機器人展示排行榜的訊息，匯入已有的丁丁。目前支援以下機器人：%{bots}。\n\n要成功匯入，玩家必須已經在這個機器人裡有丁丁！兩個長度會相加，所以不會失去任何進度。此外，必須暫時授予機器人管理員權限，它才能讀取另一個機器人的訊息。',
    inline: '<b>群管理員不允許添加陌生的機器人？</b>\n\n不把機器人加進群也能玩！使用內聯查詢：在 <code>@</code> 符號後輸入機器人的使用者名稱和一個空格，就能看到同樣的指令！',
    loan: '<b>給那些深陷負數的人</b>\n\n用 /loan 指令賒帳把你的小妹妹歸零：之後每次增長的 <b>%{payout}</b> 用於還款。',
    help_pussies: '此外，你的每次增長都會額外增加「債務」的 <b>%{percentage}</b>。',
    contacts: '<b>聯絡方式和連結</b>\n\n本機器人基於 kozalosev 的 DickGrowerBot，運行在 Telegram Serverless 上。其原始碼以一個修改過的 MIT 授權發布，禁止將其用於競爭性機器人或任何商業牟利：%{repo}',
    contacts_support: '如果遇到任何問題，請用 /support 指令給我的主人發訊息。',
  },
  privacy: {
    text: '以下是我保存的內容及原因：\n\n1️⃣ 你的 Telegram ID 和名字——用於顯示排行榜以及戰鬥、團隊戰和彩票的結果；\n2️⃣ 我第一次見到你的日期——新玩家有一段只增長不縮短的寬限期；\n3️⃣ 群組的 ID——讓每個群都有自己的丁丁，無論是透過指令還是內聯模式；\n4️⃣ 每個群的：長度、上次增長的時間、貸款、戰鬥和 PvE 統計、彩票以及連續天數；\n5️⃣ 今日之屌獲勝者、從其他機器人的匯入、兌換碼啟用和縮短的紀錄；\n6️⃣ 介面語言，如果你用 /language 選擇了的話。\n\n資料保存在機器人位於 Telegram Serverless（Telegram 自己的基礎設施）上的資料庫中，不會提供給任何其他人。完整的資料庫結構與原始碼一起公開：%{repo}',
    contacts_support: '如需刪除你的資料或取得一份副本，請透過 /support 聯絡。',
  },
};
