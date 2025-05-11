import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiOutlineRefresh } from 'react-icons/hi';
import axios from 'axios';

// Get API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * PopularProductsCard component to display the most popular products for a restaurant
 * 
 * @param {Object} props Component props
 * @param {Object} props.restaurant The restaurant object
 * @param {number} props.maxProducts Maximum number of products to show (defaults to 5)
 */
const PopularProductsCard = ({ restaurant, maxProducts = 5 }) => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (restaurant?.id) {
      fetchPopularProducts();
    }
  }, [restaurant]);

  // Function to fetch popular products
  const fetchPopularProducts = async () => {
    if (!restaurant?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Fetch popular products from API (using API_BASE_URL instead of process.env)
      const response = await axios.get(
        `${API_BASE_URL}/api/restaurants/${restaurant.id}/popular-products?limit=${maxProducts}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Popular products data:', response.data);
      setProducts(response.data || []);
      
    } catch (err) {
      console.error('Error fetching popular products:', err);
      
      // More descriptive error messages based on error type
      if (err.message?.includes('Authentication required') || 
          err.response?.status === 401 || 
          err.response?.status === 403) {
        setError(t('errors.sessionExpired') || 'Your session has expired. Please refresh the page and log in again.');
      } else if (err.message?.includes('Network Error')) {
        setError(t('errors.networkError') || 'Network error. Please check your connection.');
      } else {
        setError(t('errors.failedToFetchPopularProducts') || 'Failed to load most popular products. Please try again.');
      }
      
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '—';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('stats.popularProducts') || 'Most Popular Products'}
        </h2>
        <button 
          onClick={fetchPopularProducts}
          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          disabled={loading}
        >
          <HiOutlineRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {loading && !products.length ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          {t('manager.noProducts') || 'No product data available for this restaurant.'}
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">
                  {t('products.name') || 'Product'}
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">
                  {t('products.price') || 'Price'}
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">
                  {t('stats.orders') || 'Orders'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-200">
                      {formatCurrency(product.price)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-200">
                      {product.orderCount}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PopularProductsCard; 