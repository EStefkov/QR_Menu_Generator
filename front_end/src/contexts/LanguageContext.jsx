import React, { createContext, useState, useContext, useEffect } from 'react';
import i18n from 'i18next';

// Import languages - we'll create these files next
import enTranslations from '../translations/en';
import bgTranslations from '../translations/bg';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

// Available languages
export const languages = {
  EN: 'en',
  BG: 'bg'
};

// Translations object
const translations = {
  [languages.EN]: enTranslations,
  [languages.BG]: bgTranslations
};

export const LanguageProvider = ({ children }) => {
  // Get initial language from localStorage or default to Bulgarian
  const getInitialLanguage = () => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && Object.values(languages).includes(savedLanguage)) {
      return savedLanguage;
    }
    
    // Try to match browser language
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (browserLang === 'bg') return languages.BG;
    
    return languages.BG; // Default to Bulgarian
  };

  const [language, setLanguage] = useState(getInitialLanguage);

  // Update localStorage and i18n when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    
    // Change i18next language
    i18n.changeLanguage(language);
  }, [language]);

  // Change language
  const changeLanguage = (lang) => {
    if (Object.values(languages).includes(lang)) {
      setLanguage(lang);
    }
  };

  // The t function is now provided by useTranslation from react-i18next
  // We keep this for backward compatibility with existing code
  const t = (key) => {
    return i18n.t(key);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider; 