import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, languages } from '../contexts/LanguageContext';
import { HiTranslate } from 'react-icons/hi';
import './LanguageToggle.css';

const LanguageToggle = ({ className = "", showText = false }) => {
  const { language, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Debug current language on mount
  useEffect(() => {
    console.log("LanguageToggle - Current language:", language);
    console.log("LanguageToggle - localStorage language:", localStorage.getItem('language'));
  }, [language]);
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleLanguageChange = (lang) => {
    console.log(`LanguageToggle - Changing to ${lang} from ${language}`);
    
    // Change language through context
    changeLanguage(lang);
    
    // Close dropdown
    setIsOpen(false);
    
    // Removed the forced page reload which was causing logout issues
  };
  
  const languageDisplay = language === languages.EN ? 'EN' : 'БГ';

  return (
    <div className={`language-dropdown ${className}`} ref={dropdownRef}>
      <button 
        className="language-toggle-btn flex items-center" 
        onClick={toggleDropdown}
        title={t('language')}
        aria-label={t('language')}
      >
        <HiTranslate className="language-icon" />
        <span className="language-text ml-1">
          {languageDisplay}
        </span>
        {showText && (
          <span className="ml-2 hidden sm:inline text-sm font-medium">{t('language')}</span>
        )}
      </button>
      
      {/* Dropdown */}
      <div className={`language-dropdown-menu ${isOpen ? 'active' : ''}`}>
        <div className="language-dropdown-content">
          <button
            onClick={() => handleLanguageChange(languages.EN)}
            className={`language-option ${language === languages.EN ? 'active' : ''}`}
          >
            <span className="font-medium mr-2">EN</span>English
          </button>
          <button
            onClick={() => handleLanguageChange(languages.BG)}
            className={`language-option ${language === languages.BG ? 'active' : ''}`}
          >
            <span className="font-medium mr-2">БГ</span>Български
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageToggle; 