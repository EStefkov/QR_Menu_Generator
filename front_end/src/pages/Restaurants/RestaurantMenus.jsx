import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { restaurantApi } from '../../api/restaurantApi';
import { HiArrowLeft, HiExclamationCircle, HiEye, HiPencil, HiTrash, HiRefresh, HiPlusCircle, HiX } from 'react-icons/hi';

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
  
  const fetchRestaurantData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch restaurant details and menus in parallel
      const [restaurantData, menusData] = await Promise.all([
        restaurantApi.getRestaurantById(restaurantId),
        restaurantApi.getRestaurantMenus(restaurantId)
      ]);
      
      setRestaurant(restaurantData);
      setMenus(menusData);
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
            {restaurant?.name || t('restaurants.restaurantMenus') || 'Restaurant Menus'}
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {t('restaurants.details') || 'Restaurant Details'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('restaurants.name') || 'Name'}
              </p>
              <p className="text-base text-gray-900 dark:text-white font-medium">
                {restaurant.name || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('restaurants.address') || 'Address'}
              </p>
              <p className="text-base text-gray-900 dark:text-white">
                {restaurant.address || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('restaurants.phone') || 'Phone'}
              </p>
              <p className="text-base text-gray-900 dark:text-white">
                {restaurant.phone || '-'}
              </p>
            </div>
          </div>
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