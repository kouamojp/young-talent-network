import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { Language, TranslationKey } from './types';

/**
 * Internationalisation de YAT (i18next + react-i18next).
 *
 * - Trois langues : en, fr, ru. Un fichier JSON par langue dans ./locales,
 *   avec des clés plates à points (« settings.title »).
 * - Seule la langue active est téléchargée (import dynamique) : `initI18n()`
 *   doit avoir fini avant le premier rendu (voir src/main.tsx).
 * - `tr(key, params)` traduit partout : composants, hooks, constantes de
 *   module, fonctions utilitaires. Changer de langue recharge la page, ce qui
 *   garantit que tout (constantes comprises) repart dans la nouvelle langue.
 * - Les clés sont typées (TranslationKey) : une clé inconnue est une erreur
 *   TypeScript. `npm run i18n:check` vérifie que les trois fichiers ont les
 *   mêmes clés et qu'il ne reste aucun texte en dur.
 */

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr', 'ru'];
export const DEFAULT_LANGUAGE: Language = 'en';
const STORAGE_KEY = 'yat-language';

const loaders: Record<Language, () => Promise<{ default: Record<string, string> }>> = {
  en: () => import('./locales/en.json'),
  fr: () => import('./locales/fr.json'),
  ru: () => import('./locales/ru.json'),
};

const isSupported = (value: unknown): value is Language =>
  typeof value === 'string' && (SUPPORTED_LANGUAGES as string[]).includes(value);

/** Saved choice first, then the browser languages, then English. */
export function detectLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isSupported(saved)) return saved;
  } catch { /* storage blocked */ }
  const candidates = typeof navigator !== 'undefined' ? [...(navigator.languages || []), navigator.language] : [];
  for (const c of candidates) {
    const short = (c || '').slice(0, 2).toLowerCase();
    if (isSupported(short)) return short;
  }
  return DEFAULT_LANGUAGE;
}

let initPromise: Promise<void> | null = null;

/** Loads the active language and initialises i18next. Safe to call several times. */
export function initI18n(language: Language = detectLanguage()): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const { default: resources } = await loaders[language]();
      await i18n.use(initReactI18next).init({
        lng: language,
        resources: { [language]: { translation: resources } },
        fallbackLng: false,
        supportedLngs: SUPPORTED_LANGUAGES,
        keySeparator: false, // keys like "sidebar.profile" are literal
        nsSeparator: false,
        interpolation: { escapeValue: false }, // React already escapes
        returnNull: false,
      });
      if (typeof document !== 'undefined') document.documentElement.lang = language;
    })();
  }
  return initPromise;
}

export const currentLanguage = (): Language =>
  isSupported(i18n.language) ? i18n.language : DEFAULT_LANGUAGE;

/**
 * Saves the choice and reloads the page so that every text, including
 * module-level constants built with `tr()`, is rendered in the new language.
 */
export function changeLanguage(language: Language) {
  if (!isSupported(language) || language === currentLanguage()) return;
  try { localStorage.setItem(STORAGE_KEY, language); } catch { /* storage blocked */ }
  window.location.reload();
}

/**
 * Translates a key. Usable anywhere (no hook needed).
 * Placeholders use braces: tr('greeting', { name }) with "Hello {name}".
 */
export function tr(key: TranslationKey, params?: Record<string, string | number | null | undefined>): string {
  let value = i18n.t(key as string) as string;
  if (params) {
    for (const [name, replacement] of Object.entries(params)) {
      value = value.split(`{${name}}`).join(replacement == null ? '' : String(replacement));
    }
  }
  return value;
}

export default i18n;
