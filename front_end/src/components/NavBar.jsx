// NavBar.jsx
import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiX, HiShoppingCart } from "react-icons/hi";
import { AuthContext } from "../contexts/AuthContext";
import { validateToken } from "../api/account";
import { useCart } from "../contexts/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

const BASE_URL = import.meta.env.VITE_API_URL;

const NavBar = () => {
  const navigate = useNavigate();
  const { userData, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { cart } = useCart();
  const { t } = useLanguage();
  
  // Calculate total items in cart
  const cartItemCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  useEffect(() => {
    if (userData?.token) {
      validateToken(userData.token)
        .then(() => {
          // Token validation logic
        })
        .catch((err) => {
          console.error("Token validation error:", err);
          logout();
          navigate("/login");
        });
    }
  }, [userData?.token, logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg transition-colors duration-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>QR Menu</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              {t('nav_home')}
            </Link>
            {userData?.accountType === "ROLE_ADMIN" && (
              <Link 
                to="/admin" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                {t('nav_admin')}
              </Link>
            )}
            {userData?.accountType === "ROLE_USER" && (
              <>
                <Link 
                  to="/menus" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  {t('nav_menu')}
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  {t('nav_about')}
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle and Language Toggle with more space before profile on mobile */}
            <div className="flex items-center space-x-4 mr-4 md:mr-8">
              <ThemeToggle className="order-1 md:order-none" />
              <LanguageToggle className="order-2 md:order-none" showText={true} />
            </div>

            {/* User Profile and Mobile Menu Button grouped together on mobile */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* User Menu */}
              {userData?.firstName ? (
                <div className="flex items-center space-x-0 md:space-x-4 order-4 md:order-none">
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {userData.firstName} {userData.lastName}
                  </span>
                  <div className="relative profile-dropdown">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <img
                        src={`${BASE_URL}${userData.profilePicture}`}
                        alt="Profile"
                        className="w-10 h-10 rounded-full border-2 border-blue-500 dark:border-blue-400 hover:border-blue-600 dark:hover:border-blue-300 transition-colors"
                      />
                      <svg 
                        className={`hidden md:block w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                          isProfileOpen ? 'transform rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 border border-gray-200 dark:border-gray-700">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{userData.firstName} {userData.lastName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{userData.mailAddress}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/favorites"
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{t('nav_favorites')}</span>
                          </Link>
                          <Link
                            to="/cart"
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>{t('nav_cart')}</span>
                            {cartItemCount > 0 && (
                              <span className="ml-auto bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {cartItemCount}
                              </span>
                            )}
                          </Link>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                            onClick={handleLogout}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>{t('nav_logout')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex space-x-4 order-4 md:order-none">
                  <Link 
                    to="/login" 
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium"
                  >
                    {t('nav_login')}
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors font-medium"
                  >
                    {t('nav_register')}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors order-5 md:order-none"
                aria-label="Toggle menu"
              >
                {isOpen ? <HiX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="py-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
            <Link 
              to="/" 
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              {t('nav_home')}
            </Link>
            {userData?.accountType === "ROLE_ADMIN" && (
              <Link 
                to="/admin" 
                className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                {t('nav_admin')}
              </Link>
            )}
            {userData?.accountType === "ROLE_USER" && (
              <>
                <Link 
                  to="/menus" 
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  {t('nav_menu')}
                </Link>
                <Link 
                  to="/about" 
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  {t('nav_about')}
                </Link>
                {/* Add Cart link for mobile menu */}
                <Link 
                  to="/cart" 
                  className="flex items-center justify-between py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  <span className="flex items-center">
                    <HiShoppingCart className="w-5 h-5 mr-2" />
                    {t('nav_cart')}
                  </span>
                  {cartItemCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            {userData?.firstName ? (
              <button
                className="w-full text-left py-2 text-red-600 hover:text-red-700 transition-colors font-medium"
                onClick={handleLogout}
              >
                {t('nav_logout')}
              </button>
            ) : (
              <div className="space-y-2 pt-2">
                <Link 
                  to="/login" 
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  {t('nav_login')}
                </Link>
                <Link 
                  to="/register" 
                  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  {t('nav_register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
