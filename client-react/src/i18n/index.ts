import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import resources from './locales';

const languageDetector = new LanguageDetector(null, {
  caches: ['localStorage', 'cookie'],
});

export const SUPPORTED_LANGUAGES = Object.keys(resources);

i18n
  .use(languageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en-US',
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: 'Common',

    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
  });

(window as any).i18n = i18n; // TODO: REMOVE LATER
