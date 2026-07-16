import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './index';
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
 * LanguageProvider keeps the geolocation-based first-visit detection.
 * i18next itself is initialized in ./index and bound globally via initReactI18next,
 * so no I18nextProvider is required here.
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Geolocation-based language detection (only if the user has not made a manual choice)
  useEffect(() => {
    if (localStorage.getItem('yat-language')) return;
    if (localStorage.getItem('yat-language-geo-tried')) return;

    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.country_code) return;
        const mapped = COUNTRY_TO_LANG[data.country_code as string];
        if (mapped) {
          // changeLanguage persists to localStorage via the language detector cache.
          i18n.changeLanguage(mapped);
        }
      })
      .catch(() => { /* ignore */ })
      .finally(() => {
        clearTimeout(timeout);
        localStorage.setItem('yat-language-geo-tried', '1');
      });

    return () => { cancelled = true; controller.abort(); clearTimeout(timeout); };
  }, []);

  return <>{children}</>;
};

/**
 * Drop-in replacement for the previous custom hook. Same shape { t, language, setLanguage }
 * so no consumer needs to change. `t` supports the existing {param} interpolation.
 */
export const useLanguage = () => {
  const { t: i18nT, i18n: instance } = useTranslation();

  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    let value = i18nT(key) as string;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, v);
      }
    }
    return value;
  };

  return {
    t,
    language: (instance.resolvedLanguage || instance.language) as Language,
    setLanguage: (lang: Language) => {
      instance.changeLanguage(lang);
    },
  };
};
