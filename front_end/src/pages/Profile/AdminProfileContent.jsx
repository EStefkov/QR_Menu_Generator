import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiCurrencyDollar, HiShoppingCart, HiCollection, HiUserGroup, HiClock, HiExclamationCircle, HiRefresh, HiChevronLeft, HiChevronRight, HiMenu, HiEye } from 'react-icons/hi';
import { orderApi } from '../../api/orderApi';
import { useNavigate } from 'react-router-dom';

const AdminProfileContent = ({ adminStats, loading, error, onRetry }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Pagination states
  const [restaurantPage, setRestaurantPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const itemsPerPage = 5;
  
  // Order detail states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  // Navigation to menu
  const handleViewMenu = (menuId) => {
    if (menuId) {
      navigate(`/menu/${menuId}`);
    }
  };
  
  // Function to handle clicking on a restaurant row
  const handleRestaurantClick = (restaurant) => {
    const restaurantId = restaurant.id || restaurant.restorantId;
    if (!restaurantId) {
      console.error('Restaurant ID is missing');
      return;
    }
    
    // Navigate to the restaurant's menus page
    navigate(`/admin/restaurants/${restaurantId}/menus`);
  };
  
  // Function to handle clicking on an order row
  const handleOrderClick = async (order) => {
    setSelectedOrder(order);
    setLoadingDetails(true);
    setDetailsError(null);
    
    try {
      // Fetch order details
      const details = await orderApi.getOrderById(order.id);
      setOrderDetails(details);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setDetailsError(t('errors.failedToLoadOrderDetails') || 'Failed to load order details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Function to close order details
  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  // Pagination functions
  const getPaginatedData = (data, page, perPage) => {
    if (!data || !Array.isArray(data)) return [];
    const startIndex = (page - 1) * perPage;
    return data.slice(startIndex, startIndex + perPage);
  };
  
  const getTotalPages = (data, perPage) => {
    if (!data || !Array.isArray(data)) return 0;
    return Math.ceil(data.length / perPage);
  };
  
  // Function to update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      
      // Update order details
      setOrderDetails(prev => ({
        ...prev,
        orderStatus: newStatus
      }));
      
      // Update in the main orders list
      if (adminStats.recentOrders) {
        const updatedOrders = adminStats.recentOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        
        // This is a hacky way to update the state since we can't modify adminStats directly
        // In a real app, you would probably want to trigger a refresh of the parent component
        adminStats.recentOrders = updatedOrders;
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setDetailsError(t('errors.failedToUpdateStatus') || 'Failed to update order status');
    }
  };
  
  // Pagination controls component
  const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 bg-white dark:bg-gray-800">
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('pagination.showing') || 'Showing'}{' '}
              <span className="font-medium">
                {((currentPage - 1) * itemsPerPage) + 1}
              </span>{' '}
              {t('pagination.to') || 'to'}{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalPages * itemsPerPage)}
              </span>{' '}
              {t('pagination.of') || 'of'}{' '}
              <span className="font-medium">{totalPages * itemsPerPage}</span>{' '}
              {t('pagination.results') || 'results'}
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-400 ring-1 ring-inset ring-gray-300 
                  dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0 
                  ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="sr-only">{t('pagination.previous') || 'Previous'}</span>
                <HiChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold 
                    ${currentPage === page 
                      ? 'z-10 bg-blue-600 dark:bg-blue-700 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                      : 'text-gray-900 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0'}`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-400 ring-1 ring-inset ring-gray-300 
                  dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0 
                  ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="sr-only">{t('pagination.next') || 'Next'}</span>
                <HiChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
        
        {/* Mobile pagination */}
        <div className="flex sm:hidden justify-between items-center w-full">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300
              ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800
              ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <HiChevronLeft className="h-5 w-5 mr-1" />
            {t('pagination.previous') || 'Previous'}
          </button>
          
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300
              ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800
              ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {t('pagination.next') || 'Next'}
            <HiChevronRight className="h-5 w-5 ml-1" />
          </button>
        </div>
      </div>
    );
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
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('bg-BG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateString;
    }
  };

  // Get the appropriate status class for coloring
  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'READY':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'DELIVERED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
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
          
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
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
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.actions') || 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {getPaginatedData(adminStats.restaurantStats, restaurantPage, itemsPerPage).map((restaurant, index) => (
                    <tr 
                      key={restaurant.id || index} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{restaurant.name || restaurant.restorantName}</div>
                        {restaurant.id && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {restaurant.id}</div>
                        )}
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
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleRestaurantClick(restaurant)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                        >
                          <HiMenu className="mr-1 h-4 w-4" />
                          {t('admin.viewMenus') || 'View Menus'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <PaginationControls 
              currentPage={restaurantPage} 
              totalPages={getTotalPages(adminStats.restaurantStats, itemsPerPage)} 
              onPageChange={setRestaurantPage}
            />
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
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
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
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {getPaginatedData(adminStats.popularProducts, productsPage, itemsPerPage).map((product, index) => (
                    <tr key={product.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
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
            
            {/* Pagination */}
            <PaginationControls 
              currentPage={productsPage} 
              totalPages={getTotalPages(adminStats.popularProducts, itemsPerPage)} 
              onPageChange={setProductsPage}
            />
          </div>
        </div>
      )}
      
      {/* Recent Orders */}
      {adminStats.recentOrders && adminStats.recentOrders.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('admin.recentOrders') || 'Recent Orders'}
          </h3>
          
          {selectedOrder && orderDetails ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">
              <div className="p-4 md:p-6 dark:bg-gray-900">
                <div className="flex justify-between items-center mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {t('orders.orderDetails') || 'Order Details'} #{selectedOrder.id}
                  </h3>
                  <button 
                    onClick={handleCloseDetails}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                  >
                    <HiX className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
                
                {loadingDetails ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : detailsError ? (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg">
                    <p>{detailsError}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">{t('orders.orderInfo') || 'Order Information'}</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{t('orders.date') || 'Date'}:</span> {formatDate(orderDetails.orderTime || orderDetails.orderDate)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{t('orders.status') || 'Status'}:</span> 
                            <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(orderDetails.orderStatus || orderDetails.status)}`}>
                              {orderDetails.orderStatus || orderDetails.status || '-'}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{t('orders.total') || 'Total'}:</span> {formatCurrency(orderDetails.totalPrice || orderDetails.totalAmount || 0)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{t('orders.restaurant') || 'Restaurant'}:</span> {orderDetails.restaurantName || '-'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{t('orders.customer') || 'Customer'}:</span> {orderDetails.customerName || '-'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Update Status */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">{t('orders.updateStatus') || 'Update Status'}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'].map(status => (
                            <button
                              key={status}
                              onClick={() => handleUpdateOrderStatus(selectedOrder.id, status)}
                              disabled={(orderDetails.orderStatus || orderDetails.status) === status}
                              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors 
                                ${(orderDetails.orderStatus || orderDetails.status) === status 
                                  ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                                  : `${getStatusClass(status)} hover:opacity-80`
                                }`}
                            >
                              {t(`orders.status${status}`) || status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                      <h4 className="font-medium text-gray-800 dark:text-white mb-3">{t('orders.items') || 'Order Items'}</h4>
                      {orderDetails.products && orderDetails.products.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  {t('orders.product') || 'Product'}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  {t('orders.quantity') || 'Quantity'}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  {t('orders.price') || 'Price'}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  {t('orders.subtotal') || 'Subtotal'}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-gray-50 dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {orderDetails.products.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                    {item.productName || `Product #${item.productId}`}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                    {item.quantity}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                    {formatCurrency(item.productPriceAtOrder || 0)}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                    {formatCurrency((item.productPriceAtOrder || 0) * (item.quantity || 0))}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          {t('orders.noItems') || 'No items available'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
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
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {getPaginatedData(adminStats.recentOrders, ordersPage, itemsPerPage).map((order, index) => (
                      <tr 
                        key={order.id || index} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                        onClick={() => handleOrderClick(order)}
                      >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">#{order.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{order.restaurantName}</div>
                          {order.restorantId && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">ID: {order.restorantId}</div>
                          )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{order.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(order.totalAmount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(order.orderDate)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              
              {/* Pagination */}
              <PaginationControls 
                currentPage={ordersPage} 
                totalPages={getTotalPages(adminStats.recentOrders, itemsPerPage)}
                onPageChange={setOrdersPage} 
              />
          </div>
          )}
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