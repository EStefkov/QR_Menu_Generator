import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './translations/en';
import bgTranslations from './translations/bg';

// Initialize i18next
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      bg: {
        translation: bgTranslations
      }
    },
    lng: 'bg', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n; 