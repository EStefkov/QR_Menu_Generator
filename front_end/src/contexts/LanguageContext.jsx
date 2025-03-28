import React, { createContext, useState, useContext, useEffect } from 'react';

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

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  // Change language
  const changeLanguage = (lang) => {
    if (Object.values(languages).includes(lang)) {
      setLanguage(lang);
    }
  };

  // Get translation for a key
  const t = (key) => {
    if (!translations[language] || !translations[language][key]) {
      // Fallback to English or return the key itself if not found
      return translations[languages.EN]?.[key] || key;
    }
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider; 