import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import resources from './locales';

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en-US',

    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
  });

(window as any).i18n = i18n; // TODO: REMOVE LATER
