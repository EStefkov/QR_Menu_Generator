import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { profileApi } from '../../api/profileApi';
import {
  HiUser,
  HiMail,
  HiPhone,
  HiCalendar,
  HiShoppingCart,
  HiHeart,
  HiExclamationCircle,
  HiRefresh,
  HiChevronUp
} from 'react-icons/hi';
import OrderHistory from '../../components/profile/OrderHistory';

const UserProfileContent = ({ profileData, loading, error, onRetry }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  
  // State for stats
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [orderCount, setOrderCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  
  // Fetch user stats
  useEffect(() => {
    if (currentUser) {
      fetchUserStats();
    }
  }, [currentUser]);
  
  const fetchUserStats = async () => {
    if (!currentUser) return;
    
    setStatsLoading(true);
    setStatsError(null);
    
    try {
      const stats = await profileApi.getUserStats();
      
      if (stats) {
        setOrderCount(stats.orderCount || 0);
        setFavoritesCount(stats.favoritesCount || 0);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setStatsError(t('errors.general') || 'Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  };
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return t('profile.notAvailable') || 'Not available';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(document.documentElement.lang || 'en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return t('profile.notAvailable') || 'Not available';
    }
  };
  
  // Get email helper
  const getEmail = () => {
    if (profileData && profileData.email) {
      return profileData.email;
    } else if (currentUser && currentUser.email) {
      return currentUser.email;
    } else {
      return t('profile.notProvided') || 'Not provided';
    }
  };
  
  // Get time ago helper
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
      
      if (diffInMonths < 1) {
        return t('profile.memberSince') + ' ' + t('common.thisMonth') || 'Member since this month';
      } else if (diffInMonths === 1) {
        return t('profile.memberSince') + ' 1 ' + t('common.monthAgo') || 'Member since 1 month ago';
      } else {
        return t('profile.memberSince') + ' ' + diffInMonths + ' ' + t('common.monthsAgo') || `Member since ${diffInMonths} months ago`;
      }
    } catch (error) {
      console.error('Error calculating time ago:', error);
      return '';
    }
  };
  
  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 md:p-6 rounded-xl mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <HiExclamationCircle className="w-5 h-5 md:w-6 md:h-6 mr-2 flex-shrink-0" />
              <p className="text-sm md:text-base">{error}</p>
            </div>
            <button 
              onClick={onRetry}
              className="bg-red-100 hover:bg-red-200 dark:bg-red-800/30 dark:hover:bg-red-700/30 text-red-800 dark:text-red-300 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center md:justify-start"
            >
              <HiRefresh className="w-4 h-4 mr-2" />
              {t('common.retry') || 'Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-8">
      <div className="space-y-6 md:space-y-8">
        {/* User Information - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 shadow rounded-xl p-4 md:p-6 flex items-start hover:shadow-md transition">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 md:p-3 rounded-lg mr-3 md:mr-4 flex-shrink-0">
              <HiUser className="w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">{t('profile.name') || 'Name'}</p>
              <div className="flex flex-col">
                <p className="text-base md:text-lg font-semibold text-gray-800 dark:text-white break-words">
                  {profileData.firstName || ''}
                </p>
                <p className="text-base md:text-lg font-semibold text-gray-800 dark:text-white break-words">
                  {profileData.lastName || ''}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 shadow rounded-xl p-4 md:p-6 flex items-start hover:shadow-md transition">
            <div className="bg-green-100 dark:bg-green-900 p-2 md:p-3 rounded-lg mr-3 md:mr-4 flex-shrink-0">
              <HiMail className="w-6 h-6 md:w-8 md:h-8 text-green-600 dark:text-green-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">{t('profile.email') || 'Email'}</p>
              <p className="text-base md:text-lg font-semibold text-gray-800 dark:text-white break-words">
                {getEmail()}
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-800/30 shadow rounded-xl p-4 md:p-6 flex items-start hover:shadow-md transition">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 md:p-3 rounded-lg mr-3 md:mr-4 flex-shrink-0">
              <HiPhone className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-purple-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">{t('profile.phone') || 'Phone'}</p>
              <p className="text-base md:text-lg font-semibold text-gray-800 dark:text-white break-words">
                {profileData.phone || t('profile.notProvided') || 'Not provided'}
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-800/30 shadow rounded-xl p-4 md:p-6 flex items-start hover:shadow-md transition">
            <div className="bg-amber-100 dark:bg-amber-900 p-2 md:p-3 rounded-lg mr-3 md:mr-4 flex-shrink-0">
              <HiCalendar className="w-6 h-6 md:w-8 md:h-8 text-amber-600 dark:text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">{t('profile.memberSince') || 'Member Since'}</p>
              <p className="text-base md:text-lg font-semibold text-gray-800 dark:text-white break-words">
                {formatDate(profileData.createdAt)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {getTimeAgo(profileData.createdAt)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Activity Summary - Responsive */}
        <div className="bg-white dark:bg-gray-700 shadow rounded-xl p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
              {t('profile.activitySummary') || 'Activity Summary'}
            </h3>
            
            {/* Refresh button for stats */}
            <button 
              onClick={fetchUserStats} 
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center transition"
              disabled={statsLoading}
              aria-label={t('common.refresh') || 'Refresh'}
            >
              <HiRefresh className={`w-5 h-5 ${statsLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium ml-1 hidden sm:inline">{t('common.refresh') || 'Refresh'}</span>
            </button>
          </div>
          
          {statsError && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-lg mb-4 text-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="flex items-center">
                  <HiExclamationCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{statsError}</span>
                </p>
                <button 
                  onClick={fetchUserStats} 
                  className="ml-0 sm:ml-3 bg-red-100 hover:bg-red-200 dark:bg-red-800/30 dark:hover:bg-red-700/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-lg text-xs font-medium transition flex items-center"
                >
                  <HiRefresh className="w-3 h-3 mr-1" />
                  {t('common.retry') || 'Retry'}
                </button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
            <div className="flex items-center">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-2 md:p-3 rounded-full mr-3 md:mr-4 flex-shrink-0">
                <HiShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <p className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                  {statsLoading ? (
                    <span className="flex items-center">
                      <span className="w-4 h-4 md:w-6 md:h-6 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin mr-2"></span>
                      <span className="text-sm md:text-base">{t('loading') || 'Loading...'}</span>
                    </span>
                  ) : (
                    orderCount
                  )}
                </p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{t('profile.totalOrders') || 'Total Orders'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="bg-pink-100 dark:bg-pink-900 p-2 md:p-3 rounded-full mr-3 md:mr-4 flex-shrink-0">
                <HiHeart className="w-6 h-6 md:w-8 md:h-8 text-pink-600 dark:text-pink-300" />
              </div>
              <div>
                <p className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                  {statsLoading ? (
                    <span className="flex items-center">
                      <span className="w-4 h-4 md:w-6 md:h-6 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin mr-2"></span>
                      <span className="text-sm md:text-base">{t('loading') || 'Loading...'}</span>
                    </span>
                  ) : (
                    favoritesCount
                  )}
                </p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{t('profile.favoriteProducts') || 'Favorite Products'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order History Section */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 shadow rounded-xl hover:shadow-md transition">
          <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                {t('profile.orderHistory') || 'Order History'}
              </h3>
            </div>
            
            <OrderHistory />
          </div>
        </div>
        
        {/* Back to Top - Mobile Only */}
        <div className="md:hidden flex justify-center mt-8">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition"
          >
            <HiChevronUp className="w-5 h-5 mr-1" />
            {t('responsive.backToTop') || 'Back to top'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileContent; 