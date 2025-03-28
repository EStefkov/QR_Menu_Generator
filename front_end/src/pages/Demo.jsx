import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import './Demo.css';

const DemoSection = ({ title, children }) => (
  <div className="demo-section">
    <h3 className="demo-section-title">{title}</h3>
    <div className="demo-section-content">
      {children}
    </div>
  </div>
);

const DemoCard = ({ title, children }) => (
  <div className="demo-card">
    <h4 className="demo-card-title">{title}</h4>
    <div className="demo-card-content">
      {children}
    </div>
  </div>
);

const Demo = () => {
  const { t } = useLanguage();

  return (
    <div className="demo-page">
      <div className="demo-container">
        <div className="demo-header">
          <h1 className="demo-title">{t('demo_title')}</h1>
          <p className="demo-description">{t('demo_description')}</p>
        </div>

        <div className="demo-controls">
          <div className="demo-control-item">
            <h3>{t('demo_theme_title')}</h3>
            <ThemeToggle />
          </div>
          <div className="demo-control-item">
            <h3>{t('demo_language_title')}</h3>
            <LanguageToggle showText={true} />
          </div>
        </div>
        
        <DemoSection title={t('demo_navigation_section')}>
          <div className="demo-grid">
            <DemoCard title={t('nav_home')}>
              <p>{t('home_hero_title_1')} {t('home_hero_title_2')}</p>
              <button className="demo-button primary">{t('home_get_started')}</button>
            </DemoCard>
            
            <DemoCard title={t('nav_menu')}>
              <p>{t('menu_categories')}</p>
              <div className="demo-search">
                <input type="text" placeholder={t('menu_search')} />
                <button className="demo-button">{t('button_submit')}</button>
              </div>
            </DemoCard>
            
            <DemoCard title={t('nav_favorites')}>
              <p>{t('favorites_title')}</p>
              <p className="demo-muted">{t('favorites_empty')}</p>
            </DemoCard>
          </div>
        </DemoSection>
        
        <DemoSection title={t('demo_order_section')}>
          <div className="demo-grid">
            <DemoCard title={t('order_title')}>
              <div className="demo-list">
                <div className="demo-list-item">
                  <span>{t('product_quantity')}: 2</span>
                  <span>{t('product_price')}: $20.00</span>
                </div>
                <div className="demo-total">
                  <strong>{t('order_total')}: $20.00</strong>
                </div>
              </div>
              <button className="demo-button success">{t('order_submit')}</button>
            </DemoCard>
            
            <DemoCard title={t('cart_title')}>
              <p>{t('cart_total')}: $20.00</p>
              <div className="demo-buttons">
                <button className="demo-button danger">{t('cart_remove')}</button>
                <button className="demo-button success">{t('cart_checkout')}</button>
              </div>
            </DemoCard>
            
            <DemoCard title={t('order_success')}>
              <p>{t('order_id')}: #12345</p>
              <p>{t('order_date')}: {new Date().toLocaleDateString()}</p>
              <p>{t('order_status')}: {t('success_checkout')}</p>
            </DemoCard>
          </div>
        </DemoSection>
        
        <DemoSection title={t('demo_login_section')}>
          <div className="demo-grid">
            <DemoCard title={t('login_title')}>
              <div className="demo-form">
                <div className="demo-form-group">
                  <label>{t('login_email')}</label>
                  <input type="email" placeholder="example@mail.com" />
                </div>
                <div className="demo-form-group">
                  <label>{t('login_password')}</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <button className="demo-button primary">{t('login_button')}</button>
              </div>
            </DemoCard>
            
            <DemoCard title={t('register_title')}>
              <div className="demo-form">
                <div className="demo-form-group">
                  <label>{t('register_name')}</label>
                  <input type="text" placeholder="John Doe" />
                </div>
                <div className="demo-form-group">
                  <label>{t('register_email')}</label>
                  <input type="email" placeholder="example@mail.com" />
                </div>
                <button className="demo-button primary">{t('register_button')}</button>
              </div>
            </DemoCard>
          </div>
        </DemoSection>
      </div>
    </div>
  );
};

export default Demo; 