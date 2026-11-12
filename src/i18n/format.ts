import { enUS, fr, ru, type Locale } from 'date-fns/locale';
import { currentLanguage } from './index';
import type { Language } from './types';

const TAGS: Record<Language, string> = { en: 'en-US', fr: 'fr-FR', ru: 'ru-RU' };
const DATE_FNS: Record<Language, Locale> = { en: enUS, fr, ru };

/** BCP 47 tag of the active language, for toLocaleDateString / Intl.* */
export const localeTag = (): string => TAGS[currentLanguage()];

/** date-fns locale of the active language, for format() / formatDistanceToNow(). */
export const dateFnsLocale = (): Locale => DATE_FNS[currentLanguage()];
