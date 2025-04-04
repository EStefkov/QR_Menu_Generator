import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../../api/profileApi';
import AdminProfileContent from './AdminProfileContent';
import UserProfileContent from './UserProfileContent';
import ProfileSettings from './ProfileSettings';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiHome, HiChartPie, HiUser, HiCog, HiLogout, HiShieldCheck, HiRefresh, HiExclamationCircle } from 'react-icons/hi';

const ProfilePage = () => {
  const { userData, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  
  // Check if user is admin from JWT token data or localStorage
  const isAdminFromData = userData?.accountType === 'ROLE_ADMIN' || localStorage.getItem('accountType') === 'ROLE_ADMIN';
  
  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await profileApi.getUserProfile();
      console.log('Successfully fetched profile data:', userData);
      
      // Set user data in localStorage
      if (userData && userData.id) {
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('accountId', userData.id);
      }
      
      if (userData && userData.accountType) {
        localStorage.setItem('accountType', userData.accountType);
      }
      
      setProfileData(userData);
      
      if (userData.accountType === 'ROLE_ADMIN') {
        setIsAdmin(true);
        fetchAdminData();
      } else {
        setAdminLoading(false);
      }
      
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err.message || 'Failed to load profile data.');
      // If the error is authentication-related, set a flag for auto-redirect
      if (err.message?.includes('log in again') || err.message?.includes('session') 
          || err.message?.includes('Authentication required')) {
        setAuthError(true);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAdminData = async () => {
    try {
      console.log('User is admin, fetching admin statistics...');
      const statsResult = await profileApi.getAdminStatistics();
      console.log('Successfully fetched admin statistics');
      setAdminStats(statsResult);
    } catch (err) {
      console.error("Error fetching admin statistics:", err);
      setError(err.message || 'Failed to load admin statistics. Please try again.');
    }
  };
  
  // Инициализация на страницата и зареждане на данни
  useEffect(() => {
    // Веднага зареждаме потребителските данни
    fetchUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Ensure accountId is set in localStorage when profile data is updated
  useEffect(() => {
    if (profileData && profileData.id) {
      console.log('Setting accountId in localStorage from profileData:', profileData.id);
      localStorage.setItem('userId', profileData.id);
      localStorage.setItem('accountId', profileData.id);
    }
  }, [profileData]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Показваме съдържание с кеширани данни, докато зареждаме
  const getCachedName = () => {
    return `${localStorage.getItem('firstName') || ''} ${localStorage.getItem('lastName') || ''}`;
  };
  
  const getCachedProfile = () => {
    return localStorage.getItem('profilePicture') || '';
  };
  
  // Показваме loading спинер, докато се зареждат данните
  if (!profileData && loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* Header with cached data */}
          <div className="flex items-center justify-between md:hidden mb-4">
            <div className="flex items-center">
              <img 
                src={getCachedProfile() ? `${import.meta.env.VITE_API_URL}${getCachedProfile()}` : "/vite.svg"}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-blue-500 dark:border-blue-400 object-cover mr-3"
                onError={(e) => {
                  e.target.src = "/vite.svg";
                }}
              />
              <div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white truncate max-w-[200px]">
                  {getCachedName()}
                </h1>
              </div>
            </div>
          </div>
          
          {/* Loading spinner */}
          <div className="flex items-center justify-center py-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-700 dark:text-gray-300">{t('common.loading') || 'Loading...'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const getTabContent = () => {
    // If there's an error and we're still in the overview tab, show error message
    if (error && activeTab === 'overview') {
      return (
        <div className="flex flex-col items-center justify-center p-4 md:p-10 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 md:p-5 rounded-lg max-w-lg mx-auto mb-4 md:mb-6">
            <div className="flex items-center mb-3">
              <HiExclamationCircle className="w-5 h-5 md:w-6 md:h-6 mr-2 flex-shrink-0" />
              <h3 className="font-bold text-base md:text-lg">{t('errors.loadingFailed') || 'Loading Failed'}</h3>
            </div>
            <p className="mb-4 text-sm md:text-base">{error}</p>
            <button
              onClick={fetchUserData}
              className="flex items-center justify-center mx-auto bg-red-100 hover:bg-red-200 dark:bg-red-800/50 dark:hover:bg-red-700/50 text-red-800 dark:text-red-300 font-medium py-1.5 px-3 md:py-2 md:px-4 rounded-lg transition text-sm"
            >
              <HiRefresh className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
              {t('common.retry') || 'Retry'}
            </button>
          </div>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'overview':
        return isAdmin 
          ? <AdminProfileContent adminStats={adminStats} loading={loading} error={error} onRetry={fetchUserData} /> 
          : <UserProfileContent profileData={profileData} loading={loading} error={error} onRetry={fetchUserData} />;
      case 'settings':
        return <ProfileSettings profileData={profileData} onUpdate={setProfileData} />;
      default:
        return isAdmin 
          ? <AdminProfileContent adminStats={adminStats} loading={loading} error={error} onRetry={fetchUserData} /> 
          : <UserProfileContent profileData={profileData} loading={loading} error={error} onRetry={fetchUserData} />;
    }
  };
  
  // Get the user's email with fallbacks
  const getUserEmail = () => {
    if (profileData && profileData.mailAddress) {
      return profileData.mailAddress;
    }
    
    if (userData && userData.mailAddress) {
      return userData.mailAddress;
    }
    
    const storedEmail = localStorage.getItem('mailAddress');
    if (storedEmail) {
      return storedEmail;
    }
    
    return t('profile.notAvailable') || 'Не е налично';
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return t('profile.notAvailable') || 'Не е налично';
    
    try {
      const dateOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      
      // Use the current language to format the date
      const locale = localStorage.getItem('language') === 'bg' ? 'bg-BG' : 'en-US';
      return new Date(dateString).toLocaleDateString(locale, dateOptions);
    } catch (e) {
      console.error('Date formatting error:', e);
      return t('profile.notAvailable') || 'Не е налично';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <div className="flex items-center">
            <img 
              src={userData.profilePicture ? `${import.meta.env.VITE_API_URL}${userData.profilePicture}` : "/vite.svg"}
              alt={`${userData.firstName} ${userData.lastName}`}
              className="w-10 h-10 rounded-full border-2 border-blue-500 dark:border-blue-400 object-cover mr-3"
              onError={(e) => {
                console.log("Error loading profile image, using default");
                e.target.src = "/vite.svg";
              }}
            />
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white truncate max-w-[200px]">
                {userData.firstName} {userData.lastName}
              </h1>
              {isAdmin && (
                <div className="flex items-center">
                  <HiShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 mr-1" />
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    {t('profile.adminRole') || 'Administrator'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Tab Buttons - Always visible on mobile */}
        <div className="flex md:hidden bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4 overflow-hidden">
          <button 
            onClick={() => handleTabChange('overview')}
            className={`flex-1 py-3 px-2 flex flex-col items-center justify-center ${
              activeTab === 'overview' ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {isAdmin ? <HiChartPie className="w-5 h-5 mb-1" /> : <HiUser className="w-5 h-5 mb-1" />}
            <span className="text-xs">
              {isAdmin ? t('profile.adminDashboard') || 'Dashboard' : t('profile.overview') || 'Overview'}
            </span>
          </button>
          <button 
            onClick={() => handleTabChange('settings')}
            className={`flex-1 py-3 px-2 flex flex-col items-center justify-center ${
              activeTab === 'settings' ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <HiCog className="w-5 h-5 mb-1" />
            <span className="text-xs">{t('profile.settings') || 'Settings'}</span>
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex-1 py-3 px-2 flex flex-col items-center justify-center text-gray-700 dark:text-gray-300"
          >
            <HiHome className="w-5 h-5 mb-1" />
            <span className="text-xs">{t('nav_home') || 'Home'}</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex-1 py-3 px-2 flex flex-col items-center justify-center text-red-600 dark:text-red-400"
          >
            <HiLogout className="w-5 h-5 mb-1" />
            <span className="text-xs">{t('nav_logout') || 'Logout'}</span>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Sidebar - Hidden on mobile, visible on desktop */}
          <div className="hidden md:block w-full md:w-1/4 lg:w-1/5 order-2 md:order-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <img 
                    src={userData.profilePicture ? `${import.meta.env.VITE_API_URL}${userData.profilePicture}` : "/vite.svg"}
                    alt={`${userData.firstName} ${userData.lastName}`}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-blue-500 dark:border-blue-400 object-cover"
                    onError={(e) => {
                      console.log("Error loading profile image, using default");
                      e.target.src = "/vite.svg";
                    }}
                  />
                  <span className={`absolute bottom-0 right-0 w-4 h-4 md:w-5 md:h-5 rounded-full ${isAdmin ? 'bg-purple-500' : 'bg-green-500'} border-2 border-white dark:border-gray-800`}></span>
                </div>
                <h2 className="mt-4 text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                  {userData.firstName} {userData.lastName}
                </h2>
                
                {/* Show email address */}
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 text-center truncate max-w-full">
                  {getUserEmail()}
                </p>
                
                {/* Admin badge on desktop */}
                {isAdmin && (
                  <div className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-3 py-1 rounded-full flex items-center">
                    <HiShieldCheck className="w-4 h-4 md:w-5 md:h-5 mr-1" />
                    <span className="text-xs md:text-sm font-medium">{t('profile.adminRole') || 'Administrator'}</span>
                  </div>
                )}
                
                {/* User badge on desktop */}
                {!isAdmin && (
                  <div className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full flex items-center">
                    <HiUser className="w-4 h-4 md:w-5 md:h-5 mr-1" />
                    <span className="text-xs md:text-sm font-medium">{t('profile.userRole') || 'Customer'}</span>
                  </div>
                )}
              </div>
              
              <nav className="space-y-2">
                <button 
                  onClick={() => handleTabChange('overview')}
                  className={`w-full flex items-center p-2 md:p-3 rounded-lg transition ${
                    activeTab === 'overview' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {isAdmin ? <HiChartPie className="w-5 h-5 mr-3" /> : <HiUser className="w-5 h-5 mr-3" />}
                  <span className="text-sm md:text-base">{isAdmin ? t('profile.adminDashboard') || 'Dashboard' : t('profile.overview') || 'Overview'}</span>
                </button>
                
                <button 
                  onClick={() => handleTabChange('settings')}
                  className={`w-full flex items-center p-2 md:p-3 rounded-lg transition ${
                    activeTab === 'settings' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <HiCog className="w-5 h-5 mr-3" />
                  <span className="text-sm md:text-base">{t('profile.settings') || 'Settings'}</span>
                </button>
                
                <button 
                  onClick={() => navigate('/')}
                  className="w-full flex items-center p-2 md:p-3 rounded-lg transition text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <HiHome className="w-5 h-5 mr-3" />
                  <span className="text-sm md:text-base">{t('nav_home') || 'Home'}</span>
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center p-2 md:p-3 mt-4 rounded-lg transition text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30"
                >
                  <HiLogout className="w-5 h-5 mr-3" />
                  <span className="text-sm md:text-base">{t('nav_logout') || 'Logout'}</span>
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="w-full md:w-3/4 lg:w-4/5 order-1 md:order-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
              {getTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 