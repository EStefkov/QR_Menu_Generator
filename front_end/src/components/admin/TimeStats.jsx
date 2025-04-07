import React from 'react';
import { HiClock } from 'react-icons/hi';
import { useLanguage } from '../../contexts/LanguageContext';

const TimeStats = ({ timeStats, formatCurrency }) => {
  const { t } = useLanguage();
  
  if (!timeStats) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Today */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/30 dark:to-amber-800/30 rounded-xl shadow p-6 transition hover:shadow-lg">
        <div className="flex items-center mb-4">
          <div className="bg-orange-500 dark:bg-orange-600 p-3 rounded-lg">
            <HiClock className="h-6 w-6 text-white" />
          </div>
          <h4 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
            {t('admin.today') || 'Today'}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.orders') || 'Orders'}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {timeStats.today?.orders || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.revenue') || 'Revenue'}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {formatCurrency(timeStats.today?.revenue || 0)}
            </p>
          </div>
        </div>
      </div>
      
      {/* This Week */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-800/30 rounded-xl shadow p-6 transition hover:shadow-lg">
        <div className="flex items-center mb-4">
          <div className="bg-teal-500 dark:bg-teal-600 p-3 rounded-lg">
            <HiClock className="h-6 w-6 text-white" />
          </div>
          <h4 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
            {t('admin.thisWeek') || 'This Week'}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.orders') || 'Orders'}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {timeStats.thisWeek?.orders || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.revenue') || 'Revenue'}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {formatCurrency(timeStats.thisWeek?.revenue || 0)}
            </p>
          </div>
        </div>
      </div>
      
      {/* This Month */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 rounded-xl shadow p-6 transition hover:shadow-lg">
        <div className="flex items-center mb-4">
          <div className="bg-blue-500 dark:bg-blue-600 p-3 rounded-lg">
            <HiClock className="h-6 w-6 text-white" />
          </div>
          <h4 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
            {t('admin.thisMonth') || 'This Month'}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.orders') || 'Orders'}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {timeStats.thisMonth?.orders || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.revenue') || 'Revenue'}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {formatCurrency(timeStats.thisMonth?.revenue || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeStats; 