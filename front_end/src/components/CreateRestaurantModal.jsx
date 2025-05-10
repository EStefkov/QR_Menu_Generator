import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { createRestaurantApi } from '../api/adminDashboard';
import { ImSpinner8 } from 'react-icons/im';

const CreateRestaurantModal = ({ isOpen, onClose, onSuccess, token }) => {
  const { t } = useLanguage();
  const [restaurantData, setRestaurantData] = useState({
    restorantName: '',
    phoneNumber: '',
    address: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRestaurantData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Use token from props or get from localStorage if not provided
      const authToken = token || localStorage.getItem('token');
      
      if (!authToken) {
        throw new Error('Authentication token is missing');
      }
      
      console.log("Submitting restaurant creation with token:", authToken ? 'Token exists' : 'No token');
      await createRestaurantApi(authToken, restaurantData);
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating restaurant:', err);
      setError(err.message || t('common.errorOccurred') || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            {t('manager.createRestaurant') || 'Create New Restaurant'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common.restaurantName') || 'Restaurant Name'} *
                </label>
                <input
                  type="text"
                  name="restorantName"
                  value={restaurantData.restorantName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common.address') || 'Address'} *
                </label>
                <input
                  type="text"
                  name="address"
                  value={restaurantData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common.phone') || 'Phone Number'}
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={restaurantData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common.email') || 'Email'}
                </label>
                <input
                  type="email"
                  name="email"
                  value={restaurantData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
              >
                {loading ? (
                  <>
                    <ImSpinner8 className="w-4 h-4 mr-2 animate-spin" />
                    {t('common.creating') || 'Creating...'}
                  </>
                ) : (
                  t('common.create') || 'Create'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRestaurantModal; 