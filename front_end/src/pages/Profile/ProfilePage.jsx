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
  
  // Check if user is admin from JWT token data or localStorage
  const isAdmin = userData?.accountType === 'ROLE_ADMIN' || localStorage.getItem('accountType') === 'ROLE_ADMIN';
  
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting to fetch user profile data...');
      
      // Get real profile data from API
      const result = await profileApi.getUserProfile();
      console.log('Successfully fetched profile data:', result);
      setProfileData(result);
      
      // Fetch admin statistics if user is admin
      if (isAdmin) {
        try {
          console.log('User is admin, fetching admin statistics...');
          const statsResult = await profileApi.getAdminStatistics();
          console.log('Successfully fetched admin statistics');
          setAdminStats(statsResult);
        } catch (err) {
          console.error("Error fetching admin statistics:", err);
          setError(err.message || 'Failed to load admin statistics. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err.message || 'Failed to load profile data. Please try again.');
      
      // If we get a 401 or 403 error, the token is probably invalid
      if (err.message && (err.message.includes('401') || 
                           err.message.includes('403') || 
                           err.message.includes('Unauthorized') || 
                           err.message.includes('expired'))) {
        console.warn('Authentication error detected, redirecting to login');
        // Wait 3 seconds before redirecting to login, to give user time to read error
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (userData && userData.token) {
      fetchProfileData();
    } else {
      navigate('/login');
    }
  }, [isAdmin, userData]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (!userData || !userData.token) {
    navigate('/login');
    return null;
  }
  
  const getTabContent = () => {
    // If there's an error and we're still in the overview tab, show error message
    if (error && activeTab === 'overview') {
      return (
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-5 rounded-lg max-w-lg mx-auto mb-6">
            <div className="flex items-center mb-3">
              <HiExclamationCircle className="w-6 h-6 mr-2 flex-shrink-0" />
              <h3 className="font-bold text-lg">{t('errors.loadingFailed') || 'Loading Failed'}</h3>
            </div>
            <p className="mb-4">{error}</p>
            <button
              onClick={fetchProfileData}
              className="flex items-center justify-center mx-auto bg-red-100 hover:bg-red-200 dark:bg-red-800/50 dark:hover:bg-red-700/50 text-red-800 dark:text-red-300 font-medium py-2 px-4 rounded-lg transition"
            >
              <HiRefresh className="w-5 h-5 mr-2" />
              {t('common.retry') || 'Retry'}
            </button>
          </div>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'overview':
        return isAdmin 
          ? <AdminProfileContent adminStats={adminStats} loading={loading} error={error} onRetry={fetchProfileData} /> 
          : <UserProfileContent profileData={profileData} loading={loading} error={error} onRetry={fetchProfileData} />;
      case 'settings':
        return <ProfileSettings profileData={profileData} onUpdate={setProfileData} />;
      default:
        return isAdmin 
          ? <AdminProfileContent adminStats={adminStats} loading={loading} error={error} onRetry={fetchProfileData} /> 
          : <UserProfileContent profileData={profileData} loading={loading} error={error} onRetry={fetchProfileData} />;
    }
  };
  
  // Admin header that shows only for admins
  const renderAdminHeader = () => {
    if (isAdmin) {
      return (
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl mb-6 flex items-center">
          <HiShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
          <div>
            <h3 className="font-bold text-purple-800 dark:text-purple-300">
              {t('profile.adminHeader') || 'Administrator Dashboard'}
            </h3>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              {t('profile.adminDescription') || 'View statistics and manage your restaurants'}
            </p>
          </div>
        </div>
      );
    }
    return null;
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
    
    return '';
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 lg:w-1/5">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <img 
                    src={userData.profilePicture ? `${import.meta.env.VITE_API_URL}${userData.profilePicture}` : "/vite.svg"}
                    alt={`${userData.firstName} ${userData.lastName}`}
                    className="w-24 h-24 rounded-full border-4 border-blue-500 dark:border-blue-400 object-cover"
                    onError={(e) => {
                      console.log("Error loading profile image, using default");
                      e.target.src = "/vite.svg";
                    }}
                  />
                  <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full ${isAdmin ? 'bg-purple-500' : 'bg-green-500'} border-2 border-white dark:border-gray-800`}></span>
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-800 dark:text-white">
                  {userData.firstName} {userData.lastName}
                </h2>
                
                {/* Show email address */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {getUserEmail()}
                </p>
                
                {/* Администраторска титла с иконка */}
                {isAdmin && (
                  <div className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-3 py-1 rounded-full flex items-center">
                    <HiShieldCheck className="w-5 h-5 mr-1" />
                    <span className="font-medium">{t('profile.adminRole') || 'Administrator'}</span>
                  </div>
                )}
                
                {/* Покажи роля, ако потребителят не е администратор */}
                {!isAdmin && (
                  <div className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full flex items-center">
                    <HiUser className="w-5 h-5 mr-1" />
                    <span className="font-medium">{t('profile.userRole') || 'Customer'}</span>
                  </div>
                )}
              </div>
              
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center p-3 rounded-lg transition ${
                    activeTab === 'overview' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {isAdmin ? <HiChartPie className="w-5 h-5 mr-3" /> : <HiUser className="w-5 h-5 mr-3" />}
                  <span>{isAdmin ? t('profile.adminDashboard') || 'Dashboard' : t('profile.overview') || 'Overview'}</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center p-3 rounded-lg transition ${
                    activeTab === 'settings' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <HiCog className="w-5 h-5 mr-3" />
                  <span>{t('profile.settings') || 'Settings'}</span>
                </button>
                
                <button 
                  onClick={() => navigate('/')}
                  className="w-full flex items-center p-3 rounded-lg transition text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <HiHome className="w-5 h-5 mr-3" />
                  <span>{t('nav_home') || 'Home'}</span>
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center p-3 mt-4 rounded-lg transition text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30"
                >
                  <HiLogout className="w-5 h-5 mr-3" />
                  <span>{t('nav_logout') || 'Logout'}</span>
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="w-full md:w-3/4 lg:w-4/5">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              {renderAdminHeader()}
              {getTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 