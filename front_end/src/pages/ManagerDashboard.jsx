import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getManagedRestaurants, getManagersByRestaurant, fetchAllAccountsApi } from '../api/adminDashboard';
import { HiOutlineRefresh, HiOutlineExclamationCircle, HiArrowUp, HiArrowDown, HiOutlinePlusCircle, HiUserGroup } from 'react-icons/hi';
import { ImSpinner8 } from 'react-icons/im';
import { MdOutlineCreate, MdOutlineAssignmentInd } from 'react-icons/md';
import axios from 'axios';
import CreateRestaurantModal from '../components/CreateRestaurantModal';
import ManagerAccountsTable from '../components/manager/ManagerAccountsTable';
import RestaurantRevenue from '../components/RestaurantRevenue';
import RecentOrdersCard from '../components/common/RecentOrdersCard';
import OrderDetailsModal from '../components/common/OrderDetailsModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ManagerDashboard = () => {
  const { t } = useLanguage();
  const { userData } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [createdRestaurants, setCreatedRestaurants] = useState([]);
  const [assignedRestaurants, setAssignedRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [otherManagers, setOtherManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [restaurantOrder, setRestaurantOrder] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [activeTab, setActiveTab] = useState('restaurants'); // 'restaurants' or 'managers'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderUpdateSuccess, setOrderUpdateSuccess] = useState(false);

  // Initialize translation keys if they don't exist
  useEffect(() => {
    // Add missing translation keys
    if (!t('manager.assigned')) {
      console.log('Adding missing translation key: manager.assigned');
    }
    if (!t('manager.createRestaurant')) {
      console.log('Adding missing translation key: manager.createRestaurant');
    }
    if (!t('manager.createdRestaurants')) {
      console.log('Adding missing translation key: manager.createdRestaurants');
    }
    if (!t('manager.assignedRestaurants')) {
      console.log('Adding missing translation key: manager.assignedRestaurants');
    }
    if (!t('common.create')) {
      console.log('Adding missing translation key: common.create');
    }
    if (!t('common.creating')) {
      console.log('Adding missing translation key: common.creating');
    }
  }, [t]);

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
      const userId = userData?.id || localStorage.getItem('userId');
      
      const response = await axios.get(`${API_BASE_URL}/api/restaurants/managed`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Separate restaurants into created and assigned
      const created = response.data.filter(restaurant => restaurant.accountId === parseInt(userId));
      const assigned = response.data.filter(restaurant => restaurant.accountId !== parseInt(userId));
      
      setCreatedRestaurants(created);
      setAssignedRestaurants(assigned);
      
      // Get user ID for storing custom order
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
      const filteredManagers = managers.filter(manager => 
        manager.account && 
        manager.account.id !== currentUserId &&
        (manager.account.accountType === 'ROLE_MANAGER' || manager.account.accountType === 'ROLE_COMANAGER')
      );
      
      console.log('Team members for this restaurant:', filteredManagers);
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
    // Make sure selected restaurant is available
    if (!selectedRestaurant) return;
    
    // Navigate to the menus route (without ID parameter in the URL)
    navigate(`/manager/menus`, {
      state: {
        restaurantId: selectedRestaurant.id,
        restaurantName: selectedRestaurant.name || selectedRestaurant.restorantName,
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

  const isCreatedByManager = (restaurant) => {
    const userId = userData?.id || parseInt(localStorage.getItem('userId'));
    return restaurant.accountId === userId;
  };

  const handleCreateRestaurantSuccess = () => {
    // Refresh the restaurant list
    fetchManagedRestaurants();
  };

  // Add a function to fetch all accounts
  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const token = userData?.token || localStorage.getItem('token');
      // Use the existing API function to get all accounts
      const accountsData = await fetchAllAccountsApi(token);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError(t('common.errorFetchingData') || 'Failed to load accounts data');
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Modify the useEffect to also fetch accounts when switching to the managers tab
  useEffect(() => {
    if (activeTab === 'managers' && accounts.length === 0) {
      fetchAccounts();
    }
  }, [activeTab]);

  // Add a handler for updating account roles
  const handleAccountRoleUpdate = (updatedAccount) => {
    // Update the accounts list with the new role
    setAccounts(prev => 
      prev.map(account => 
        account.id === updatedAccount.id 
          ? { ...account, accountType: updatedAccount.accountType }
          : account
      )
    );
  };

  // Add a function to handle viewing order details
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // Add a function to handle updating order status
  const handleOrderUpdated = (orderId, newStatus) => {
    // Show success message
    setOrderUpdateSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setOrderUpdateSuccess(false);
    }, 3000);
    
    // Close the modal
    setShowOrderModal(false);
    
    // Refresh the orders data
    // This will cause the RecentOrdersCard component to re-fetch its data
    if (selectedRestaurant) {
      // Force a restaurant re-selection to refresh all data
      const currentRestaurant = {...selectedRestaurant};
      setSelectedRestaurant(null);
      setTimeout(() => {
        setSelectedRestaurant(currentRestaurant);
      }, 100);
    }
  };

  // Fix: We'll check if loading state first, then render content
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <ImSpinner8 className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400" />
          <span className="ml-3 text-lg text-gray-700 dark:text-gray-300">
            {t('common.loading') || 'Loading...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('manager.dashboard') || 'Manager Dashboard'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('manager.welcomeMessage') || 'Welcome to your restaurant management dashboard.'}
          </p>
        </div>
        <div>
          <button 
            onClick={fetchManagedRestaurants} 
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <HiOutlineRefresh className="mr-2" />
            {t('common.refresh') || 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-center">
          <HiOutlineExclamationCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Tabs for switching between restaurants and managers */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`inline-flex items-center px-4 py-2 rounded-t-lg ${
                activeTab === 'restaurants'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <MdOutlineCreate className="w-5 h-5 mr-2" />
              {t('manager.restaurants') || 'My Restaurants'}
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('managers')}
              className={`inline-flex items-center px-4 py-2 rounded-t-lg ${
                activeTab === 'managers'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <HiUserGroup className="w-5 h-5 mr-2" />
              {t('manager.manageCoManagers') || 'Manage Co-Managers'}
            </button>
          </li>
        </ul>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'restaurants' ? (
        /* Restaurant tab content */
        restaurants.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <p className="text-gray-500 dark:text-gray-400 mb-3">
                {t('manager.noRestaurantsAssigned') || 'You are not assigned to any restaurants yet.'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <HiOutlinePlusCircle className="mr-2" />
                {t('manager.createRestaurant') || 'Create Your First Restaurant'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: List of restaurants */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('manager.yourRestaurants') || 'Your Restaurants'}
                </h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none"
                >
                  <HiOutlinePlusCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Created restaurants section */}
                {createdRestaurants.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-green-50 dark:bg-green-900/10">
                      <h3 className="text-sm font-medium text-green-700 dark:text-green-400">
                        {t('manager.createdRestaurants') || 'Created by you'}
                      </h3>
                    </div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {createdRestaurants.map((restaurant, index) => {
                        // Find the overall index in the combined list
                        const overallIndex = restaurants.findIndex(r => r.id === restaurant.id);
                        return (
                          <li 
                            key={restaurant.id}
                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition
                              ${selectedRestaurant?.id === restaurant.id 
                                ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' 
                                : ''}`}
                          >
                            <div className="flex justify-between cursor-pointer" onClick={() => handleRestaurantSelect(restaurant)}>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{restaurant.name || restaurant.restorantName}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{restaurant.address || t('common.notProvided')}</p>
                              </div>
                              <div className="flex items-center space-x-1">
                                {/* Reordering buttons - only show for created restaurants */}
                                <div className="flex flex-col">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveRestaurantUp(overallIndex);
                                    }}
                                    disabled={overallIndex === 0}
                                    className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                                      overallIndex === 0 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                    title={t('manager.moveUp') || 'Move up'}
                                  >
                                    <HiArrowUp className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveRestaurantDown(overallIndex);
                                    }}
                                    disabled={overallIndex === restaurants.length - 1}
                                    className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                                      overallIndex === restaurants.length - 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                    title={t('manager.moveDown') || 'Move down'}
                                  >
                                    <HiArrowDown className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                
                {/* Assigned restaurants section */}
                {assignedRestaurants.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/10">
                      <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        {t('manager.assignedRestaurants') || 'Assigned to you'}
                      </h3>
                    </div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {assignedRestaurants.map((restaurant, index) => {
                        // Find the overall index in the combined list
                        const overallIndex = restaurants.findIndex(r => r.id === restaurant.id);
                        return (
                          <li 
                            key={restaurant.id}
                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition
                              ${selectedRestaurant?.id === restaurant.id 
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                                : ''}`}
                          >
                            <div className="flex justify-between cursor-pointer" onClick={() => handleRestaurantSelect(restaurant)}>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{restaurant.name || restaurant.restorantName}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{restaurant.address || t('common.notProvided')}</p>
                              </div>
                              <div className="self-center text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {t('manager.assigned') || 'Assigned'}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* No restaurants message */}
              {restaurants.length === 0 && (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  {t('manager.noRestaurants') || 'No Restaurants Found'}
                </div>
              )}
            </div>
            
            {/* Middle and right columns: Selected restaurant details */}
            {selectedRestaurant ? (
              <>
                {/* Restaurant details - now spans full width */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {selectedRestaurant.name || selectedRestaurant.restorantName}
                  </h3>
                  
                  {/* Restaurant Revenue Statistics */}
                  <div className="mb-6">
                    <RestaurantRevenue 
                      key={`revenue-${selectedRestaurant.id}-${Date.now()}`}
                      restaurantId={selectedRestaurant.id} 
                    />
                  </div>
                  
                  {/* Recent Orders Section */}
                  <div className="mb-6">
                    <RecentOrdersCard 
                      key={`orders-${selectedRestaurant.id}-${Date.now()}`}
                      restaurant={selectedRestaurant}
                      onViewDetails={handleViewOrderDetails}
                    />
                  </div>
                  
                  {/* Success message for order status updates */}
                  {orderUpdateSuccess && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 rounded">
                      <p>{t('manager.updateOrderStatusSuccess') || 'Order status updated successfully'}</p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('common.address') || 'Address'}
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {selectedRestaurant.address || t('common.notProvided')}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('common.phone') || 'Phone'}
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {selectedRestaurant.phone || selectedRestaurant.phoneNumber || t('common.notProvided')}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('common.email') || 'Email'}
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {selectedRestaurant.email || t('common.notProvided')}
                      </p>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        onClick={() => handleEditMenu(selectedRestaurant.id)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                      >
                        <MdOutlineAssignmentInd className="mr-2 h-5 w-5" />
                        {t('manager.manageMenus') || 'Manage Menus'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-2 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {t('manager.selectRestaurant') || 'Select a restaurant to view details'}
                </p>
              </div>
            )}
          </div>
        )
      ) : (
        /* Co-Managers tab content */
        <div>
          {restaurants.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-center py-8">
                <HiOutlineExclamationCircle className="mx-auto h-12 w-12 text-yellow-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  {t('manager.createRestaurantFirst') || 'You need to create a restaurant first before you can assign co-managers.'}
                </h3>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setActiveTab('restaurants');
                      setShowCreateModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    <HiOutlinePlusCircle className="mr-2" />
                    {t('manager.createRestaurant') || 'Create Restaurant'}
                  </button>
                </div>
              </div>
            </div>
          ) : !selectedRestaurant ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-center py-8">
                <HiOutlineExclamationCircle className="mx-auto h-12 w-12 text-yellow-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  {t('manager.selectRestaurantFirst') || 'Please select a restaurant first to manage its co-managers.'}
                </h3>
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTab('restaurants')}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    <MdOutlineCreate className="mr-2" />
                    {t('manager.restaurants') || 'My Restaurants'}
                  </button>
                </div>
              </div>
            </div>
          ) : loadingAccounts ? (
            <div className="flex justify-center items-center py-20">
              <ImSpinner8 className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {t('common.loading') || 'Loading...'}
              </span>
            </div>
          ) : (
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('manager.coManagersFor') || 'Co-Managers for'}: {selectedRestaurant.name || selectedRestaurant.restorantName}
              </h2>
              <ManagerAccountsTable 
                accounts={accounts} 
                onEdit={handleAccountRoleUpdate}
                restaurantId={selectedRestaurant.id}
                selectedRestaurant={selectedRestaurant}
              />
            </div>
          )}
        </div>
      )}

      {/* Create Restaurant Modal */}
      <CreateRestaurantModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateRestaurantSuccess}
        token={userData?.token || localStorage.getItem('token')}
      />

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setShowOrderModal(false)}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </div>
  );
};

export default ManagerDashboard; 