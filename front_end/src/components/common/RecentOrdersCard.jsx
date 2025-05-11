import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiOutlineRefresh, HiEye } from 'react-icons/hi';
import { orderApi } from '../../api/orderApi';

/**
 * RecentOrdersCard component to display recent orders for a restaurant
 * @param {Object} props Component props
 * @param {Object} props.restaurant The restaurant object
 * @param {Function} props.onViewDetails Optional function to handle viewing order details
 * @param {number} props.maxOrders Maximum number of orders to show (defaults to 5)
 */
const RecentOrdersCard = ({ restaurant, onViewDetails, maxOrders = 5 }) => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch orders when the restaurant changes
  useEffect(() => {
    if (restaurant?.id) {
      fetchOrders();
    }
  }, [restaurant]);

  // Function to fetch orders
  const fetchOrders = async () => {
    if (!restaurant?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get restaurant orders using the orderApi
      const response = await orderApi.getRestaurantOrders(restaurant.id, 0, 20);
      
      if (!response) {
        console.warn('Empty response received from orders API');
        setOrders([]);
      } else {
        // Get the content from the response
        const allOrders = response.content || [];
        
        console.log(`Loaded ${allOrders.length} orders for restaurant ${restaurant.id}`);
        
        // Sort by date (newest first)
        const sortedOrders = [...allOrders].sort((a, b) => {
          const dateA = new Date(a.orderDate || a.created || a.orderTime || 0);
          const dateB = new Date(b.orderDate || b.created || b.orderTime || 0);
          return dateB - dateA;
        });
        
        // Take only the most recent orders based on maxOrders
        setOrders(sortedOrders.slice(0, maxOrders));
      }
    } catch (err) {
      console.error('Error fetching restaurant orders:', err);
      
      // More descriptive error messages based on error type
      if (err.message?.includes('Authentication required') || 
          err.message?.includes('401') || 
          err.message?.includes('403')) {
        setError(t('errors.sessionExpired') || 'Your session has expired. Please refresh the page and log in again.');
      } else if (err.message?.includes('Network Error')) {
        setError(t('errors.networkError') || 'Network error. Please check your connection.');
      } else {
        setError(t('errors.failedToFetchOrders') || 'Failed to load orders. Please try again.');
      }
      
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Add function to handle refreshing token and retrying
  const handleRetry = () => {
    // Get a fresh token from storage
    const token = localStorage.getItem('token');
    if (!token) {
      // If no token is found, reload the page to trigger login
      window.location.reload();
      return;
    }
    
    // Store a timestamp with the token to track when we last refreshed
    localStorage.setItem('token_refreshed_at', Date.now().toString());
    console.log('Refreshing token and retrying fetch...');
    
    // Try again with fresh token
    fetchOrders();
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '—';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status class for styling
  const getStatusClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100';
      case 'READY':
        return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100';
      case 'COMPLETED':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('admin.recentOrders') || 'Recent Orders'}
        </h2>
        <button 
          onClick={fetchOrders}
          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          disabled={loading}
        >
          <HiOutlineRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg mb-4">
          <p className="mb-2">{error}</p>
          <div className="flex justify-end mt-2">
            <button
              onClick={handleRetry}
              className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-300 rounded"
            >
              {t('common.retry') || 'Retry'}
            </button>
          </div>
        </div>
      )}
      
      {loading && !orders.length ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          {t('manager.noOrders') || 'No orders found for this restaurant.'}
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">
                    {t('orders.id') || 'ID'}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">
                    {t('orders.customer') || 'Customer'}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">
                    {t('orders.total') || 'Total'}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">
                    {t('orders.status') || 'Status'}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">
                    {t('orders.date') || 'Date'}
                  </th>
                  {onViewDetails && (
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">
                      {t('common.actions') || 'Actions'}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">#{order.id}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-200">
                        {order.customerName || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-200">
                        {formatCurrency(order.totalAmount || order.totalPrice)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status || order.orderStatus)}`}>
                        {order.status || order.orderStatus || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-200">
                        {formatDate(order.orderDate || order.created || order.orderTime)}
                      </div>
                    </td>
                    {onViewDetails && (
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(order);
                          }}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <HiEye className="h-5 w-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentOrdersCard; 