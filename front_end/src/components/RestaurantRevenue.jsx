import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { restaurantApi } from '../api/restaurantApi';
import axios from 'axios';
import { HiCurrencyDollar, HiShoppingCart, HiCalendar, HiChartBar, HiRefresh } from 'react-icons/hi';

const timeRanges = ['day', 'week', 'month', 'year', 'all'];

const RestaurantRevenue = ({ restaurantId, restaurantName }) => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantStats();
    }
  }, [restaurantId, timeRange]);

  const fetchRestaurantStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      // Build appropriate time filter based on timeRange
      const now = new Date();
      let startDate = new Date();
      switch(timeRange) {
        case 'day':
          startDate.setHours(0, 0, 0, 0); // Beginning of today
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'all':
          startDate = new Date(0); // Beginning of time (1970)
          break;
        default:
          startDate.setMonth(now.getMonth() - 1); // Default to one month
      }
      
      console.log(`Fetching orders for restaurant ${restaurantId} from ${startDate.toISOString()} to ${now.toISOString()}`);
      
      // Use relative path with Vite proxy instead of absolute URL
      const ordersResponse = await axios.get(`/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Successfully fetched orders:', ordersResponse.data);
      
      // Process the orders
      let orders = [];
      if (ordersResponse.data && Array.isArray(ordersResponse.data)) {
        orders = ordersResponse.data;
      } else if (ordersResponse.data && ordersResponse.data.content && Array.isArray(ordersResponse.data.content)) {
        orders = ordersResponse.data.content;
      }
      
      // Filter orders for this specific restaurant and time range
      const filteredOrders = orders.filter(order => {
        // Check restaurant ID (handle different field names)
        const orderRestaurantId = order.restaurantId || order.restorantId;
        const stringRestaurantId = orderRestaurantId ? orderRestaurantId.toString() : '';
        const currentRestaurantId = restaurantId.toString();
        
        // Check date range
        const orderDate = new Date(order.orderTime || order.created || order.date);
        const withinDateRange = orderDate >= startDate && orderDate <= now;
        
        return (stringRestaurantId === currentRestaurantId) && withinDateRange;
      });
      
      console.log(`Found ${filteredOrders.length} orders for restaurant ${restaurantId}`);
      
      // Calculate stats from filtered orders
      let totalRevenue = 0;
      let latestOrderDate = null;
      let latestOrderId = null;
      
      // Calculate revenue
      filteredOrders.forEach(order => {
        // Add to total revenue - handle different property names
        const orderTotal = order.totalPrice || order.totalAmount || order.total || 0;
        totalRevenue += parseFloat(orderTotal);
        
        // Track latest order
        const orderDate = new Date(order.orderTime || order.created || order.date);
        if (!latestOrderDate || orderDate > new Date(latestOrderDate)) {
          latestOrderDate = order.orderTime || order.created || order.date;
          latestOrderId = order.id;
        }
      });
      
      console.log(`Calculated stats for restaurant ${restaurantId}: ${totalRevenue} total revenue, ${filteredOrders.length} orders`);
      
      // Set calculated stats
      setStats({
        totalRevenue,
        totalOrders: filteredOrders.length,
        latestOrderDate,
        latestOrderId
      });
      
    } catch (err) {
      console.error('Error fetching restaurant stats:', err);
      setError(err.message || 'Failed to fetch restaurant statistics');
      
      // Set some default stats to avoid empty display
      setStats({
        totalRevenue: 0,
        totalOrders: 0,
        latestOrderDate: null,
        latestOrderId: null
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat().format(num);
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString.toString().substring(0, 10);
    }
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'day': return t('stats.today') || 'Today';
      case 'week': return t('stats.thisWeek') || 'This Week';
      case 'month': return t('stats.thisMonth') || 'This Month';
      case 'year': return t('stats.thisYear') || 'This Year';
      case 'all': return t('stats.allTime') || 'All Time';
      default: return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
          <span className="mr-2">{t('stats.restaurantRevenue') || 'Restaurant Revenue'}:</span>
          <span className="text-blue-600 dark:text-blue-400 block sm:inline text-ellipsis overflow-hidden">{restaurantName}</span>
        </h2>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              {timeRanges.map(range => (
                <option key={range} value={range}>
                  {t(`stats.${range}`) || range.charAt(0).toUpperCase() + range.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={fetchRestaurantStats}
            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            aria-label="Refresh"
          >
            <HiRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {loading && !stats && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Revenue Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-800 mr-4 flex-shrink-0">
                <HiCurrencyDollar className="h-6 w-6 text-green-700 dark:text-green-300" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{t('stats.totalRevenue') || 'Total Revenue'}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {formatCurrency(stats.totalRevenue || 0)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{getTimeRangeLabel()}</p>
              </div>
            </div>
          </div>
          
          {/* Orders Count Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-800 mr-4 flex-shrink-0">
                <HiShoppingCart className="h-6 w-6 text-blue-700 dark:text-blue-300" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{t('stats.totalOrders') || 'Total Orders'}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {formatNumber(stats.totalOrders || 0)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{getTimeRangeLabel()}</p>
              </div>
            </div>
          </div>
          
          {/* Average Order Value */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900 dark:to-violet-900 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-800 mr-4 flex-shrink-0">
                <HiChartBar className="h-6 w-6 text-purple-700 dark:text-purple-300" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{t('stats.avgOrderValue') || 'Avg Order Value'}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {stats.totalOrders > 0 
                    ? formatCurrency((stats.totalRevenue || 0) / stats.totalOrders) 
                    : formatCurrency(0)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{getTimeRangeLabel()}</p>
              </div>
            </div>
          </div>
          
          {/* Latest Order */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-800 mr-4 flex-shrink-0">
                <HiCalendar className="h-6 w-6 text-amber-700 dark:text-amber-300" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{t('stats.latestOrder') || 'Latest Order'}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {stats.latestOrderDate 
                    ? formatDateTime(stats.latestOrderDate)
                    : t('stats.noOrders') || 'No orders yet'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                  {stats.latestOrderId ? `ID: ${stats.latestOrderId}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantRevenue; 