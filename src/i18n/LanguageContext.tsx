import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { translations, Language } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

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

const detectLangFromBrowser = (): Language => {
  const browserLang = navigator.language?.slice(0, 2).toLowerCase();
  if (browserLang === 'fr') return 'fr';
  if (browserLang === 'ru') return 'ru';
  return 'en';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('yat-language');
    if (saved) return saved as Language;
    return detectLangFromBrowser();
  });

  // Geolocation-based language detection (only if user has not made a manual choice)
  useEffect(() => {
    if (localStorage.getItem('yat-language')) return;
    if (localStorage.getItem('yat-language-geo-tried')) return;

    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled || !data?.country_code) return;
        const mapped = COUNTRY_TO_LANG[data.country_code as string];
        if (mapped) {
          setLanguageState(mapped);
          localStorage.setItem('yat-language', mapped);
        }
      })
      .catch(() => { /* ignore */ })
      .finally(() => {
        clearTimeout(timeout);
        localStorage.setItem('yat-language-geo-tried', '1');
      });

    return () => { cancelled = true; controller.abort(); clearTimeout(timeout); };
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('yat-language', lang);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string>) => {
    let value = translations[language]?.[key] || translations['en']?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, v);
      });
    }
    return value;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
