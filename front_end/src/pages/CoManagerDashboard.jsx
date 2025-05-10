import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext.jsx';
import { HiOutlineRefresh, HiOutlineExclamationCircle } from 'react-icons/hi';
import { ImSpinner8 } from 'react-icons/im';
import { MdOutlineCreate } from 'react-icons/md';
import axios from 'axios';
import RestaurantRevenue from '../components/RestaurantRevenue';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const CoManagerDashboard = () => {
  const { t } = useLanguage();
  const { userData } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignedRestaurants, setAssignedRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurantOrder, setRestaurantOrder] = useState({});

  // Fetch data when component mounts
  useEffect(() => {
    // Check if we have a userId before trying to fetch data
    const storedUserId = userData?.id || localStorage.getItem('userId');
    if (!storedUserId) {
      console.error('No user ID available, cannot fetch assigned restaurants');
      setError(t('common.userNotAuthenticated') || 'User authentication required');
      setLoading(false);
      return;
    }
    
    // First try the debug endpoint
    debugAssignments();
    
    // Then proceed with normal data fetching
    fetchAssignedRestaurants();
  }, []);

  // Debug function to get detailed information about assignments
  const debugAssignments = async () => {
    try {
      const token = userData?.token || localStorage.getItem('token');
      const userId = userData?.id || localStorage.getItem('userId');
      
      console.log('Calling debug endpoint for userId:', userId);
      
      const debugResponse = await axios.get(`${API_BASE_URL}/api/manager-assignments/debug-assignments/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Debug endpoint response:', debugResponse.data);
      
      // If the debug endpoint shows we have assignments, but they don't appear
      // in the regular endpoint, we can use this data to display restaurants
      if (debugResponse.data.userAssignments && debugResponse.data.userAssignments.length > 0) {
        console.log('Found assignments in debug endpoint that might not appear in regular endpoint');
        
        // This is just for testing - we'll continue with the normal flow
        // but we now have data to work with if needed
        const debugRestaurants = debugResponse.data.userAssignments.map(assignment => ({
          id: assignment.restaurantId,
          name: assignment.restaurantName || 'Unknown Restaurant',
          restorantName: assignment.restaurantName || 'Unknown Restaurant',
          address: '',
          phoneNumber: '',
          email: ''
        }));
        
        console.log('Debug data:', debugRestaurants);
        
        // Store this data in localStorage as a fallback 
        localStorage.setItem('debug_restaurants', JSON.stringify(debugRestaurants));
      }
    } catch (error) {
      console.error('Error calling debug endpoint:', error);
    }
  };

  const fetchAssignedRestaurants = async () => {
    setLoading(true);
    try {
      const token = userData?.token || localStorage.getItem('token');
      const userId = userData?.id || localStorage.getItem('userId');
      
      console.log('Fetching assigned restaurants for userId:', userId);
      console.log('Using token:', token ? `${token.substring(0, 15)}...` : 'No token found'); // Show first 15 chars of token
      
      // Log the user data for debugging
      console.log('User data from context/localStorage:', {
        contextUserId: userData?.id,
        localStorageUserId: localStorage.getItem('userId'),
        contextAccountType: userData?.accountType,
        localStorageAccountType: localStorage.getItem('accountType')
      });

      // Try the managed restaurants endpoint first - this should now work correctly for Co-Managers
      try {
        console.log('Trying main managed restaurants endpoint...');
        
        const restaurantsResponse = await axios.get(`${API_BASE_URL}/api/restaurants/managed`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Successfully fetched from /api/restaurants/managed');
        
        if (Array.isArray(restaurantsResponse.data) && restaurantsResponse.data.length > 0) {
          setAssignedRestaurants(restaurantsResponse.data.map(restaurant => ({
            id: restaurant.id,
            name: restaurant.restorantName || 'Unknown Restaurant',
            restorantName: restaurant.restorantName || 'Unknown Restaurant',
            address: restaurant.address || '',
            phoneNumber: restaurant.phoneNumber || '',
            email: restaurant.email || ''
          })));
          
          if (restaurantsResponse.data.length > 0) {
            setSelectedRestaurant(restaurantsResponse.data[0]);
          }
          
          setLoading(false);
          return;
        } else {
          console.log('No assigned restaurants found from managed endpoint');
        }
      } catch (fallbackError) {
        console.log('Managed restaurants endpoint failed:', fallbackError.message);
      }

      // Try the special debug endpoint as a backup
      try {
        console.log('Trying debug assignments endpoint...');
        
        const debugResponse = await axios.get(`${API_BASE_URL}/api/manager-assignments/debug-assignments/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (debugResponse.data && debugResponse.data.userAssignments && debugResponse.data.userAssignments.length > 0) {
          console.log('Successfully found assigned restaurants via debug endpoint');
          
          // Extract only the restaurants this Co-Manager is assigned to
          const assignedRestaurants = debugResponse.data.userAssignments.map(assignment => ({
            id: assignment.restaurantId,
            name: assignment.restaurantName || 'Unknown Restaurant',
            restorantName: assignment.restaurantName || 'Unknown Restaurant',
            address: '',
            phoneNumber: '',
            email: ''
          }));
          
          console.log('Assigned restaurants from debug endpoint:', assignedRestaurants);
          
          setAssignedRestaurants(assignedRestaurants);
          
          if (assignedRestaurants.length > 0) {
            setSelectedRestaurant(assignedRestaurants[0]);
          }
          
          setLoading(false);
          return;
        } else {
          console.log('No assigned restaurants found from debug endpoint');
        }
      } catch (debugError) {
        console.log('Debug endpoint failed:', debugError.message);
      }

      // Finally try the original endpoint
      console.log('Trying original endpoint as last resort...');
      
      const response = await axios.get(`${API_BASE_URL}/api/manager-assignments/managed-by/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Debug response structure:', {
        isArray: Array.isArray(response.data),
        length: Array.isArray(response.data) ? response.data.length : 'not array',
        firstItem: Array.isArray(response.data) && response.data.length > 0 ? 
          Object.keys(response.data[0]) : 'no items'
      });
      
      // Process the response - extract restaurants from assignments
      let restaurants = [];
      if (Array.isArray(response.data)) {
        // The response should be an array of ManagerAssignment objects
        restaurants = response.data.map(assignment => {
          // Debug the assignment object to see what properties it has
          console.log('Assignment structure:', 
            assignment && typeof assignment === 'object' ? 
              { hasRestorant: !!assignment.restorant, keys: Object.keys(assignment) } : 
              'Not an object');
          
          // Handle both direct restorant reference and serialized reference
          const restaurant = assignment.restorant || {};
          
          return {
            id: restaurant.id || assignment.restorantId,
            name: restaurant.restorantName || restaurant.name || 'Unknown Restaurant',
            restorantName: restaurant.restorantName || restaurant.name || 'Unknown Restaurant',
            address: restaurant.address || '',
            phoneNumber: restaurant.phoneNumber || '',
            email: restaurant.email || ''
          };
        });
      }
      
      console.log('Number of assigned restaurants found:', restaurants.length);
      
      setAssignedRestaurants(restaurants);
      
      // If restaurants exist, select the first one
      if (restaurants.length > 0) {
        setSelectedRestaurant(restaurants[0]);
      } else {
        console.log('No assigned restaurants found from any endpoint');
      }
    } catch (error) {
      console.error('Error fetching assigned restaurants:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      });
      
      // Try the fallback debug data if available
      const debugRestaurantsStr = localStorage.getItem('debug_restaurants');
      if (debugRestaurantsStr) {
        try {
          const debugRestaurants = JSON.parse(debugRestaurantsStr);
          console.log('Using debug fallback data:', debugRestaurants);
          
          if (Array.isArray(debugRestaurants) && debugRestaurants.length > 0) {
            setAssignedRestaurants(debugRestaurants);
            setSelectedRestaurant(debugRestaurants[0]);
            setError('Using debug data - some features might be limited');
            setLoading(false);
            return;
          }
        } catch (fallbackError) {
          console.error('Error parsing debug fallback data:', fallbackError);
        }
      }
      
      setError(`${t('common.errorFetchingData') || 'Failed to load data'}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleEditMenu = (restaurantId) => {
    // Make sure selected restaurant is available
    if (!selectedRestaurant) return;
    
    // Navigate to the menus route
    navigate(`/comanager/menus`, {
      state: {
        restaurantId: selectedRestaurant.id,
        restaurantName: selectedRestaurant.name || selectedRestaurant.restorantName,
        fromCoManager: true
      }
    });
  };

  // If loading, show loading spinner
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
            {t('comanager.dashboard') || 'Co-Manager Dashboard'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('comanager.welcomeMessage') || 'Welcome to your co-manager dashboard. Manage restaurants you have been assigned to.'}
          </p>
        </div>
        <div>
          <button 
            onClick={fetchAssignedRestaurants} 
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column - Restaurant selection */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('comanager.assignedRestaurants') || 'Assigned Restaurants'}
            </h2>
            
            {assignedRestaurants.length === 0 ? (
              <div className="text-center py-6">
                <HiOutlineExclamationCircle className="mx-auto h-10 w-10 text-yellow-400" />
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {t('comanager.noRestaurantsAssigned') || 'You are not assigned to any restaurants yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {assignedRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className={`p-3 rounded-md cursor-pointer transition ${
                      selectedRestaurant && selectedRestaurant.id === restaurant.id
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleRestaurantSelect(restaurant)}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {restaurant.name || restaurant.restorantName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {restaurant.address || t('common.notProvided') || 'Not provided'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Restaurant details */}
        <div className="lg:col-span-3">
          {!selectedRestaurant ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-center py-8">
                <HiOutlineExclamationCircle className="mx-auto h-12 w-12 text-yellow-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  {assignedRestaurants.length === 0 
                    ? (t('comanager.noRestaurantsAssigned') || 'You are not assigned to any restaurants yet.')
                    : (t('comanager.selectRestaurant') || 'Select a restaurant to view details')}
                </h3>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {/* Restaurant Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedRestaurant.name || selectedRestaurant.restorantName}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('common.address') || 'Address'}:
                    </p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {selectedRestaurant.address || t('common.notProvided') || 'Not provided'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('common.phone') || 'Phone'}:
                    </p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {selectedRestaurant.phoneNumber || t('common.notProvided') || 'Not provided'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('common.email') || 'Email'}:
                    </p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {selectedRestaurant.email || t('common.notProvided') || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Restaurant Actions */}
              <div className="p-6">
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => handleEditMenu(selectedRestaurant.id)}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    <MdOutlineCreate className="mr-2" />
                    {t('comanager.manageMenus') || 'Manage Menus'}
                  </button>
                </div>
              </div>

              {/* Restaurant Revenue Statistics */}
              <div className="p-6">
                <RestaurantRevenue 
                  restaurantId={selectedRestaurant.id}
                  restaurantName={selectedRestaurant.name || selectedRestaurant.restorantName}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoManagerDashboard; 