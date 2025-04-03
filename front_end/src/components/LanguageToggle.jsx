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
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
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
            onClick={() => {
              changeLanguage(languages.EN);
              setIsOpen(false);
            }}
            className={`language-option ${language === languages.EN ? 'active' : ''}`}
          >
            <span className="font-medium mr-2">EN</span>English
          </button>
          <button
            onClick={() => {
              changeLanguage(languages.BG);
              setIsOpen(false);
            }}
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