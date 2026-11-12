import React, { useEffect } from 'react';
import { changeLanguage, currentLanguage, tr } from './index';
import type { Language, TranslationKey } from './types';

// Country code → language mapping (ISO 3166-1 alpha-2)
const COUNTRY_TO_LANG: Record<string, Language> = {
  // Francophone
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr', CH: 'fr', CA: 'fr',
  SN: 'fr', CI: 'fr', ML: 'fr', BF: 'fr', NE: 'fr', TG: 'fr', BJ: 'fr',
  GN: 'fr', GA: 'fr', CG: 'fr', CD: 'fr', CM: 'fr', MG: 'fr', DZ: 'fr',
  MA: 'fr', TN: 'fr', HT: 'fr', RE: 'fr', GP: 'fr', MQ: 'fr', GF: 'fr',
  PF: 'fr', NC: 'fr', DJ: 'fr', KM: 'fr', VU: 'fr', RW: 'fr', BI: 'fr',
  // Russophone
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru', UA: 'ru', UZ: 'ru', TJ: 'ru',
  AM: 'ru', AZ: 'ru', MD: 'ru', GE: 'ru', TM: 'ru',
};

/**
 * First-visit language detection by country (IP geolocation), used only when
 * the visitor has never chosen a language. i18next itself is initialised in
 * src/main.tsx before the app renders.
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (localStorage.getItem('yat-language')) return;
    if (localStorage.getItem('yat-language-geo-tried')) return;

    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        localStorage.setItem('yat-language-geo-tried', '1');
        if (cancelled || !data?.country_code) return;
        const mapped = COUNTRY_TO_LANG[data.country_code as string];
        // Saves the language and reloads once if it differs from the current one.
        if (mapped) changeLanguage(mapped);
      })
      .catch(() => { localStorage.setItem('yat-language-geo-tried', '1'); })
      .finally(() => clearTimeout(timeout));

    return () => { cancelled = true; controller.abort(); clearTimeout(timeout); };
  }, []);

  return <>{children}</>;
};

/**
 * Hook kept for existing components: { t, language, setLanguage }.
 * `t` is the same function as the global `tr` from '@/i18n'.
 */
export const useLanguage = () => ({
  t: (key: TranslationKey, params?: Record<string, string | number | null | undefined>) => tr(key, params),
  language: currentLanguage(),
  setLanguage: changeLanguage,
});
