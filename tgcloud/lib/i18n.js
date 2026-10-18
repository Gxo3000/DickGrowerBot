import en from './locales/en.js';
import ru from './locales/ru.js';
import it from './locales/it.js';
import fa from './locales/fa.js';
import zh from './locales/zh.js';
import zhTW from './locales/zh-TW.js';

export const LANGUAGES = ['en', 'ru', 'it', 'fa', 'zh'];

export const LANGUAGE_LABELS = {
  en: '🇬🇧 English',
  ru: '🇷🇺 Русский',
  it: '🇮🇹 Italiano',
  fa: '🇮🇷 فارسی',
  zh: '🇨🇳 中文',
};

const LOCALES = { en, ru, it, fa, zh, 'zh-TW': zhTW };

const FALLBACKS = { 'zh-TW': ['zh', 'en'] };

const TELEGRAM_CODES = {
  en: 'en', ru: 'ru', uk: 'ru', be: 'ru', ky: 'ru', kk: 'ru', ka: 'ru', hy: 'ru',
  it: 'it', fa: 'fa', zh: 'zh',
};

const TRADITIONAL_CHINESE = ['zh-tw', 'zh-hk', 'zh-mo', 'zh-hant'];

// The locale for a Telegram `language_code`, English for anything else.
export function fromTelegram(code) {
  if (!code) return 'en';
  const lower = code.toLowerCase();
  if (TRADITIONAL_CHINESE.some((prefix) => lower.startsWith(prefix))) return 'zh-TW';
  return TELEGRAM_CODES[lower.slice(0, 2)] ?? 'en';
}

export function isSupported(lang) {
  return LANGUAGES.includes(lang);
}

export function t(lang, key, params = {}) {
  const value = lookup(lang, key);
  if (typeof value !== 'string') {
    return key;
  }
  return value.replace(/%\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
}

export function list(lang, key) {
  const value = lookup(lang, key);
  return Array.isArray(value) ? value : [];
}

// Russian has three forms of "day"; the other locales don't use the parameter.
export function daysWordRu(n) {
  const lastTwo = n % 100;
  const last = n % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return 'дней';
  if (last === 1) return 'день';
  if (last >= 2 && last <= 4) return 'дня';
  return 'дней';
}

function lookup(lang, key) {
  for (const candidate of [lang, ...(FALLBACKS[lang] ?? []), 'en']) {
    const value = key.split('.').reduce((node, part) => node?.[part], LOCALES[candidate]);
    if (value !== undefined) return value;
  }
  return undefined;
}
