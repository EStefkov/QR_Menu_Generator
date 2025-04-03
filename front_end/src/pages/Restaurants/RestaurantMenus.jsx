import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { restaurantApi } from '../../api/restaurantApi';
import { HiArrowLeft, HiExclamationCircle, HiEye, HiPencil, HiTrash, HiRefresh, HiPlusCircle, HiX, HiLocationMarker } from 'react-icons/hi';

const CreateMenuForm = ({ restaurantId, onSuccess, onCancel }) => {
  const { t } = useLanguage();
  const [menuData, setMenuData] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMenuData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!menuData.name.trim()) {
      setError(t('validation.nameRequired') || 'Menu name is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Format menu data for API
      const formattedData = {
        category: menuData.name.trim(),
        restaurantId: parseInt(restaurantId, 10),
        description: menuData.description
      };
      
      await restaurantApi.createMenu(restaurantId, formattedData);
      onSuccess();
    } catch (err) {
      console.error('Error creating menu:', err);
      setError(err.message || t('errors.failedToCreateMenu') || 'Failed to create menu');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {t('menus.createNewMenu') || 'Create New Menu'}
        </h3>
        <button 
          onClick={onCancel}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <HiX className="w-5 h-5" />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('menus.name') || 'Menu Name'} *
          </label>
          <input
            type="text"
            name="name"
            value={menuData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder={t('menus.namePlaceholder') || 'Enter menu name'}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('menus.description') || 'Description'}
          </label>
          <textarea
            name="description"
            value={menuData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder={t('menus.descriptionPlaceholder') || 'Enter menu description'}
          ></textarea>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t('common.cancel') || 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? t('common.saving') || 'Saving...' 
              : t('common.save') || 'Save'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

const RestaurantMenus = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  useEffect(() => {
    fetchRestaurantData();
  }, [restaurantId]);
  
  // Helper function to get value from multiple possible field names
  const getFieldValue = (obj, fieldNames, defaultValue = '-') => {
    if (!obj) return defaultValue;
    
    for (const field of fieldNames) {
      if (obj[field] !== undefined && obj[field] !== null && obj[field] !== '') {
        return obj[field];
      }
    }
    
    return defaultValue;
  };
  
  const fetchRestaurantData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch restaurant details and menus in parallel
      const [restaurantData, menusData] = await Promise.all([
        restaurantApi.getRestaurantById(restaurantId),
        restaurantApi.getRestaurantMenus(restaurantId)
      ]);
      
      console.log('Restaurant data received:', restaurantData);
      setRestaurant(restaurantData);
      setMenus(menusData || []);
    } catch (err) {
      console.error('Error fetching restaurant data:', err);
      setError(err.message || 'Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewMenu = (menuId) => {
    navigate(`/menu/${menuId}`);
  };
  
  const handleEditMenu = (menuId) => {
    navigate(`/admin/restaurants/${restaurantId}/menus/${menuId}/edit`);
  };
  
  const handleDeleteMenu = async (menuId) => {
    if (window.confirm(t('menus.confirmDelete') || 'Are you sure you want to delete this menu?')) {
      try {
        await restaurantApi.deleteMenu(menuId);
        
        // Remove the deleted menu from the state
        setMenus(prevMenus => prevMenus.filter(menu => menu.id !== menuId));
      } catch (err) {
        console.error('Error deleting menu:', err);
        alert(t('errors.failedToDeleteMenu') || 'Failed to delete menu');
      }
    }
  };
  
  const handleCreateMenu = () => {
    setShowCreateForm(true);
  };
  
  const handleMenuCreated = () => {
    setShowCreateForm(false);
    fetchRestaurantData(); // Refresh menu list
  };
  
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
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-5 rounded-lg flex flex-col items-start">
          <div className="flex items-start mb-4">
            <HiExclamationCircle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-1">{t('errors.loadFailed') || 'Failed to load data'}</h3>
              <p>{error}</p>
              <p className="mt-3 text-sm">{t('errors.tryAgainLater') || 'Please try again later or contact support if the problem persists.'}</p>
            </div>
          </div>
          
          <button
            onClick={fetchRestaurantData}
            className="flex items-center self-center mt-4 bg-red-100 hover:bg-red-200 dark:bg-red-800/30 dark:hover:bg-red-700/30 text-red-800 dark:text-red-300 font-medium py-2 px-4 rounded-lg transition"
          >
            <HiRefresh className="w-5 h-5 mr-2" />
            {t('common.retry') || 'Retry'}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <HiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {restaurant ? getFieldValue(restaurant, ['name', 'restorantName', 'restaurantName']) : t('restaurants.restaurantMenus') || 'Restaurant Menus'}
          </h1>
        </div>
        
        {!showCreateForm && (
          <button
            onClick={handleCreateMenu}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
          >
            <HiPlusCircle className="mr-2 h-5 w-5" />
            {t('menus.createNew') || 'Create New Menu'}
          </button>
        )}
      </div>
      
      {showCreateForm && (
        <CreateMenuForm 
          restaurantId={restaurantId}
          onSuccess={handleMenuCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
      
      {restaurant && !showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            {t('restaurants.details') || 'Restaurant Details'}
          </h2>
          
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('restaurants.name') || 'Name'}
              </p>
              <p className="text-lg text-gray-900 dark:text-white font-medium">
                {getFieldValue(restaurant, ['name', 'restorantName', 'restaurantName'])}
              </p>
              {getFieldValue(restaurant, ['id', 'restorantId', 'restaurantId'], null) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ID: {getFieldValue(restaurant, ['id', 'restorantId', 'restaurantId'])}
                </p>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('restaurants.address') || 'Address'}
              </p>
              <p className="text-lg text-gray-900 dark:text-white">
                {getFieldValue(restaurant, ['address', 'restorantAddress', 'restaurantAddress', 'location'])}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('restaurants.phone') || 'Phone'}
              </p>
              <p className="text-lg text-gray-900 dark:text-white">
                {getFieldValue(restaurant, ['phone', 'restorantPhone', 'restaurantPhone', 'phoneNumber', 'tel', 'telephone'])}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {getFieldValue(restaurant, ['cuisineType', 'restorantType', 'restaurantType', 'type', 'category'], null) && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('restaurants.cuisineType') || 'Cuisine Type'}
                </p>
                <p className="text-lg text-gray-900 dark:text-white">
                  {getFieldValue(restaurant, ['cuisineType', 'restorantType', 'restaurantType', 'type', 'category'])}
                </p>
              </div>
            )}
            
            {getFieldValue(restaurant, ['status', 'restorantStatus', 'restaurantStatus', 'active'], null) && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('restaurants.status') || 'Status'}
                </p>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    (restaurant.status === 'ACTIVE' || restaurant.restorantStatus === 'ACTIVE' || 
                     restaurant.restaurantStatus === 'ACTIVE' || restaurant.active === true) 
                      ? 'bg-green-500' 
                      : (restaurant.status === 'INACTIVE' || restaurant.restorantStatus === 'INACTIVE' || 
                         restaurant.restaurantStatus === 'INACTIVE' || restaurant.active === false)
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                  }`}></div>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {getFieldValue(restaurant, ['status', 'restorantStatus', 'restaurantStatus']) || 
                     (restaurant.active === true ? 'ACTIVE' : restaurant.active === false ? 'INACTIVE' : '-')}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {getFieldValue(restaurant, ['description', 'restorantDescription', 'restaurantDescription', 'about'], null) && (
            <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('restaurants.description') || 'Description'}
              </p>
              <p className="text-gray-900 dark:text-white">
                {getFieldValue(restaurant, ['description', 'restorantDescription', 'restaurantDescription', 'about'])}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {getFieldValue(restaurant, ['email', 'restorantEmail', 'restaurantEmail', 'contactEmail'], null) && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('restaurants.email') || 'Email'}
                </p>
                <p className="text-gray-900 dark:text-white break-words">
                  {getFieldValue(restaurant, ['email', 'restorantEmail', 'restaurantEmail', 'contactEmail'])}
                </p>
              </div>
            )}
            
            {getFieldValue(restaurant, ['website', 'restorantWebsite', 'restaurantWebsite', 'url', 'site'], null) && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('restaurants.website') || 'Website'}
                </p>
                <a 
                  href={getFieldValue(restaurant, ['website', 'restorantWebsite', 'restaurantWebsite', 'url', 'site']).startsWith('http') 
                    ? getFieldValue(restaurant, ['website', 'restorantWebsite', 'restaurantWebsite', 'url', 'site'])
                    : `https://${getFieldValue(restaurant, ['website', 'restorantWebsite', 'restaurantWebsite', 'url', 'site'])}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline break-words"
                >
                  {getFieldValue(restaurant, ['website', 'restorantWebsite', 'restaurantWebsite', 'url', 'site'])}
                </a>
              </div>
            )}
            
            {getFieldValue(restaurant, ['openingHours', 'restorantOpeningHours', 'restaurantOpeningHours', 'workingHours', 'hours'], null) && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('restaurants.openingHours') || 'Opening Hours'}
                </p>
                <p className="text-gray-900 dark:text-white">
                  {getFieldValue(restaurant, ['openingHours', 'restorantOpeningHours', 'restaurantOpeningHours', 'workingHours', 'hours'])}
                </p>
              </div>
            )}
          </div>
          
          {/* Map location if coordinates are available */}
          {(getFieldValue(restaurant, ['latitude', 'lat'], null) && getFieldValue(restaurant, ['longitude', 'lng'], null)) || 
           getFieldValue(restaurant, ['location'], null) ? (
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                <HiLocationMarker className="w-5 h-5 mr-2 text-red-500" />
                {t('restaurants.location') || 'Location'}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden h-64 relative">
                {/* You can replace this with an actual map component like Google Maps or Leaflet */}
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <a 
                    href={`https://maps.google.com/?q=${
                      getFieldValue(restaurant, ['latitude', 'lat']) || 
                      (restaurant.location && (restaurant.location.lat || restaurant.location.latitude))
                    },${
                      getFieldValue(restaurant, ['longitude', 'lng']) || 
                      (restaurant.location && (restaurant.location.lng || restaurant.location.longitude))
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    {t('restaurants.openInMaps') || 'Open in Google Maps'}
                  </a>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
      
      {!showCreateForm && (
        <>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('menus.availableMenus') || 'Available Menus'}
          </h3>
          
          {menus && menus.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menus.map((menu) => (
                <div 
                  key={menu.id} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden transition hover:shadow-md"
                >
                  <div className="p-5">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {menu.name || menu.category}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {menu.description || t('admin.noDescription') || 'No description available'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{t('admin.categories') || 'Categories'}:</span> {menu.categoryCount || '0'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{t('admin.products') || 'Products'}:</span> {menu.productCount || '0'}
                      </div>
                      {menu.lastUpdated && (
                        <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">{t('admin.lastUpdated') || 'Last updated'}:</span> {formatDate(menu.lastUpdated)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => handleViewMenu(menu.id)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <HiEye className="w-4 h-4 mr-1" />
                        {t('common.view') || 'View'}
                      </button>
                      
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleEditMenu(menu.id)}
                          className="inline-flex items-center text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                        >
                          <HiPencil className="w-4 h-4 mr-1" />
                          {t('common.edit') || 'Edit'}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteMenu(menu.id)}
                          className="inline-flex items-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <HiTrash className="w-4 h-4 mr-1" />
                          {t('common.delete') || 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 p-5 rounded-lg">
              <p className="flex items-center">
                <HiExclamationCircle className="w-5 h-5 mr-2" />
                {t('admin.noMenusFound') || 'No menus found for this restaurant'}
              </p>
              <p className="mt-2">
                {t('admin.clickCreateNew') || 'Click the "Create New Menu" button to add a menu.'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RestaurantMenus; 