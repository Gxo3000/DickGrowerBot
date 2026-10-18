export default {
  commands: {
    help: {
      description: 'Ti aiuterò, mio amico',
    },
    language: {
      description: 'Cambia la lingua dell\'interfaccia',
      prompt: 'Scegli la tua lingua:',
      success: 'Fatto! La tua lingua è stata salvata.',
      errors: {
        unsupported: 'Spiacente, questa lingua non è supportata. Prova una di queste: 🇬🇧 en, 🇷🇺 ru, 🇮🇹 it, 🇮🇷 fa, 🇨🇳 zh.',
        admins_only: 'Solo gli amministratori della chat possono cambiare la lingua della chat.',
      },
      chat: {
        prompt: 'Scegli la lingua per tutta questa chat:',
        success: 'Fatto! Ora rispondo a tutti in questa chat nella lingua selezionata.',
        reset: 'Fatto! La lingua della chat è stata azzerata — risponderò di nuovo a ciascuno nella propria lingua.',
        auto_button: '🌐 Auto (lingua di ciascuno)',
      },
    },
    topics: {
      description: 'Scegli gli argomenti in cui il bot lavora',
      state: {
        unrestricted: 'Lavoro in <b>tutti gli argomenti</b> di questa chat.',
        allowed_here: 'Lavoro <b>in questo argomento</b>. Argomenti in cui sono ammesso: <b>%{count}</b>.',
        forbidden_here: '<b>Non lavoro in questo argomento</b>. Argomenti in cui sono ammesso: <b>%{count}</b>.',
      },
      buttons: {
        only_here: '🔒 Lavora solo in questo argomento',
        allow_here: '✅ Permetti in questo argomento',
        forbid_here: '🚫 Vieta in questo argomento',
        allow_everywhere: '🌍 Permetti in tutti gli argomenti',
      },
      errors: {
        not_a_forum: 'Questa chat non ha argomenti, quindi non c\'è nulla a cui limitarmi.',
        admins_only: 'Solo gli amministratori possono scegliere gli argomenti in cui lavoro.',
      },
    },
    privacy: {
      description: 'Informativa sulla privacy che descrive quali dati memorizziamo',
    },
    support: {
      description: 'Scrivi al proprietario del bot',
      request: 'Scrivi il tuo messaggio e lo passerò al mio proprietario. Per annullare, invia un comando qualsiasi.',
      sent: 'Messaggio inviato. Ti porterò la risposta in chat privata.',
      cancelled: 'Richiesta annullata.',
      too_often: 'Hai appena inviato un messaggio. Aspetta un minuto prima del prossimo.',
      reply_button: '↩️ Rispondi',
      answered: '✅ Consegnato.',
      answer_failed: 'Non sono riuscito a consegnare la risposta: l\'utente mi ha bloccato o non ha mai aperto una chat privata con me.',
    },
    grow: {
      description: 'Fai crescere il tuo pene!',
      result: 'Il tuo pene è %{event} di <b>%{incr} cm</b> e ora è lungo <b>%{length} cm</b>.',
      direction: {
        grown: 'cresciuto',
        shrunk: 'rimpicciolito',
      },
      position: 'La tua posizione nella classifica è <b>%{pos}</b>.',
      tomorrow: 'Hai già giocato con il tuo pene oggi.',
    },
    top: {
      description: 'Mostra i peni più grandi del gruppo',
      title: 'Classifica dei peni più grandi:',
      line: '%{n}|<b>%{name}</b> — <b>%{length}</b> cm',
      ending: '<i>[+] significa che un giocatore non ha ancora fatto crescere il suo pene oggi.</i>',
      ending_inactive: '<i>[~] significa che un giocatore non ha fatto crescere il suo pene per più di %{days} giorni.</i>',
      empty: 'Nessuno sta giocando :(',
    },
    shrink: {
      notification: {
        header: '✂️ <b>Ora di potare i trascurati!</b> Questi cazzi non sono cresciuti per %{days}+ giorni e si sono un po\' accorciati:',
        line: '— <b>%{name}</b> ha perso <b>%{lost}</b> cm (ora <b>%{length}</b> cm)',
      },
      recent: {
        header: '✂️ <b>Chi si è accorciato di recente:</b>',
        line: '— <b>%{name}</b> ha perso <b>%{lost}</b> cm',
      },
      empty: 'Silenzio… Nessuno si è accorciato ultimamente. Sembra che tutti tengano il passo 💪',
    },
    dod: {
      description: 'Eleggi il Pene del Giorno',
      result: 'Il Pene del Giorno è <b><a href="tg://user?id=%{uid}">%{name}</a></b>!\n\nIl suo pene è cresciuto di <b>%{growth} cm</b> e ora è lungo <b>%{length}</b> cm.',
      position: 'La sua posizione nella classifica è <b>%{pos}</b>.',
      already_chosen: 'Il Pene del Giorno è già stato scelto oggi! Si tratta di <b>%{name}</b>.',
      no_candidates: 'Non ci sono candidati per l\'elezione, in questo gruppo non gioca nessuno 😢',
    },
    pvp: {
      description: 'Combatti con il pene del tuo amico!',
      results: {
        start: '<b>%{name}</b> ha sfidato il gruppo con una scommessa di <b>%{bet} cm</b>!',
        finish: 'Il vincitore è <b>%{winner_name}</b>! Il suo pene ora è lungo <b>%{winner_length} cm</b>. Quello del giocatore perdente è ora di <b>%{loser_length}</b>.\nLa scommessa era di <b>%{bet} cm</b>.',
        position: {
          winner: 'La posizione nella classifica di <b>%{name}</b> è <b>%{pos}</b>.',
          loser: 'La posizione nella classifica di <b>%{name}</b> è <b>%{pos}</b>.',
        },
        stats: {
          text: 'Tasso di vittoria del <b>vincitore</b> — <b>%{winner_win_rate}</b>.\nLa sua serie di vittorie attuale — <b>%{winner_win_streak}</b>, serie di vittorie massima — <b>%{winner_win_streak_max}</b>.\nTasso di vittoria del <b>perdente</b> — <b>%{loser_win_rate}</b>.',
          lost_win_streak: 'La serie di <b>%{lost_win_streak}</b> vittorie di fila è stata persa.',
        },
        withheld: '<b>%{payout} cm</b> sono stati trattenuti dal vincitore per pagare il debito.',
      },
      button: 'Attacca!',
      errors: {
        no_args: 'Chiama il comando con un numero di centimetri che sei disposto a scommettere.',
        not_enough: {
          initiator: 'Meh. Il pene dello sfidante non è lungo abbastanza per una tale scommessa!',
          acceptor: 'Il tuo membro non è abbastanza lungo 😣',
        },
        same_person: 'Non puoi sfidarti da solo!',
        battle_already_in_progress: 'La battaglia è già in corso! Il messaggio verrà aggiornato in un momento…',
      },
    },
    stats: {
      description: 'Statistiche',
      length: 'Lunghezza: <b>%{length}</b>\nPosizione in classifica: <b>%{pos}</b>',
      streak: 'Giorni di fila: <b>%{current}</b>\nLa serie più lunga di crescite: <b>%{max}</b>',
      pvp: 'Tasso di vittoria: <b>%{win_rate}</b>.\nSfide: <b>%{battles}</b>.\nVittorie: <b>%{wins}</b>.\nSerie di vittorie massima: <b>%{win_streak}</b>.\nLunghezza acquisita: <b>%{acquired} cm</b>.\nLunghezza persa: <b>%{lost} cm</b>.',
      personal: '<i>Le tue statistiche personali:</i>\n— Numero di gruppi in cui giochi: <b>%{chats}</b>.\n— Lunghezza massima raggiunta: <b>%{max_length}</b>.\n— Somma dei tuoi peni in tutti i gruppi: <b>%{total_length}</b>.',
    },
    loan: {
      description: 'Debito? Prendi un prestito!',
      debt: 'Ti rimangono da pagare <b>%{debt} cm</b>',
      confirmation: {
        text: 'Il tuo debito verrà resettato, ma ogni crescita del tuo pene sarà ridotta del <b>%{payout_percentage}</b> finché il debito di <b>%{debt} cm</b> non sarà saldato.',
        buttons: {
          agree: 'Va bene!',
          disagree: 'No, grazie',
        },
      },
      callback: {
        success: 'Il microprestito è stato emesso con successo!',
        refused: 'Il paziente ha rifiutato il cambio di genere per credito.',
        payout_ratio_changed: 'Il tasso di rimborso è stato modificato poiché hai inviato la domanda di prestito. Rimanda il comando.',
      },
      errors: {
        positive_length: 'Mi dispiace, amico, questa iniziativa sociale è pensata solo per ragazze con desideri molto, molto profondi. Non posso far diventare il tuo amico ancora più grande :(',
      },
    },
    import: {
      description: 'Importa peni da altri bot',
      result: {
        titles: {
          imported: 'I seguenti utenti sono stati importati:',
          already_present: 'I seguenti utenti erano già stati importati:',
          not_found: 'I seguenti utenti non sono ancora in gioco:',
        },
        line: {
          imported: '➖ <b>%{name}</b> (<i>%{length}</i> cm)',
          already_present: '➖ <b>%{name}</b> (<i>%{length}</i> cm)',
          not_found: '➖ <b>%{name}</b>',
        },
      },
      errors: {
        not_admin: 'Questo comando può essere utilizzato solo dagli admin!',
        bot_not_admin: 'Per importare i dati da altri bot, ho bisogno anch\'io dei diritti di amministratore in questa chat — altrimenti non potrò leggere i loro messaggi. Concedimi i diritti di amministratore e riprova.',
        not_reply: 'Devi rispondere a un messaggio inviato da uno di %{origin_bots}',
        nothing_found: 'Non ho trovato voci della classifica in questo messaggio.',
        ambiguous_names: 'Importazione impossibile: i giocatori non si distinguono per nome. Quel bot mostra in classifica solo il nome, quindi i nomi devono essere unici.\n\nNomi ambigui: %{names}',
        legacy_group: 'L\'importazione non funziona in questa chat — è una limitazione di Telegram: nei gruppi base (non super) un bot non può leggere i messaggi di altri bot, nemmeno da amministratore. Converti il gruppo in un supergruppo (ad esempio impostando un link pubblico nelle impostazioni del gruppo) e ripeti l\'importazione.\n\nImportante: dopo la conversione, non rispondere a messaggi vecchi inviati prima della conversione — Telegram non consegna al bot questo tipo di risposte. Chiedi che la classifica venga pubblicata di nuovo e rispondi al nuovo messaggio.',
        too_many_members: 'L\'importazione è consentita solo nei gruppi con 10 o meno membri: le classifiche dei bot concorrenti mostrano solo i primi 10, quindi importare qui sarebbe ingiusto nei confronti degli altri.',
        invalid_lines: {
          template: 'Impossibile elaborare questo messaggio 🤔\nLe seguenti linee sono invalide:\n%{invalid_lines}',
          line: '➖ <b>%{line}</b>',
        },
      },
    },
    promo: {
      description: 'Attiva un codice promozionale',
      request: 'Inserisci un codice promozionale:',
      success: {
        template: 'Hai attivato questo codice promozionale con successo! %{ending}',
        grown: {
          singular: 'Il tuo pene è cresciuto di <b>%{growth}</b> cm in un gruppo.',
          plural: 'Il tuo pene è cresciuto di <b>%{growth}</b> cm in <b>%{affected_chats}</b> gruppi!',
        },
        shrunk: {
          singular: 'Il tuo pene si è ridotto di <b>%{growth}</b> cm in un gruppo.',
          plural: 'Il tuo pene si è ridotto di <b>%{growth}</b> cm in <b>%{affected_chats}</b> gruppi!',
        },
      },
      errors: {
        not_found: 'Mi dispiace ma questo codice promozionale non esiste 😞',
        not_started: 'Questo codice promozionale non è ancora attivo — riprova più tardi ⏳',
        expired: 'Questo codice promozionale è scaduto 😞',
        exhausted: 'Mi dispiace, ma questo codice promozionale è già stato utilizzato il numero massimo di volte 😞',
        invalid_format: 'Questo non sembra un codice promozionale 🤔 Sono lunghi da 3 a 16 caratteri: lettere, numeri, trattini e trattini bassi.',
        already_activated: 'Sembra che tu abbia già utilizzato questo codice promozionale 🤨',
        no_dicks: 'Non hai ancora alcun pene. 🤔 Devi aggiungermi ad un gruppo ed eseguire il comando <code>/grow</code>!',
      },
      inline: {
        switch_button: 'Attiva il codice promozionale \'%{code}\'…',
      },
      confirmation: {
        text: '⚠️ Attenzione! Questo codice promozionale non fa crescere il tuo pene — lo <b>accorcia</b> di <b>%{length}</b> cm in ogni gruppo in cui giochi (<b>%{chats}</b>). Vuoi attivarlo lo stesso?',
        buttons: {
          confirm: 'Sì, accorcialo',
          cancel: 'No, grazie',
        },
        cancelled: 'Va bene, il codice promozionale non è stato attivato 😌',
      },
    },
    shrinks: {
      description: 'Chi si è accorciato di recente',
    },
  },
  inline: {
    results: {
      text: 'Clicca il tasto qui sotto per avere il risultato!',
      text_legacy_group: 'Questo gruppo non è un supergruppo, quindi non posso riconoscerlo da una query inline: premi il pulsante qui sotto per ottenere il risultato.\n\nIl pulsante servirà ogni volta. Meglio ancora, aggiungi il bot alla chat: basteranno i comandi normali e, appena qualcuno preme lì un mio pulsante, i risultati inline conteranno per lo stesso punteggio.',
      button: 'Cliccami!',
      titles: {
        grow: 'Fai crescere il tuo pene!',
        top: 'Mostra i peni più grandi del gruppo',
        dick_of_day: 'Eleggi il Pene del Giorno',
        pvp: 'Sfida gli altri con una scommessa di %{bet} cm!',
        stats: 'Statistiche',
        loan: 'Sei in debito? Chiedi un prestito!',
        shrinks: 'Vedi gli accorciamenti recenti',
      },
    },
    callback: {
      errors: {
        another_user: 'Questo messaggio è stato inviato da un\'altra persona.',
        invalid_data: 'Questo messaggio potrebbe essere stato mandato da una vecchia versione del bot. Prova a rimandarlo.',
        unknown_data: 'Comando sconosciuto',
        no_data: 'Qualcosa è andato storto…',
      },
    },
  },
  titles: {
    greeting: 'Ciao',
    time_till_next_day: {
      none: ' Torna domani!',
      some: '\n\nProssimo tentativo tra <b>%{hours}</b>h <b>%{minutes}</b>m.',
    },
    perks: {
      top_line: 'I seguenti vantaggi hanno influenzato il risultato:',
      'help-pussies': {
        name: 'buco profondo',
      },
      'loan-payout': {
        name: 'microdebitore',
      },
      streak: {
        name: 'giorno dopo giorno',
        note: '%{days} giorni di fila',
        next_grade: '+%{next_bonus} dal giorno %{next_day}',
      },
    },
  },
  errors: {
    forbidden_topic_callback: 'Non lavoro in questo argomento.',
    forbidden_topic: 'Non lavoro in questo argomento. Un amministratore può cambiarlo con /topics.',
    not_group_chat: 'Questo bot può svolgere la sua missione solo nei gruppi!',
    group_account: 'Non puoi giocare per conto di un gruppo o canale — disattiva la modalità anonima e riprova!',
    feature_disabled: 'Questa funzione non è al momento disponibile.',
    banned: 'Non puoi giocare fino al %{date}. Se pensi sia un errore, scrivi con /support.',
    banned_inline_title: 'Sei bloccato',
    rate_limited: 'Troppe richieste! Fai una pausa e riprova tra un minuto.',
    rate_limited_inline_title: 'Troppe richieste',
  },
  help: {
    intro: 'Vuoi avere il pisello più grande del mondo? Sono sicuro di sì. Fallo crescere con /grow una volta al giorno in ogni chat in cui sei! Arriva in cima alla classifica!\n\nIl comando fa crescere da <b>%{grow_min}</b> a <b>%{grow_max}</b> cm. Usa /top per vedere la classifica delle armi più grandi della chat.',
    streak: 'Giocare giorno dopo giorno conviene: nei giorni <b>%{grades}</b> di una serie il tuo bonus cresce di un centimetro e da lì in poi si somma a ogni variazione di lunghezza, anche negativa. Salta un giorno e la serie ricomincia.',
    shrink: 'Un pisello che non cresce da %{days} giorni si accorcia un po\' ogni giorno, e la chat viene a sapere chi ha perso quanto. /shrinks lo mostra di nuovo.',
    dod: 'Inoltre, ogni giorno in ogni chat con /dod si elegge <i>il Pisello del Giorno</i>. Il titolo porta al suo proprietario dei centimetri bonus. Partecipano solo i giocatori attivi che hanno fatto crescere il loro cetriolo almeno una volta nell\'ultima settimana.',
    pvp: 'Se vuoi allungare ancora di più il tuo fratellino e sei pronto a rischiare, sfida i tuoi amici. Basta piazzare una scommessa con /pvp! Il vincitore ottiene i centimetri indicati, il perdente li perde. Semplice.',
    promo: 'Attiva i codici promozionali per centimetri extra con il comando /promo in chat privata.',
    import: '<b>Aspetta, conosco già bot simili su Telegram e lì ce l\'ho enorme…</b>\n\nCon il comando /import, inviato in risposta a un messaggio di un altro bot con la sua classifica, qualsiasi amministratore della chat può importare i piselli già esistenti. Al momento sono supportati: %{bots}.\n\nPerché l\'importazione riesca, il giocatore deve già avere un pisello in questo bot! Le due lunghezze si sommano, così nessun progresso va perso. Inoltre il bot deve ricevere temporaneamente i diritti di amministratore per poter leggere il messaggio dell\'altro bot.',
    inline: '<b>L\'amministratore della chat non permette di aggiungere bot sconosciuti?</b>\n\nSi può giocare anche senza il bot nella chat! Usa le query inline: scrivi lo username del bot dopo il segno <code>@</code> e uno spazio per avere gli stessi comandi!',
    loan: '<b>Per chi è finito molto sotto zero</b>\n\nUsa il comando /loan per azzerare la tua sorellina a credito: <b>%{payout}</b> di ogni crescita successiva va a ripagarlo.',
    help_pussies: 'Inoltre, ogni tua crescita aumenta del <b>%{percentage}</b> del «debito».',
    contacts: '<b>Contatti e link</b>\n\nIl bot si basa su DickGrowerBot di kozalosev e gira su Telegram Serverless. Il codice sorgente è disponibile con una licenza MIT modificata che vieta di usarlo per bot concorrenti o per qualsiasi profitto commerciale: %{repo}',
    contacts_support: 'In caso di problemi, scrivi al mio proprietario con il comando /support.',
  },
  privacy: {
    text: 'Ecco cosa conservo e perché:\n\n1️⃣ Il tuo ID Telegram e il tuo nome — per mostrare la classifica e i risultati delle battaglie;\n2️⃣ La data in cui ti ho visto per la prima volta — i nuovi arrivati hanno un periodo di crescita senza accorciamenti;\n3️⃣ Gli ID delle chat — perché ogni chat abbia i suoi piselli, sia con i comandi sia in modalità inline;\n4️⃣ Per ogni chat: le lunghezze, l\'ora dell\'ultima crescita, i prestiti, le statistiche delle battaglie e la serie di giorni consecutivi;\n5️⃣ Un registro dei vincitori del Pisello del Giorno, delle importazioni da altri bot, delle attivazioni dei codici promozionali e degli accorciamenti;\n6️⃣ La lingua dell\'interfaccia, se ne scegli una con /language.\n\nI dati sono conservati nel database del bot su Telegram Serverless, l\'infrastruttura di Telegram stessa, e non vengono dati a nessun altro. L\'intero schema è pubblicato insieme al codice sorgente: %{repo}',
    contacts_support: 'Per far cancellare i tuoi dati o averne una copia, scrivi tramite /support.',
  },
};
