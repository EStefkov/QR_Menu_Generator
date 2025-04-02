import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiCurrencyDollar, HiShoppingCart, HiCollection, HiUserGroup, HiClock, HiExclamationCircle, HiRefresh } from 'react-icons/hi';

const AdminProfileContent = ({ adminStats, loading, error, onRetry }) => {
  const { t } = useLanguage();
  
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
            <h3 className="font-bold text-lg mb-1">{t('errors.loadFailed') || 'Failed to load data'}</h3>
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
  
  if (!adminStats) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-5 rounded-lg flex flex-col items-center">
        <div className="flex items-center mb-4">
          <HiExclamationCircle className="w-6 h-6 mr-3 flex-shrink-0" />
          <p>{t('admin.noDataAvailable') || 'No statistics available yet. Start adding restaurants and products to see your dashboard.'}</p>
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
  
  // Function to format currency values
  const formatCurrency = (value) => {
    if (value == null) return '0.00 лв.';
    return new Intl.NumberFormat('bg-BG', { 
      style: 'currency', 
      currency: 'BGN',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Format orders and order values as needed from real data
  const getTotalOrders = () => {
    if (adminStats.orderStatusCounts) {
      return Object.values(adminStats.orderStatusCounts).reduce((a, b) => a + b, 0);
    }
    return adminStats.totalOrders || 0;
  };
  
  const getTotalRevenue = () => {
    return adminStats.totalRevenue || 0;
  };
  
  const getRestaurantCount = () => {
    return adminStats.restaurantStats ? adminStats.restaurantStats.length : 0;
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        {t('admin.dashboard') || 'Admin Dashboard'}
      </h2>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 rounded-xl shadow p-6 transition hover:shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-green-500 dark:bg-green-600 p-3 rounded-lg">
              <HiCurrencyDollar className="h-6 w-6 text-white" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
              {t('admin.totalRevenue') || 'Total Revenue'}
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">
            {formatCurrency(getTotalRevenue())}
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {t('admin.allTimeRevenue') || 'All-time revenue across all restaurants'}
          </p>
        </div>
        
        {/* Total Orders Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 rounded-xl shadow p-6 transition hover:shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 dark:bg-blue-600 p-3 rounded-lg">
              <HiShoppingCart className="h-6 w-6 text-white" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
              {t('admin.totalOrders') || 'Total Orders'}
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">
            {getTotalOrders()}
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {t('admin.ordersProcessed') || 'Orders processed across all restaurants'}
          </p>
        </div>
        
        {/* Restaurants Card */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-800/30 rounded-xl shadow p-6 transition hover:shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-purple-500 dark:bg-purple-600 p-3 rounded-lg">
              <HiCollection className="h-6 w-6 text-white" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
              {t('admin.restaurants') || 'Restaurants'}
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">
            {getRestaurantCount()}
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {t('admin.activeRestaurants') || 'Active restaurants in your portfolio'}
          </p>
        </div>
      </div>
      
      {/* Restaurant Performance */}
      {adminStats.restaurantStats && adminStats.restaurantStats.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('admin.restaurantPerformance') || 'Restaurant Performance'}
          </h3>
          <div className="bg-white dark:bg-gray-750 rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.restaurantName') || 'Restaurant'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.totalOrders') || 'Orders'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.revenue') || 'Revenue'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.avgOrder') || 'Avg. Order'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {adminStats.restaurantStats.map((restaurant, index) => (
                    <tr key={restaurant.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{restaurant.name || restaurant.restorantName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{restaurant.totalOrders || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(restaurant.totalRevenue || 0)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(restaurant.averageOrderValue || 0)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Order Status Distribution */}
      {adminStats.orderStatusCounts && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('admin.orderStatusDistribution') || 'Order Status Distribution'}
          </h3>
          <div className="bg-white dark:bg-gray-750 rounded-xl shadow p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {Object.entries(adminStats.orderStatusCounts).map(([status, count]) => (
                <div key={status} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{status}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Most Popular Products */}
      {adminStats.popularProducts && adminStats.popularProducts.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('admin.popularProducts') || 'Most Popular Products'}
          </h3>
          <div className="bg-white dark:bg-gray-750 rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.product') || 'Product'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.restaurant') || 'Restaurant'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.orderCount') || 'Orders'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.revenue') || 'Revenue'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {adminStats.popularProducts.map((product, index) => (
                    <tr key={product.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{product.restaurantName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{product.orderCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(product.revenue)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Orders */}
      {adminStats.recentOrders && adminStats.recentOrders.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('admin.recentOrders') || 'Recent Orders'}
          </h3>
          <div className="bg-white dark:bg-gray-750 rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.orderId') || 'Order ID'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.restaurant') || 'Restaurant'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.customer') || 'Customer'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.amount') || 'Amount'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.status') || 'Status'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.date') || 'Date'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {adminStats.recentOrders.map((order, index) => (
                    <tr key={order.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">#{order.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{order.restaurantName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{order.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(order.totalAmount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' : 
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : 
                          order.status === 'PREPARING' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : 
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.orderDate).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Time-based Statistics */}
      {adminStats.timeStats && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('admin.timePeriodStats') || 'Time Period Statistics'}
          </h3>
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
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{adminStats.timeStats.today?.orders || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.revenue') || 'Revenue'}</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(adminStats.timeStats.today?.revenue || 0)}</p>
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
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{adminStats.timeStats.thisWeek?.orders || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.revenue') || 'Revenue'}</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(adminStats.timeStats.thisWeek?.revenue || 0)}</p>
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
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{adminStats.timeStats.thisMonth?.orders || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.revenue') || 'Revenue'}</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(adminStats.timeStats.thisMonth?.revenue || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfileContent; 