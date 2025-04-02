import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiTrendingUp, HiCash, HiShoppingCart, HiChartBar, HiViewGrid, HiClock } from 'react-icons/hi';

const AdminProfileContent = ({ adminStats, loading, error }) => {
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

  if (!adminStats) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 text-center">
          <p className="text-lg">{t('profile.noStatsAvailable')}</p>
        </div>
      </div>
    );
  }

  const { restaurantStats, popularProducts, orderStatusCounts, timeStats, recentOrders } = adminStats;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' })
      .format(amount)
      .replace('лв', 'лв.');
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {t('profile.adminDashboard')}
        </h2>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-green-100 text-sm">{t('profile.todayOrders')}</p>
                <h3 className="text-3xl font-bold mt-1">{timeStats.today.orders}</h3>
                <p className="text-lg opacity-90">{formatCurrency(timeStats.today.revenue)}</p>
              </div>
              <HiShoppingCart className="w-10 h-10 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm">{t('profile.weekOrders')}</p>
                <h3 className="text-3xl font-bold mt-1">{timeStats.thisWeek.orders}</h3>
                <p className="text-lg opacity-90">{formatCurrency(timeStats.thisWeek.revenue)}</p>
              </div>
              <HiTrendingUp className="w-10 h-10 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-purple-100 text-sm">{t('profile.monthOrders')}</p>
                <h3 className="text-3xl font-bold mt-1">{timeStats.thisMonth.orders}</h3>
                <p className="text-lg opacity-90">{formatCurrency(timeStats.thisMonth.revenue)}</p>
              </div>
              <HiCash className="w-10 h-10 opacity-80" />
            </div>
          </div>
        </div>
        
        {/* Order Status Summary */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <HiChartBar className="w-6 h-6 mr-2 text-indigo-500 dark:text-indigo-400" />
              {t('profile.orderStatusSummary')}
            </h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Object.entries(orderStatusCounts).map(([status, count]) => (
              <div key={status} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t(`orders.status.${status.toLowerCase()}`)}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{count}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Popular Products */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <HiViewGrid className="w-6 h-6 mr-2 text-indigo-500 dark:text-indigo-400" />
              {t('profile.popularProducts')}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('product')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('restaurant')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('orders.count')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('revenue')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {popularProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {product.restaurantName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                      {product.orderCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Restaurant Stats */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <HiChartBar className="w-6 h-6 mr-2 text-indigo-500 dark:text-indigo-400" />
              {t('profile.restaurantPerformance')}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('restaurant')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('orders.count')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('revenue')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('profile.averageOrder')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {restaurantStats.map((restaurant) => (
                  <tr key={restaurant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {restaurant.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                      {restaurant.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(restaurant.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                      {formatCurrency(restaurant.averageOrderValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <HiClock className="w-6 h-6 mr-2 text-indigo-500 dark:text-indigo-400" />
              {t('profile.recentOrders')}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('orders.id')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('restaurant')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('orders.customer')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('orders.amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('orders.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('orders.date')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.restaurantName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                        {t(`orders.status.${order.status.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.orderDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileContent; 