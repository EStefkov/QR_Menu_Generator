import React, { createContext, useState, useContext, useEffect } from 'react';
import i18n from 'i18next';

// Import languages
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
  // Get initial language from localStorage or browser language preference
  const getInitialLanguage = () => {
    // First check localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && Object.values(languages).includes(savedLanguage)) {
      console.log(`Using saved language from localStorage: ${savedLanguage}`);
      return savedLanguage;
    }
    
    // Then try to match browser language
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    console.log(`Detected browser language: ${browserLang}`);
    
    if (browserLang === 'bg') {
      console.log('Using Bulgarian from browser preference');
      return languages.BG;
    }
    
    if (browserLang === 'en') {
      console.log('Using English from browser preference');
      return languages.EN;
    }
    
    // Default to English if no match
    console.log('No language match found, defaulting to English');
    return languages.EN;
  };

  const [language, setLanguage] = useState(getInitialLanguage);

  // Update localStorage and i18n when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.setAttribute('lang', language);
    
    // Change i18next language if i18n is initialized
    if (i18n.isInitialized) {
      i18n.changeLanguage(language);
    }
    
    console.log(`Language set to: ${language}`);
  }, [language]);

  // Change language
  const changeLanguage = (lang) => {
    if (Object.values(languages).includes(lang)) {
      console.log(`Changing language to: ${lang}`);
      setLanguage(lang);
    } else {
      console.warn(`Invalid language code: ${lang}`);
    }
  };

  // Translation function
  const t = (key) => {
    // If the key doesn't exist in the current language, fall back to English
    const currentTranslations = translations[language] || {};
    const fallbackTranslations = translations[languages.EN] || {};
    
    const translation = currentTranslations[key] || fallbackTranslations[key];
    
    // If still not found, return the key itself as a last resort
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider; 