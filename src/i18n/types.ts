import type en from './locales/en.json';

export type Language = 'en' | 'fr' | 'ru';

/** Every valid translation key, derived from the English locale (source of truth). */
export type TranslationKey = keyof typeof en;
