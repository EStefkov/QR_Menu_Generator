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
      
      // Debug translation access
      const currentTranslations = translations[lang] || {};
      console.log("Translation structure check:", {
        hasCommonObject: !!currentTranslations.common,
        hasBackToManagerKey: !!currentTranslations['common.backToManagerDashboard'],
        commonObjectKeys: currentTranslations.common ? Object.keys(currentTranslations.common) : [],
        nestedBackToManager: currentTranslations.common ? currentTranslations.common.backToManagerDashboard : null
      });
      
      // Set language in state
      setLanguage(lang);
      
      // Also update localStorage directly for immediate effect
      localStorage.setItem('language', lang);
      
      // Update document attributes 
      document.documentElement.lang = lang;
      document.documentElement.setAttribute('lang', lang);
      
      // Force re-render for components that might not be directly subscribed to context
      if (i18n.isInitialized) {
        i18n.changeLanguage(lang);
      }
      
      console.log(`Language changed successfully to: ${lang}`, { 
        localStorage: localStorage.getItem('language'),
        documentLang: document.documentElement.lang
      });
    } else {
      console.warn(`Invalid language code: ${lang}`);
    }
  };

  // Translation function
  const t = (key) => {
    // If the key doesn't exist in the current language, fall back to English
    const currentTranslations = translations[language] || {};
    const fallbackTranslations = translations[languages.EN] || {};
    
    // First try direct key access (for flat keys like in Bulgarian)
    const directTranslation = currentTranslations[key];
    if (directTranslation) return directTranslation;
    
    // Then try nested key access if the key contains dots
    if (key.includes('.')) {
      const parts = key.split('.');
      
      // Try accessing nested structure
      let currentValue = currentTranslations;
      let fallbackValue = fallbackTranslations;
      
      // Traverse the nested structure
      for (const part of parts) {
        currentValue = currentValue && typeof currentValue === 'object' ? currentValue[part] : undefined;
        fallbackValue = fallbackValue && typeof fallbackValue === 'object' ? fallbackValue[part] : undefined;
      }
      
      if (currentValue) return currentValue;
      if (fallbackValue) return fallbackValue;
      
      // If nested approach fails, try flat access with the dotted key as fallback
      const flatKeyFallback = currentTranslations[key] || fallbackTranslations[key];
      if (flatKeyFallback) return flatKeyFallback;
    }
    
    // Fall back to English for simple keys
    const fallbackTranslation = fallbackTranslations[key];
    
    // If still not found, return the key itself as a last resort
    return fallbackTranslation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider; 