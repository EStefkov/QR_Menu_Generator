import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { profileApi } from '../../api/profileApi';
import { HiUser, HiMail, HiPhone, HiCalendar, HiShoppingCart, HiHeart, HiClock, HiExclamationCircle, HiInformationCircle, HiRefresh } from 'react-icons/hi';

const UserProfileContent = ({ profileData, loading, error, onRetry }) => {
  const { t } = useLanguage();
  const [orderCount, setOrderCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    // Only fetch data if we have a valid profile
    if (profileData && !loading) {
      // Ensure userId/accountId is set in localStorage before fetching stats
      if (profileData.id) {
        localStorage.setItem('userId', profileData.id);
        localStorage.setItem('accountId', profileData.id);
      }
      fetchUserStats();
    }
  }, [profileData, loading]);

  const fetchUserStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    
    console.log('Starting to fetch user stats...');
    console.log('localStorage userId:', localStorage.getItem('userId'));
    console.log('localStorage accountId:', localStorage.getItem('accountId'));
    console.log('Profile data id:', profileData?.id);
    
    try {
      // Fetch orders count and favorites count in parallel
      console.log('Fetching stats in parallel...');
      const [ordersCountResult, favoritesCountResult] = await Promise.all([
        profileApi.getUserOrdersCount(),
        profileApi.getUserFavoritesCount()
      ]);
      
      console.log('Stats fetched successfully:', {orders: ordersCountResult, favorites: favoritesCountResult});
      setOrderCount(ordersCountResult);
      setFavoritesCount(favoritesCountResult);
    } catch (err) {
      console.error('Error fetching user statistics:', err);
      setStatsError(err.message || 'Failed to load user statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-5 rounded-lg flex flex-col items-start">
        <div className="flex items-start mb-4">
          <HiExclamationCircle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg mb-1">{t('errors.loadFailed') || 'Failed to load profile data'}</h3>
            <p>{error}</p>
            <p className="mt-3 text-sm">{t('errors.tryAgainLater') || 'Please try again later or contact support if the problem persists.'}</p>
          </div>
        </div>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center self-center mt-4 bg-red-100 hover:bg-red-200 dark:bg-red-800/30 dark:hover:bg-red-700/30 text-red-800 dark:text-red-300 font-medium py-2 px-4 rounded-lg transition"
          >
            <HiRefresh className="w-5 h-5 mr-2" />
            {t('common.retry') || 'Retry'}
          </button>
        )}
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-5 rounded-lg flex flex-col items-center">
        <div className="flex items-center mb-4">
          <HiInformationCircle className="w-6 h-6 mr-3 flex-shrink-0" />
          <p>{t('profile.noProfileData') || 'No profile data available'}</p>
        </div>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center mt-4 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800/30 dark:hover:bg-blue-700/30 text-blue-800 dark:text-blue-300 font-medium py-2 px-4 rounded-lg transition"
          >
            <HiRefresh className="w-5 h-5 mr-2" />
            {t('common.refresh') || 'Refresh'}
          </button>
        )}
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return t('profile.notAvailable') || 'Not available';
    
    try {
      return new Date(dateString).toLocaleDateString('bg-BG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return t('profile.notAvailable') || 'Not available';
    }
  };
  
  // Get the email address from the correct field
  const getEmail = () => {
    if (profileData && profileData.mailAddress) {
      return profileData.mailAddress;
    }
    
    const storedEmail = localStorage.getItem('mailAddress');
    if (storedEmail) {
      return storedEmail;
    }
    
    return t('profile.notProvided') || 'Not provided';
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {t('profile.userProfile') || 'User Profile'}
        </h2>
        
        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 shadow rounded-xl p-5 flex items-center hover:shadow-md transition">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
              <HiUser className="w-8 h-8 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.name') || 'Name'}</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {profileData.firstName || ''} {profileData.lastName || ''}
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 shadow rounded-xl p-5 flex items-center hover:shadow-md transition">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mr-4">
              <HiMail className="w-8 h-8 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.email') || 'Email'}</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white truncate max-w-[180px]">
                {getEmail()}
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-800/30 shadow rounded-xl p-5 flex items-center hover:shadow-md transition">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg mr-4">
              <HiPhone className="w-8 h-8 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.phone') || 'Phone'}</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {profileData.phone || t('profile.notProvided') || 'Not provided'}
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-800/30 shadow rounded-xl p-5 flex items-center hover:shadow-md transition">
            <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-lg mr-4">
              <HiCalendar className="w-8 h-8 text-amber-600 dark:text-amber-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.memberSince') || 'Member Since'}</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {formatDate(profileData.createdAt)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Activity Summary */}
        <div className="bg-white dark:bg-gray-700 shadow rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              {t('profile.activitySummary') || 'Activity Summary'}
            </h3>
            
            {/* Refresh button for stats */}
            <button 
              onClick={fetchUserStats} 
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center transition"
              disabled={statsLoading}
            >
              <HiRefresh className={`w-5 h-5 mr-1 ${statsLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">{t('common.refresh') || 'Refresh'}</span>
            </button>
          </div>
          
          {statsError && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-lg mb-4 text-sm">
              <div className="flex items-center justify-between">
                <p className="flex items-center">
                  <HiExclamationCircle className="w-5 h-5 mr-2" />
                  {statsError}
                </p>
                <button 
                  onClick={fetchUserStats} 
                  className="ml-3 bg-red-100 hover:bg-red-200 dark:bg-red-800/30 dark:hover:bg-red-700/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-lg text-xs font-medium transition flex items-center"
                >
                  <HiRefresh className="w-3 h-3 mr-1" />
                  {t('common.retry') || 'Retry'}
                </button>
              </div>
            </div>
          )}
          
          {/* If no stats loaded yet but no error, show a big refresh button */}
          {!statsError && orderCount === 0 && favoritesCount === 0 && !statsLoading && (
            <div className="text-center py-6 mb-4">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t('profile.noActivityData') || 'No activity data available yet'}
              </p>
              <button 
                onClick={fetchUserStats}
                className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                <HiRefresh className="w-5 h-5 mr-2" />
                {t('common.loadData') || 'Load Data'}
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full mr-4">
                <HiShoppingCart className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                  {statsLoading ? (
                    <span className="flex items-center">
                      <span className="w-6 h-6 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin mr-2"></span>
                      {t('loading') || 'Loading...'}
                    </span>
                  ) : (
                    orderCount
                  )}
                </p>
                <p className="text-gray-500 dark:text-gray-400">{t('profile.totalOrders') || 'Total Orders'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="bg-pink-100 dark:bg-pink-900 p-3 rounded-full mr-4">
                <HiHeart className="w-8 h-8 text-pink-600 dark:text-pink-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                  {statsLoading ? (
                    <span className="flex items-center">
                      <span className="w-6 h-6 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin mr-2"></span>
                      {t('loading') || 'Loading...'}
                    </span>
                  ) : (
                    favoritesCount
                  )}
                </p>
                <p className="text-gray-500 dark:text-gray-400">{t('profile.favoriteProducts') || 'Favorite Products'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Placeholder for Future Features */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 shadow rounded-xl p-6 hover:shadow-md transition">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('profile.comingSoon') || 'Coming Soon'}
          </h3>
          
          <div className="text-center py-8">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 inline-block">
              <HiClock className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto" />
              <p className="mt-4 text-gray-600 dark:text-gray-300">{t('profile.moreFeaturesSoon') || 'More features coming soon!'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileContent; 