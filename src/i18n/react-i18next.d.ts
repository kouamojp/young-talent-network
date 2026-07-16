import 'react-i18next';
import type en from './locales/en.json';

// Type-safety: make t('key') autocomplete valid keys and error on unknown ones.
// Keys are flat, dotted strings (keySeparator/nsSeparator disabled).
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof en };
    keySeparator: false;
    nsSeparator: false;
  }
}
