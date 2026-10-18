import { config, commandEnabled } from '../config.js';
import { daysWordRu, t } from '../i18n.js';
import { escapeHtml, floatPercentage } from '../html.js';
import { shrinkEnabled } from './shrink.js';

export function helpText(lang) {
  const paragraphs = [
    t(lang, 'help.intro', { grow_min: config.growth.min, grow_max: config.growth.max }),
  ];
  if (config.perks.streakGrades.length > 0) {
    paragraphs.push(t(lang, 'help.streak', { grades: config.perks.streakGrades.join(', ') }));
  }
  if (shrinkEnabled()) {
    const days = config.shrink.inactivityDays;
    paragraphs.push(t(lang, 'help.shrink', { days, word_days: daysWordRu(days) }));
  }
  paragraphs.push(t(lang, 'help.dod'), t(lang, 'help.pvp'), t(lang, 'help.promo'));
  if (commandEnabled('import')) {
    paragraphs.push(t(lang, 'help.import', { bots: config.import.bots.map((name) => `@${name}`).join(', ') }));
  }
  paragraphs.push(t(lang, 'help.inline'));
  if (config.loan.payoutRatio > 0 && config.loan.payoutRatio < 1) {
    let loan = t(lang, 'help.loan', { payout: floatPercentage(config.loan.payoutRatio) });
    if (config.perks.helpPussiesRatio > 0) {
      loan += `\n\n${t(lang, 'help.help_pussies', { percentage: floatPercentage(config.perks.helpPussiesRatio) })}`;
    }
    paragraphs.push(loan);
  }
  let contacts = t(lang, 'help.contacts', { repo: escapeHtml(config.links.repo) });
  if (config.supportChatId !== null) contacts += `\n\n${t(lang, 'help.contacts_support')}`;
  paragraphs.push(contacts);
  return paragraphs.join('\n\n');
}

export function startText(name, lang) {
  return `${t(lang, 'titles.greeting')}, <b>${escapeHtml(name)}</b>!\n\n${helpText(lang)}`;
}

export function privacyText(lang) {
  let text = t(lang, 'privacy.text', { repo: escapeHtml(config.links.repo) });
  if (config.supportChatId !== null) text += `\n\n${t(lang, 'privacy.contacts_support')}`;
  return text;
}
