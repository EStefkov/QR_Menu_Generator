import { useState, useEffect } from 'react';
import { HiX, HiExclamationCircle, HiCheck } from 'react-icons/hi';
import { useLanguage } from '../../contexts/LanguageContext';
import { updateUserRoleByManager, getManagedRestaurants } from '../../api/adminDashboard';

const ManagerRoleUpdateModal = ({ isOpen, onClose, account, onRoleUpdated, restaurantId = null }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedRole, setSelectedRole] = useState(account?.accountType || 'ROLE_USER');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [managedRestaurants, setManagedRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);

  useEffect(() => {
    // Reset state when modal is opened
    if (isOpen) {
      setSelectedRole(account?.accountType || 'ROLE_USER');
      setError(null);
      setSuccess(false);
      
      // If restaurantId is provided, use it
      if (restaurantId) {
        setSelectedRestaurant(restaurantId);
      } else {
        // Otherwise fetch restaurants as before
        fetchManagedRestaurants();
      }
    }
  }, [isOpen, account, restaurantId]);

  // Fetch restaurant details if restaurantId is provided
  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantDetails(restaurantId);
    }
  }, [restaurantId]);

  const fetchRestaurantDetails = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/restaurants/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentRestaurant(data);
      }
    } catch (err) {
      console.error('Error fetching restaurant details:', err);
    }
  };

  const fetchManagedRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const token = localStorage.getItem('token');
      const restaurants = await getManagedRestaurants(token);
      setManagedRestaurants(restaurants);
      if (restaurants.length > 0) {
        setSelectedRestaurant(restaurants[0].id);
      }
    } catch (err) {
      console.error('Error fetching managed restaurants:', err);
      setError(t('manager.errorLoadingRestaurants') || 'Failed to load your restaurants');
    } finally {
      setLoadingRestaurants(false);
    }
  };

  if (!isOpen) return null;

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleRestaurantChange = (e) => {
    setSelectedRestaurant(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      // If role is COMANAGER, we need to provide a restaurant ID
      const restaurantIdToUse = selectedRole === 'ROLE_COMANAGER' ? (restaurantId || selectedRestaurant) : null;
      
      await updateUserRoleByManager(token, account.id, selectedRole, restaurantIdToUse);
      setSuccess(true);
      
      // Callback to parent component
      if (onRoleUpdated) {
        onRoleUpdated(account.id, selectedRole);
      }
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err.message || 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to display user-friendly role names
  const getRoleFriendlyName = (roleType) => {
    const roleNames = {
      'ROLE_USER': t('roles.user') || 'User',
      'ROLE_ADMIN': t('roles.admin') || 'Administrator',
      'ROLE_MANAGER': t('roles.manager') || 'Manager',
      'ROLE_COMANAGER': t('roles.comanager') || 'Co-Manager'
    };
    return roleNames[roleType] || roleType;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <HiX className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t('manager.updateUserRole') || 'Update User Role'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded flex items-center">
            <HiExclamationCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded flex items-center">
            <HiCheck className="h-5 w-5 mr-2" />
            <span>{t('manager.roleUpdated') || 'Role updated successfully!'}</span>
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {t('manager.updateRoleFor') || 'Update role for'}: 
            <span className="font-medium text-gray-900 dark:text-white ml-1">
              {account?.firstName || ''} {account?.lastName || ''} ({account?.mailAddress || ''})
            </span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('manager.currentRole') || 'Current role'}: 
            <span className="font-medium text-gray-900 dark:text-white ml-1">
              {getRoleFriendlyName(account?.accountType)}
            </span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('manager.selectRole') || 'Select new role'}
            </label>
            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={loading}
            >
              <option value="ROLE_USER">{t('roles.user') || 'User'}</option>
              <option value="ROLE_COMANAGER">{t('roles.comanager') || 'Co-Manager'}</option>
            </select>
          </div>
          
          {selectedRole === 'ROLE_COMANAGER' && restaurantId && currentRestaurant && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('manager.restaurant') || 'Restaurant'}
              </label>
              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentRestaurant.name || currentRestaurant.restorantName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('manager.userWillBeAssignedTo') || 'User will be assigned to this restaurant'}
                </p>
              </div>
            </div>
          )}
          
          {selectedRole === 'ROLE_COMANAGER' && !restaurantId && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('manager.selectRestaurant') || 'Select restaurant'}
              </label>
              
              {loadingRestaurants ? (
                <div className="text-center py-3">
                  <div className="spinner mr-2"></div>
                  <span>{t('common.loading') || 'Loading...'}</span>
                </div>
              ) : managedRestaurants.length === 0 ? (
                <div className="text-yellow-600 dark:text-yellow-400 text-sm">
                  {t('manager.noRestaurants') || 'You have no restaurants to assign. Please create a restaurant first.'}
                </div>
              ) : (
                <select
                  value={selectedRestaurant}
                  onChange={handleRestaurantChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={loading}
                  required
                >
                  {managedRestaurants.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.restorantName || restaurant.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md mr-2 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
              disabled={loading}
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              disabled={loading || (selectedRole === 'ROLE_COMANAGER' && !restaurantId && !selectedRestaurant)}
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  {t('common.updating') || 'Updating...'}
                </>
              ) : (
                t('manager.updateRole') || 'Update Role'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagerRoleUpdateModal; 