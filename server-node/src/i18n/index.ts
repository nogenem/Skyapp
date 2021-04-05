import i18n from 'i18next';
import { LanguageDetector } from 'i18next-http-middleware';

import resources from './locales';

i18n.use(LanguageDetector).init({
  resources,
  fallbackLng: 'en-US',
  supportedLngs: Object.keys(resources),
  keySeparator: false,
  initImmediate: false,
});

export default i18n;
