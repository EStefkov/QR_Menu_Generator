import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiUser, HiMail, HiPhone, HiCalendar, HiShoppingCart, HiHeart, HiClock } from 'react-icons/hi';

const UserProfileContent = ({ profileData, loading, error }) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-pulse text-blue-500 dark:text-blue-400">
          <HiClock className="w-12 h-12 animate-spin" />
          <p className="mt-2">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-red-500 dark:text-red-400 text-center">
          <p className="text-lg font-semibold">{t('errors.general')}</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 text-center">
          <p className="text-lg">{t('profile.noProfileData')}</p>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {t('profile.userProfile')}
        </h2>
        
        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-700 shadow rounded-xl p-5 flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
              <HiUser className="w-8 h-8 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.name')}</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {profileData.firstName} {profileData.lastName}
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-700 shadow rounded-xl p-5 flex items-center">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mr-4">
              <HiMail className="w-8 h-8 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.email')}</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {profileData.email}
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-700 shadow rounded-xl p-5 flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg mr-4">
              <HiPhone className="w-8 h-8 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.phone')}</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {profileData.phone || t('profile.notProvided')}
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-700 shadow rounded-xl p-5 flex items-center">
            <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-lg mr-4">
              <HiCalendar className="w-8 h-8 text-amber-600 dark:text-amber-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.memberSince')}</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {formatDate(profileData.createdAt)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Activity Summary */}
        <div className="bg-white dark:bg-gray-700 shadow rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('profile.activitySummary')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full mr-4">
                <HiShoppingCart className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{profileData.orderCount}</p>
                <p className="text-gray-500 dark:text-gray-400">{t('profile.totalOrders')}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="bg-pink-100 dark:bg-pink-900 p-3 rounded-full mr-4">
                <HiHeart className="w-8 h-8 text-pink-600 dark:text-pink-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{profileData.favoriteProducts}</p>
                <p className="text-gray-500 dark:text-gray-400">{t('profile.favoriteProducts')}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Placeholder for Future Features */}
        <div className="bg-white dark:bg-gray-700 shadow rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('profile.comingSoon')}
          </h3>
          
          <div className="text-center py-8">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 inline-block">
              <HiClock className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto" />
              <p className="mt-4 text-gray-600 dark:text-gray-300">{t('profile.moreFeaturesSoon')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileContent; 