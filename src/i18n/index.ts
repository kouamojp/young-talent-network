import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import fr from './locales/fr.json';
import ru from './locales/ru.json';

// Single flat namespace ("translation") with dotted literal keys.
// keySeparator/nsSeparator are disabled so keys like "sidebar.profile" stay literal.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ru: { translation: ru },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'ru'],
    load: 'languageOnly', // "fr-FR" -> "fr"
    keySeparator: false,
    nsSeparator: false,
    interpolation: {
      escapeValue: false, // React already escapes; {param} handled in the wrapper
    },
    detection: {
      // Reproduces the previous order: saved choice, then browser language.
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'yat-language',
      caches: ['localStorage'],
    },
    react: {
      // Resources are inline/synchronous, so no Suspense boundary is needed.
      useSuspense: false,
    },
    returnNull: false,
  });

export default i18n;
