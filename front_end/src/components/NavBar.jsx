// NavBar.jsx
import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiShoppingCart } from "react-icons/hi";
import { AuthContext } from "../contexts/AuthContext";
import { validateToken } from "../api/account";
import { useCart } from "../contexts/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";

const BASE_URL = import.meta.env.VITE_API_URL;

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, logout, userUpdating, saveRedirectUrl } = useContext(AuthContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { cart } = useCart();
  const { t, language, changeLanguage } = useLanguage();
  const tokenValidationTimeout = useRef(null);
  
  // Ensure language is properly initialized
  useEffect(() => {
    // Get stored language from localStorage
    const storedLang = localStorage.getItem('language');
    
    // If there's a stored language and it doesn't match current, sync it
    if (storedLang && storedLang !== language) {
      console.log(`Synchronizing language from localStorage: ${storedLang}`);
      changeLanguage(storedLang);
    }
  }, []);
  
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

  // Validate token when component mounts, but skip validation if userUpdating is true
  useEffect(() => {
    // Отменяем предыдущий таймаут, если он существует
    if (tokenValidationTimeout.current) {
      clearTimeout(tokenValidationTimeout.current);
    }

    // Используем setTimeout для добавления задержки перед валидацией токена
    tokenValidationTimeout.current = setTimeout(() => {
      console.log("NavBar: Checking token validation status, userUpdating =", userUpdating);
      
      // Проверяем localStorage на случай, если флаг был установлен другим компонентом
      const isUpdatingFromStorage = localStorage.getItem("userIsUpdating") === "true";
      
      if (isUpdatingFromStorage) {
        console.log("NavBar: Skipping token validation, userIsUpdating flag found in localStorage");
        return;
      }
      
      if (userData?.token && !userUpdating) {
        console.log("NavBar: Validating token");
        validateToken(userData.token)
          .then(() => {
            // Token validation logic
            console.log("NavBar: Token validated successfully");
          })
          .catch((err) => {
            console.error("NavBar: Token validation error:", err);
            logout();
            navigate("/login");
          });
      } else if (userUpdating) {
        console.log("NavBar: Skipping token validation during profile update");
      }
    }, 10000); // Увеличиваем задержку до 10 секунд
    
    // Очистка таймаута при размонтировании компонента
    return () => {
      if (tokenValidationTimeout.current) {
        clearTimeout(tokenValidationTimeout.current);
      }
    };
  }, [userData?.token, logout, navigate, userUpdating]);

  const handleLogin = () => {
    // Save current path for redirecting back after login
    const currentPath = location.pathname;
    if (currentPath !== '/login' && currentPath !== '/register') {
      saveRedirectUrl(currentPath);
    }
    navigate('/login');
  };

  const handleRegister = () => {
    // Save current path for redirecting back after registration
    const currentPath = location.pathname;
    if (currentPath !== '/login' && currentPath !== '/register') {
      saveRedirectUrl(currentPath);
    }
    navigate('/register');
  };

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
            <img 
              src="/logo-transparent-nav-bar.png" 
              alt="QR Menu Logo" 
              className="w-12 h-12"
              onError={(e) => {
                e.target.src = "/vite.svg";  // Fallback to vite logo if custom logo not found
              }}
            />
            <span>QR Menu</span>
          </Link>

          {/* Desktop Navigation - Removed manager and co-manager buttons from middle of nav bar */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Admin specific links could be added here if needed */}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <div className="flex items-center space-x-4 mr-4 md:mr-8">
              <LanguageToggle className="order-2 md:order-none" showText={true} />
            </div>

            {/* User Profile */}
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
                        onError={(e) => {
                          e.target.src = "/logo-transparent.png";
                          e.target.onerror = (e) => { e.target.src = "/vite.svg"; };
                        }}
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
                            to="/profile"
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{t('profile.myProfile')}</span>
                          </Link>
                          
                          {/* Manager Dashboard Link - Only visible for users with ROLE_MANAGER */}
                          {userData.accountType === 'ROLE_MANAGER' && (
                            <Link
                              to="/manager"
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span>{t('nav.managerDashboard') || 'Manager Dashboard'}</span>
                            </Link>
                          )}
                          
                          {/* Co-Manager Dashboard Link - Only visible for users with ROLE_COMANAGER */}
                          {userData.accountType === 'ROLE_COMANAGER' && (
                            <Link
                              to="/comanager"
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span>{t('nav.coManagerDashboard') || 'Co-Manager Dashboard'}</span>
                            </Link>
                          )}
                          
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
                <div className="flex space-x-4 order-4 md:order-none">
                  <button 
                    onClick={handleLogin}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium"
                  >
                    {t('nav_login')}
                  </button>
                  <button 
                    onClick={handleRegister}
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors font-medium"
                  >
                    {t('nav_register')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
