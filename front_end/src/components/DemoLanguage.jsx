import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import './DemoLanguage.css';

const DemoLanguage = () => {
  const { t, language } = useLanguage();
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1 className="demo-title">{t('demo_title')}</h1>
        <p className="demo-description">{t('demo_description')}</p>
        <div className="demo-toggles">
          <div className="demo-toggle-container">
            <p>{t('demo_theme_title')}: {isDark ? t('theme_dark') : t('theme_light')}</p>
            <ThemeToggle />
          </div>
          <div className="demo-toggle-container">
            <p>{t('demo_language_title')}: {language.toUpperCase()}</p>
            <LanguageToggle />
          </div>
        </div>
      </div>

      <div className="demo-content">
        <div className="demo-section">
          <h2 className="demo-section-title">{t('demo_navigation_section')}</h2>
          <ul className="demo-list">
            <li className="demo-list-item">{t('nav_home')}</li>
            <li className="demo-list-item">{t('nav_menu')}</li>
            <li className="demo-list-item">{t('nav_favorites')}</li>
            <li className="demo-list-item">{t('nav_cart')}</li>
            <li className="demo-list-item">{t('nav_about')}</li>
          </ul>
        </div>

        <div className="demo-section">
          <h2 className="demo-section-title">{t('demo_order_section')}</h2>
          <p className="demo-text">{t('order_items')}</p>
          <p className="demo-text">{t('order_summary')}</p>
          <button className="demo-button">{t('order_submit')}</button>
        </div>

        <div className="demo-section">
          <h2 className="demo-section-title">{t('demo_login_section')}</h2>
          <p className="demo-text">{t('login_email')}</p>
          <p className="demo-text">{t('login_password')}</p>
          <button className="demo-button">{t('login_button')}</button>
          <p className="demo-text small">{t('login_register_prompt')} <a href="#" className="demo-link">{t('login_register_link')}</a></p>
        </div>
      </div>
    </div>
  );
};

export default DemoLanguage; 