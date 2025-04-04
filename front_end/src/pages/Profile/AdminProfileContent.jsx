import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiCurrencyDollar, HiShoppingCart, HiCollection, HiUserGroup, HiClock, HiExclamationCircle, HiRefresh, HiChevronLeft, HiChevronRight, HiMenu, HiEye, HiPlus, HiX, HiTrash, HiQrcode } from 'react-icons/hi';
import { orderApi } from '../../api/orderApi';
import { useNavigate } from 'react-router-dom';
import { createRestaurantApi, deleteRestaurantApi, fetchMenusByRestaurantIdApi } from '../../api/adminDashboard';

const AdminProfileContent = ({ adminStats, loading, error, onRetry }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Pagination states
  const [restaurantPage, setRestaurantPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const itemsPerPage = 5;
  
  // Order detail states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  // Menu states
  const [menus, setMenus] = useState({}); // Map of restaurantId -> menus array
  const [loadingMenus, setLoadingMenus] = useState({});
  const [menusError, setMenusError] = useState({});

  // Create Restaurant Modal State
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [restaurantData, setRestaurantData] = useState({
    restorantName: '',
    phoneNumber: '',
    address: '',
    email: '',
  });
  const [creatingRestaurant, setCreatingRestaurant] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Delete Restaurant Confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [deletingRestaurant, setDeletingRestaurant] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Navigation to menu
  const handleViewMenu = (menuId) => {
    if (menuId) {
      navigate(`/menu/${menuId}`);
    }
  };
  
  // Function to handle clicking on a restaurant row
  const handleRestaurantClick = (restaurant) => {
    const restaurantId = restaurant.id || restaurant.restorantId;
    if (!restaurantId) {
      console.error('Restaurant ID is missing');
      return;
    }
    
    // Navigate to the restaurant's menus page
    navigate(`/admin/restaurants/${restaurantId}/menus`);
  };
  
  // Function to handle clicking on an order row
  const handleOrderClick = async (order) => {
    setSelectedOrder(order);
    setLoadingDetails(true);
    setDetailsError(null);
    
    try {
      // Fetch order details
      const details = await orderApi.getOrderById(order.id);
      setOrderDetails(details);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setDetailsError(t('errors.failedToLoadOrderDetails') || 'Failed to load order details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Function to close order details
  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  // Pagination functions
  const getPaginatedData = (data, page, perPage) => {
    if (!data || !Array.isArray(data)) return [];
    const startIndex = (page - 1) * perPage;
    return data.slice(startIndex, startIndex + perPage);
  };
  
  const getTotalPages = (data, perPage) => {
    if (!data || !Array.isArray(data)) return 0;
    return Math.ceil(data.length / perPage);
  };
  
  // Function to update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      
      // Update order details
      setOrderDetails(prev => ({
        ...prev,
        orderStatus: newStatus
      }));
      
      // Update in the main orders list
      if (adminStats.recentOrders) {
        const updatedOrders = adminStats.recentOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        
        // This is a hacky way to update the state since we can't modify adminStats directly
        // In a real app, you would probably want to trigger a refresh of the parent component
        adminStats.recentOrders = updatedOrders;
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setDetailsError(t('errors.failedToUpdateStatus') || 'Failed to update order status');
    }
  };
  
  // Pagination controls component
  const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 bg-white dark:bg-gray-800">
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('pagination.showing') || 'Showing'}{' '}
              <span className="font-medium">
                {((currentPage - 1) * itemsPerPage) + 1}
              </span>{' '}
              {t('pagination.to') || 'to'}{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalPages * itemsPerPage)}
              </span>{' '}
              {t('pagination.of') || 'of'}{' '}
              <span className="font-medium">{totalPages * itemsPerPage}</span>{' '}
              {t('pagination.results') || 'results'}
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-400 ring-1 ring-inset ring-gray-300 
                  dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0 
                  ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="sr-only">{t('pagination.previous') || 'Previous'}</span>
                <HiChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold 
                    ${currentPage === page 
                      ? 'z-10 bg-blue-600 dark:bg-blue-700 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                      : 'text-gray-900 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0'}`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-400 ring-1 ring-inset ring-gray-300 
                  dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0 
                  ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="sr-only">{t('pagination.next') || 'Next'}</span>
                <HiChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
        
        {/* Mobile pagination */}
        <div className="flex sm:hidden justify-between items-center w-full">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300
              ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800
              ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <HiChevronLeft className="h-5 w-5 mr-1" />
            {t('pagination.previous') || 'Previous'}
          </button>
          
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300
              ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800
              ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {t('pagination.next') || 'Next'}
            <HiChevronRight className="h-5 w-5 ml-1" />
          </button>
        </div>
      </div>
    );
  };
  
  // Handle restaurant form input change
  const handleRestaurantInputChange = (e) => {
    const { name, value } = e.target;
    setRestaurantData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle create restaurant form submission
  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    setCreatingRestaurant(true);
    setCreateError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Validate form
      if (!restaurantData.restorantName.trim()) {
        throw new Error('Restaurant name is required');
      }

      const newRestaurant = await createRestaurantApi(token, restaurantData);
      
      // Close modal and reset form
      setShowRestaurantModal(false);
      setRestaurantData({
        restorantName: '',
        phoneNumber: '',
        address: '',
        email: '',
      });

      // If onRetry is available, call it to refresh the data
      if (onRetry) {
        onRetry();
      }

      // Show success message
      alert(t('admin.restaurantCreated') || 'Restaurant created successfully!');
    } catch (err) {
      console.error('Error creating restaurant:', err);
      setCreateError(err.message || 'Failed to create restaurant. Please try again.');
    } finally {
      setCreatingRestaurant(false);
    }
  };

  // Restaurant Creation Modal
  const RestaurantModal = () => {
    if (!showRestaurantModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {t('admin.createRestaurant') || 'Create New Restaurant'}
              </h3>
              <button 
                onClick={() => setShowRestaurantModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            
            {createError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
                {createError}
              </div>
            )}
            
            <form onSubmit={handleCreateRestaurant}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('restaurants.name') || 'Restaurant Name'} *
                  </label>
                  <input
                    type="text"
                    name="restorantName"
                    value={restaurantData.restorantName}
                    onChange={handleRestaurantInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t('restaurants.namePlaceholder') || 'Enter restaurant name'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('restaurants.phone') || 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={restaurantData.phoneNumber}
                    onChange={handleRestaurantInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t('restaurants.phonePlaceholder') || 'Enter phone number'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('restaurants.address') || 'Address'}
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={restaurantData.address}
                    onChange={handleRestaurantInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t('restaurants.addressPlaceholder') || 'Enter address'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('restaurants.email') || 'Email'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={restaurantData.email}
                    onChange={handleRestaurantInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t('restaurants.emailPlaceholder') || 'Enter email'}
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowRestaurantModal(false)}
                  className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={creatingRestaurant}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingRestaurant 
                    ? (t('common.creating') || 'Creating...') 
                    : (t('common.create') || 'Create')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Delete Restaurant Confirmation Modal
  const DeleteConfirmationModal = () => {
    if (!showDeleteConfirmation || !restaurantToDelete) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {t('admin.confirmDeleteRestaurant') || 'Delete Restaurant'}
              </h3>
              <button 
                onClick={() => setShowDeleteConfirmation(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
                {deleteError}
              </div>
            )}
            
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300">
                {t('admin.deleteRestaurantWarning') || 'Are you sure you want to delete this restaurant? This action cannot be undone and will remove all menus, categories, and products associated with it.'}
              </p>
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                  {restaurantToDelete.name || restaurantToDelete.restorantName}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={deletingRestaurant}
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmDeleteRestaurant}
                disabled={deletingRestaurant}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingRestaurant 
                  ? (t('common.deleting') || 'Deleting...') 
                  : (t('common.delete') || 'Delete')
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Handle QR code generation for a menu
  const handleFetchQRCode = async (menuId) => {
    if (!menuId) {
      console.error("Invalid menu ID:", menuId);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menus/${menuId}/qrcode`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch QR code (Status: ${response.status})`);
        throw new Error(`Failed to fetch QR code. Server responded with status ${response.status}`);
      }
      
      // Return binary blob (image)
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      // Open in new tab/window
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error fetching QR code:", error);
      alert("Failed to fetch QR code. Please try again.");
    }
  };

  // Handle opening the restaurant menus management page
  const handleManageMenus = (restaurant) => {
    navigate(`/restaurants/${restaurant.id}/menus`);
  };

  // Function to fetch menus for a restaurant
  const handleFetchMenus = async (restaurantId) => {
    if (!restaurantId) {
      console.error('Restaurant ID is missing');
      return;
    }
    
    setLoadingMenus(prev => ({ ...prev, [restaurantId]: true }));
    setMenusError(prev => ({ ...prev, [restaurantId]: null }));
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const fetchedMenus = await fetchMenusByRestaurantIdApi(token, restaurantId);
      setMenus(prev => ({ ...prev, [restaurantId]: fetchedMenus }));
    } catch (error) {
      console.error('Error fetching menus:', error);
      setMenusError(prev => ({ 
        ...prev, 
        [restaurantId]: t('errors.failedToLoadMenus') || 'Failed to load restaurant menus'
      }));
    } finally {
      setLoadingMenus(prev => ({ ...prev, [restaurantId]: false }));
    }
  };

  // Function to show delete confirmation modal
  const handleDeleteRestaurant = (restaurant, e) => {
    e.stopPropagation(); // Prevent triggering row click if any
    setRestaurantToDelete(restaurant);
    setShowDeleteConfirmation(true);
    setDeleteError(null);
  };

  // Function to confirm and process restaurant deletion
  const confirmDeleteRestaurant = async () => {
    if (!restaurantToDelete || !restaurantToDelete.id) {
      setDeleteError('Restaurant ID is missing');
      return;
    }

    setDeletingRestaurant(true);
    setDeleteError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      await deleteRestaurantApi(token, restaurantToDelete.id);
      
      // Close modal
      setShowDeleteConfirmation(false);
      setRestaurantToDelete(null);
      
      // If onRetry is available, call it to refresh the data
      if (onRetry) {
        onRetry();
      }
      
      // Show success message
      alert(t('admin.restaurantDeleted') || 'Restaurant deleted successfully!');
    } catch (err) {
      console.error('Error deleting restaurant:', err);
      setDeleteError(err.message || 'Failed to delete restaurant. Please try again.');
    } finally {
      setDeletingRestaurant(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-5 rounded-lg flex flex-col items-start">
        <div className="flex items-start mb-4">
          <HiExclamationCircle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg mb-1">{t('errors.loadFailed') || 'Failed to load data'}</h3>
            <p>{error}</p>
            <p className="mt-3 text-sm">{t('errors.tryAgainLater') || 'Please try again later or contact support if the problem persists.'}</p>
          </div>
        </div>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center self-center mt-4 bg-red-100 hover:bg-red-200 dark:bg-red-800/30 dark:hover:bg-red-700/30 text-red-800 dark:text-red-300 font-medium py-2 px-4 rounded-lg transition"
          >
            <HiRefresh className="w-5 h-5 mr-2" />
            {t('common.retry') || 'Retry'}
          </button>
        )}
      </div>
    );
  }
  
  if (!adminStats) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-5 rounded-lg flex flex-col items-center">
        <div className="flex items-center mb-4">
          <HiExclamationCircle className="w-6 h-6 mr-3 flex-shrink-0" />
          <p>{t('admin.noDataAvailable') || 'No statistics available yet. Start adding restaurants and products to see your dashboard.'}</p>
        </div>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center mt-4 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800/30 dark:hover:bg-blue-700/30 text-blue-800 dark:text-blue-300 font-medium py-2 px-4 rounded-lg transition"
          >
            <HiRefresh className="w-5 h-5 mr-2" />
            {t('common.refresh') || 'Refresh'}
          </button>
        )}
      </div>
    );
  }
  
  // Function to format currency values
  const formatCurrency = (value) => {
    if (value == null) return '0.00 лв.';
    return new Intl.NumberFormat('bg-BG', { 
      style: 'currency', 
      currency: 'BGN',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Format date for display
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

  // Get the appropriate status class for coloring
  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'READY':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'DELIVERED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };
  
  // Format orders and order values as needed from real data
  const getTotalOrders = () => {
    if (adminStats.orderStatusCounts) {
      return Object.values(adminStats.orderStatusCounts).reduce((a, b) => a + b, 0);
    }
    return adminStats.totalOrders || 0;
  };
  
  const getTotalRevenue = () => {
    return adminStats.totalRevenue || 0;
  };
  
  const getRestaurantCount = () => {
    return adminStats.restaurantStats ? adminStats.restaurantStats.length : 0;
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        {t('admin.dashboard') || 'Admin Dashboard'}
      </h2>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 rounded-xl shadow p-6 transition hover:shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-green-500 dark:bg-green-600 p-3 rounded-lg">
              <HiCurrencyDollar className="h-6 w-6 text-white" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
              {t('admin.totalRevenue') || 'Total Revenue'}
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">
            {formatCurrency(getTotalRevenue())}
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {t('admin.allTimeRevenue') || 'All-time revenue across all restaurants'}
          </p>
        </div>
        
        {/* Total Orders Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 rounded-xl shadow p-6 transition hover:shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 dark:bg-blue-600 p-3 rounded-lg">
              <HiShoppingCart className="h-6 w-6 text-white" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
              {t('admin.totalOrders') || 'Total Orders'}
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">
            {getTotalOrders()}
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {t('admin.ordersProcessed') || 'Orders processed across all restaurants'}
          </p>
        </div>
        
        {/* Restaurants Card */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-800/30 rounded-xl shadow p-6 transition hover:shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-purple-500 dark:bg-purple-600 p-3 rounded-lg">
              <HiCollection className="h-6 w-6 text-white" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
              {t('admin.restaurants') || 'Restaurants'}
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">
            {getRestaurantCount()}
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {t('admin.activeRestaurants') || 'Active restaurants in your portfolio'}
          </p>
        </div>
      </div>
      
      {/* Restaurant Performance */}
      {adminStats.restaurantStats && adminStats.restaurantStats.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              {t('admin.restaurantPerformance') || 'Restaurant Performance'}
            </h3>
            <button
              onClick={() => setShowRestaurantModal(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              <HiPlus className="mr-1 h-4 w-4" />
              {t('admin.addRestaurant') || 'Add Restaurant'}
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.restaurantName') || 'Restaurant'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.totalOrders') || 'Orders'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.revenue') || 'Revenue'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.avgOrder') || 'Avg. Order'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.actions') || 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {getPaginatedData(adminStats.restaurantStats, restaurantPage, itemsPerPage).map((restaurant, index) => (
                    <tr 
                      key={restaurant.id || index} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{restaurant.name || restaurant.restorantName}</div>
                        {restaurant.id && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {restaurant.id}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{restaurant.totalOrders || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(restaurant.totalRevenue || 0)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(restaurant.averageOrderValue || 0)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            onClick={() => handleRestaurantClick(restaurant)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                          >
                            <HiMenu className="mr-1 h-4 w-4" />
                            {t('admin.viewMenus') || 'View Menus'}
                          </button>
                          <button
                            onClick={(e) => handleDeleteRestaurant(restaurant, e)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                          >
                            <HiTrash className="mr-1 h-4 w-4" />
                            {t('common.delete') || 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <PaginationControls 
              currentPage={restaurantPage} 
              totalPages={getTotalPages(adminStats.restaurantStats, itemsPerPage)} 
              onPageChange={setRestaurantPage}
            />
          </div>
        </div>
      )}
      
      {/* Order Status Distribution */}
      {adminStats.orderStatusCounts && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('admin.orderStatusDistribution') || 'Order Status Distribution'}
          </h3>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {Object.entries(adminStats.orderStatusCounts).map(([status, count]) => (
                <div key={status} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{status}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Most Popular Products */}
      {adminStats.popularProducts && adminStats.popularProducts.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('admin.popularProducts') || 'Most Popular Products'}
          </h3>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.product') || 'Product'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.restaurant') || 'Restaurant'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.orderCount') || 'Orders'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.revenue') || 'Revenue'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {getPaginatedData(adminStats.popularProducts, productsPage, itemsPerPage).map((product, index) => (
                    <tr key={product.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{product.restaurantName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{product.orderCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(product.revenue)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <PaginationControls 
              currentPage={productsPage} 
              totalPages={getTotalPages(adminStats.popularProducts, itemsPerPage)} 
              onPageChange={setProductsPage}
            />
          </div>
        </div>
      )}
      
      {/* Recent Orders */}
      {adminStats.recentOrders && adminStats.recentOrders.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('admin.recentOrders') || 'Recent Orders'}
          </h3>
          
          {selectedOrder && orderDetails ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">
              <div className="p-4 md:p-6 dark:bg-gray-900">
                <div className="flex justify-between items-center mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {t('orders.orderDetails') || 'Order Details'} #{selectedOrder.id}
                  </h3>
                  <button 
                    onClick={handleCloseDetails}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                  >
                    <HiX className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
                
                {loadingDetails ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : detailsError ? (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg">
                    <p>{detailsError}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">{t('orders.orderInfo') || 'Order Information'}</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{t('orders.date') || 'Date'}:</span> {formatDate(orderDetails.orderTime || orderDetails.orderDate)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{t('orders.status') || 'Status'}:</span> 
                            <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(orderDetails.orderStatus || orderDetails.status)}`}>
                              {orderDetails.orderStatus || orderDetails.status || '-'}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{t('orders.total') || 'Total'}:</span> {formatCurrency(orderDetails.totalPrice || orderDetails.totalAmount || 0)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{t('orders.restaurant') || 'Restaurant'}:</span> {orderDetails.restaurantName || '-'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{t('orders.customer') || 'Customer'}:</span> {orderDetails.customerName || '-'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Update Status */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">{t('orders.updateStatus') || 'Update Status'}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'].map(status => (
                            <button
                              key={status}
                              onClick={() => handleUpdateOrderStatus(selectedOrder.id, status)}
                              disabled={(orderDetails.orderStatus || orderDetails.status) === status}
                              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors 
                                ${(orderDetails.orderStatus || orderDetails.status) === status 
                                  ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                                  : `${getStatusClass(status)} hover:opacity-80`
                                }`}
                            >
                              {t(`orders.status${status}`) || status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                      <h4 className="font-medium text-gray-800 dark:text-white mb-3">{t('orders.items') || 'Order Items'}</h4>
                      {orderDetails.products && orderDetails.products.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  {t('orders.product') || 'Product'}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  {t('orders.quantity') || 'Quantity'}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  {t('orders.price') || 'Price'}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  {t('orders.subtotal') || 'Subtotal'}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-gray-50 dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {orderDetails.products.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                    {item.productName || `Product #${item.productId}`}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                    {item.quantity}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                    {formatCurrency(item.productPriceAtOrder || 0)}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                    {formatCurrency((item.productPriceAtOrder || 0) * (item.quantity || 0))}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          {t('orders.noItems') || 'No items available'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.orderId') || 'Order ID'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.customer') || 'Customer'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.restaurant') || 'Restaurant'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.amount') || 'Amount'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.status') || 'Status'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.date') || 'Date'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.actions') || 'Actions'}
                    </th>
                  </tr>
                </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {getPaginatedData(adminStats.recentOrders, ordersPage, itemsPerPage).map((order, index) => (
                      <tr 
                        key={order.id || index} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the row click
                          handleOrderClick(order);
                        }}
                      >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">#{order.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{order.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{order.restaurantName}</div>
                        {order.restorantId && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {order.restorantId}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(order.totalAmount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(order.orderDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the row click
                            handleOrderClick(order);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                        >
                          <HiEye className="mr-1 h-4 w-4" />
                          {t('admin.viewDetails') || 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              
              {/* Pagination */}
              <PaginationControls 
                currentPage={ordersPage} 
                totalPages={getTotalPages(adminStats.recentOrders, itemsPerPage)}
                onPageChange={setOrdersPage} 
              />
          </div>
          )}
        </div>
      )}
      
      {/* Time-based Statistics */}
      {adminStats.timeStats && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('admin.timePeriodStats') || 'Time Period Statistics'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Today */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/30 dark:to-amber-800/30 rounded-xl shadow p-6 transition hover:shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-orange-500 dark:bg-orange-600 p-3 rounded-lg">
                  <HiClock className="h-6 w-6 text-white" />
                </div>
                <h4 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
                  {t('admin.today') || 'Today'}
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.orders') || 'Orders'}</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{adminStats.timeStats.today?.orders || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.revenue') || 'Revenue'}</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(adminStats.timeStats.today?.revenue || 0)}</p>
                </div>
              </div>
            </div>
            
            {/* This Week */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-800/30 rounded-xl shadow p-6 transition hover:shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-teal-500 dark:bg-teal-600 p-3 rounded-lg">
                  <HiClock className="h-6 w-6 text-white" />
                </div>
                <h4 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
                  {t('admin.thisWeek') || 'This Week'}
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.orders') || 'Orders'}</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{adminStats.timeStats.thisWeek?.orders || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.revenue') || 'Revenue'}</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(adminStats.timeStats.thisWeek?.revenue || 0)}</p>
                </div>
              </div>
            </div>
            
            {/* This Month */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 rounded-xl shadow p-6 transition hover:shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 dark:bg-blue-600 p-3 rounded-lg">
                  <HiClock className="h-6 w-6 text-white" />
                </div>
                <h4 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
                  {t('admin.thisMonth') || 'This Month'}
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.orders') || 'Orders'}</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{adminStats.timeStats.thisMonth?.orders || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.revenue') || 'Revenue'}</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(adminStats.timeStats.thisMonth?.revenue || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Render the restaurant modal */}
      <RestaurantModal />

      {/* Delete Restaurant Confirmation Modal */}
      <DeleteConfirmationModal />
    </div>
  );
};

export default AdminProfileContent; 