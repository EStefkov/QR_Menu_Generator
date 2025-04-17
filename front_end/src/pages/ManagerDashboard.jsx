import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getManagedRestaurants, getManagersByRestaurant } from '../api/adminDashboard';
import { HiOutlineRefresh, HiOutlineExclamationCircle, HiArrowUp, HiArrowDown } from 'react-icons/hi';
import { ImSpinner8 } from 'react-icons/im';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ManagerDashboard = () => {
  const { t } = useLanguage();
  const { userData } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [otherManagers, setOtherManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [restaurantOrder, setRestaurantOrder] = useState({});

  // First useEffect to ensure auth is properly initialized
  useEffect(() => {
    // Check if we have authentication data either from context or localStorage
    if (userData?.token || localStorage.getItem('token')) {
      setIsAuthInitialized(true);
    } else {
      // If no auth data is available after a short delay, redirect to login
      const timer = setTimeout(() => {
        navigate('/login');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [userData, navigate]);

  // Only run the main logic after auth is initialized
  useEffect(() => {
    if (!isAuthInitialized) return;
    
    // Ensure the user is a manager
    const accountType = userData?.accountType || localStorage.getItem('accountType');
    if (accountType !== 'ROLE_MANAGER') {
      navigate('/');
      return;
    }
    
    fetchManagedRestaurants();
  }, [isAuthInitialized, userData, navigate]);

  const fetchManagedRestaurants = async () => {
    setLoading(true);
    try {
      const token = userData?.token || localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/restaurants/managed`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Get user ID for storing custom order
      const userId = userData?.id || localStorage.getItem('userId');
      const orderKey = `restaurant_order_${userId}`;
      let storedOrder = {};
      
      try {
        const savedOrder = localStorage.getItem(orderKey);
        if (savedOrder) {
          storedOrder = JSON.parse(savedOrder);
          setRestaurantOrder(storedOrder);
        }
      } catch (e) {
        console.error('Error loading saved restaurant order:', e);
      }
      
      // Sort restaurants by order if order exists
      let sortedRestaurants = [...response.data];
      if (Object.keys(storedOrder).length > 0) {
        sortedRestaurants.sort((a, b) => {
          const orderA = storedOrder[a.id] !== undefined ? storedOrder[a.id] : 9999;
          const orderB = storedOrder[b.id] !== undefined ? storedOrder[b.id] : 9999;
          return orderA - orderB;
        });
      }
      
      setRestaurants(sortedRestaurants);
      if (sortedRestaurants.length > 0) {
        setSelectedRestaurant(sortedRestaurants[0]);
        fetchRestaurantManagers(sortedRestaurants[0].id);
      }
    } catch (error) {
      console.error('Error fetching managed restaurants:', error);
      setError(t('common.errorFetchingData') || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantManagers = async (restaurantId) => {
    setLoadingManagers(true);
    try {
      const token = userData?.token || localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/manager-assignments/restaurant/${restaurantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check if response.data is an array before filtering
      const managers = Array.isArray(response.data) ? response.data : [];
      
      // Filter out the current user from the managers list
      const currentUserId = userData?.id || parseInt(localStorage.getItem('userId'));
      const filteredManagers = managers.filter(manager => manager.account && manager.account.id !== currentUserId);
      setOtherManagers(filteredManagers);
    } catch (error) {
      console.error('Error fetching restaurant managers:', error);
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
    fetchRestaurantManagers(restaurant.id);
  };

  const handleEditMenu = (restaurantId) => {
    navigate(`/manager/menus`, {
      state: {
        restaurantId: selectedRestaurant.id,
        restaurantName: selectedRestaurant.restorantName || selectedRestaurant.name,
        fromManager: true
      }
    });
  };

  const moveRestaurantUp = (index) => {
    if (index === 0) return; // Already at the top
    
    const newRestaurants = [...restaurants];
    // Swap with the restaurant above
    [newRestaurants[index], newRestaurants[index - 1]] = 
    [newRestaurants[index - 1], newRestaurants[index]];
    
    // Update the state
    setRestaurants(newRestaurants);
    
    // Save order to localStorage
    saveRestaurantOrder(newRestaurants);
  };
  
  const moveRestaurantDown = (index) => {
    if (index === restaurants.length - 1) return; // Already at the bottom
    
    const newRestaurants = [...restaurants];
    // Swap with the restaurant below
    [newRestaurants[index], newRestaurants[index + 1]] = 
    [newRestaurants[index + 1], newRestaurants[index]];
    
    // Update the state
    setRestaurants(newRestaurants);
    
    // Save order to localStorage
    saveRestaurantOrder(newRestaurants);
  };
  
  const saveRestaurantOrder = (restaurantList) => {
    try {
      const userId = userData?.id || localStorage.getItem('userId');
      const orderKey = `restaurant_order_${userId}`;
      
      // Create an order object with restaurant IDs as keys and position as values
      const newOrder = {};
      restaurantList.forEach((restaurant, index) => {
        newOrder[restaurant.id] = index;
      });
      
      // Save to state and localStorage
      setRestaurantOrder(newOrder);
      localStorage.setItem(orderKey, JSON.stringify(newOrder));
    } catch (e) {
      console.error('Error saving restaurant order:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <ImSpinner8 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('manager.dashboard') || 'Manager Dashboard'}
          </h1>
          <button 
            onClick={fetchManagedRestaurants} 
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <HiOutlineRefresh className="mr-2" />
            {t('common.refresh') || 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-center">
            <HiOutlineExclamationCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {restaurants.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {t('manager.noRestaurantsAssigned') || 'You are not assigned to any restaurants yet.'}
            </p>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {t('manager.contactAdmin') || 'Please contact an administrator to get assigned to restaurants.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Restaurant List */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                    {t('manager.yourRestaurants') || 'Your Restaurants'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('manager.dragToReorder') || 'Use arrows to change restaurant order'}
                  </p>
                </div>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {restaurants.map((restaurant, index) => (
                    <li 
                      key={restaurant.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition
                        ${selectedRestaurant?.id === restaurant.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                          : ''}`}
                    >
                      <div className="flex items-center">
                        <div className="flex-grow cursor-pointer" onClick={() => handleRestaurantSelect(restaurant)}>
                          <h3 className="font-medium text-gray-800 dark:text-white">
                            {restaurant.restorantName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {restaurant.address}
                          </p>
                        </div>
                        <div className="flex flex-col ml-2">
                          <button 
                            onClick={() => moveRestaurantUp(index)}
                            disabled={index === 0}
                            className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 mb-1 ${
                              index === 0 ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title={t('manager.moveUp') || 'Move up'}
                          >
                            <HiArrowUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </button>
                          <button 
                            onClick={() => moveRestaurantDown(index)}
                            disabled={index === restaurants.length - 1}
                            className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 ${
                              index === restaurants.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title={t('manager.moveDown') || 'Move down'}
                          >
                            <HiArrowDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Restaurant Details */}
            <div className="lg:col-span-2">
              {selectedRestaurant ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                      {selectedRestaurant.restorantName}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t('common.address') || 'Address'}
                        </h3>
                        <p className="mt-1 text-gray-800 dark:text-white">
                          {selectedRestaurant.address || t('common.notProvided') || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t('common.phone') || 'Phone'}
                        </h3>
                        <p className="mt-1 text-gray-800 dark:text-white">
                          {selectedRestaurant.phoneNumber || t('common.notProvided') || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t('common.email') || 'Email'}
                        </h3>
                        <p className="mt-1 text-gray-800 dark:text-white">
                          {selectedRestaurant.email || t('common.notProvided') || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                      <h3 className="text-md font-medium text-gray-800 dark:text-white mb-3">
                        {t('manager.otherManagers') || 'Other Managers'}
                      </h3>
                      {loadingManagers ? (
                        <div className="flex justify-center py-4">
                          <ImSpinner8 className="w-6 h-6 text-blue-500 animate-spin" />
                        </div>
                      ) : otherManagers.length > 0 ? (
                        <ul className="space-y-2">
                          {otherManagers.map(manager => (
                            <li key={manager.id} className="flex items-center text-gray-700 dark:text-gray-300">
                              <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mr-3 text-blue-600 dark:text-blue-300">
                                {(manager.account?.firstName || manager.firstName || '?').charAt(0)}
                                {(manager.account?.lastName || manager.lastName || '?').charAt(0)}
                              </span>
                              {manager.account?.firstName || manager.firstName || 'Unknown'} {manager.account?.lastName || manager.lastName || ''} 
                              {manager.account?.mailAddress || manager.mailAddress ? ` - ${manager.account?.mailAddress || manager.mailAddress}` : ''}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                          {t('manager.noOtherManagers') || 'No other managers assigned to this restaurant'}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end mt-6 space-x-3">
                      <button
                        onClick={() => handleEditMenu(selectedRestaurant.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        {t('manager.manageMenus') || 'Manage Menus'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('manager.selectRestaurant') || 'Select a restaurant to view details'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard; 