import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiClock, HiShoppingBag, HiLocationMarker, HiCurrencyDollar } from 'react-icons/hi';
import { profileApi } from '../../api/profileApi';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Check token on component mount
    const token = localStorage.getItem('token');
    if (!token) {
      setError(t('auth.noToken') || 'Please log in to view your orders');
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders page:', page);
      
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        setError(t('auth.noToken') || 'Please log in to view your orders');
        return;
      }

      const response = await profileApi.getUserOrders(page, 10);
      console.log('Orders response:', response);

      if (response.content) {
        // Handle paginated response
        setOrders(prev => page === 0 ? response.content : [...prev, ...response.content]);
        setHasMore(!response.last);
      } else {
        // Handle non-paginated response
        setOrders(prev => page === 0 ? response : [...prev, ...response]);
        setHasMore(false);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.response?.status === 403) {
        setError(t('auth.sessionExpired') || 'Your session has expired. Please log in again.');
        // Optionally redirect to login
        // navigate('/login');
      } else {
        setError(t('orders.fetchError') || 'Failed to load order history');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.notAvailable') || 'Not available';
    try {
      const dateOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      const locale = localStorage.getItem('language') === 'bg' ? 'bg-BG' : 'en-US';
      return new Date(dateString).toLocaleDateString(locale, dateOptions);
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateString;
    }
  };

  if (loading && page === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg">
        <p>{error}</p>
        {error.includes('session') && (
          <button
            onClick={() => navigate('/login')}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            {t('auth.login') || 'Log In'}
          </button>
        )}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <HiShoppingBag className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          {t('orders.noOrders') || 'No orders found'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {t('orders.order')} #{order.id}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                  <HiClock className="w-4 h-4 mr-1" />
                  {formatDate(order.orderTime)}
                </p>
              </div>
              <div className="mt-2 sm:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  order.orderStatus === 'ACCEPTED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  order.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {order.orderStatus}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <HiLocationMarker className="w-4 h-4 mr-1" />
                    {t('orders.restaurant')}
                  </p>
                  <p className="mt-1 text-gray-800 dark:text-white">
                    {order.restorantName || t('orders.unknownRestaurant')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <HiCurrencyDollar className="w-4 h-4 mr-1" />
                    {t('orders.total')}
                  </p>
                  <p className="mt-1 text-gray-800 dark:text-white">
                    ${order.totalPrice?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                {t('orders.items')}
              </h4>
              <ul className="space-y-2">
                {order.products?.map((product, index) => (
                  <li key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      {product.quantity}x {product.productName}
                    </span>
                    <span className="text-gray-800 dark:text-white">
                      ${(product.productPriceAtOrder * product.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
      
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {hasMore && !loading && (
        <div className="flex justify-center py-4">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            {t('common.loadMore') || 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderHistory; 