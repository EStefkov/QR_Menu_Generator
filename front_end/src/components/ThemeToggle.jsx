import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { HiMoon, HiSun } from 'react-icons/hi';
import './ThemeToggle.css';

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  
  const isDark = theme === 'dark';
  const label = isDark ? t('theme_light') : t('theme_dark');

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle-btn flex items-center p-2 ${className}`}
      title={label}
      aria-label={label}
    >
      {isDark ? (
        <HiSun className="theme-icon sun-icon" />
      ) : (
        <HiMoon className="theme-icon moon-icon" />
      )}
    </button>
  );
};

export default ThemeToggle; 