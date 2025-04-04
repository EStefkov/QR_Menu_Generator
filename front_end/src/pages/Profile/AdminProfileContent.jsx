import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiCurrencyDollar, HiShoppingCart, HiCollection, HiUserGroup, HiClock, HiExclamationCircle, HiRefresh, HiChevronLeft, HiChevronRight, HiEye, HiPlus, HiX, HiTrash, HiQrcode } from 'react-icons/hi';
import { orderApi } from '../../api/orderApi';
import { useNavigate } from 'react-router-dom';
import { createRestaurantApi, deleteRestaurantApi, fetchMenusByRestaurantIdApi, fetchAccountsApi, deleteAccountApi } from '../../api/adminDashboard';
import { AccountsTable } from '../../components/AccountsTable';

const AdminProfileContent = ({ adminStats, loading, error, onRetry }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Pagination states
  const [restaurantPage, setRestaurantPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const itemsPerPage = 5;
  
  // Search filter states
  const [restaurantSearchTerm, setRestaurantSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  
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
  const [creatingRestaurant, setCreatingRestaurant] = useState(false);
  const [createError, setCreateError] = useState(null);
  
  // Form refs
  const restorantNameRef = React.useRef();
  const phoneNumberRef = React.useRef();
  const addressRef = React.useRef();
  const emailRef = React.useRef();

  // Delete Restaurant Confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [deletingRestaurant, setDeletingRestaurant] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Accounts state
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState(null);

  // Add sorting state variables
  const [restaurantSortField, setRestaurantSortField] = useState('name');
  const [restaurantSortDirection, setRestaurantSortDirection] = useState('asc');

  // Add sorting state variables for products
  const [productSortField, setProductSortField] = useState('orderCount');
  const [productSortDirection, setProductSortDirection] = useState('desc');

  // Add sorting state variables for orders
  const [orderSortField, setOrderSortField] = useState('date');
  const [orderSortDirection, setOrderSortDirection] = useState('desc');

  // Load accounts on component mount
  useEffect(() => {
    if (adminStats) {
      loadAccounts();
    }
  }, [adminStats]); // Only load accounts when adminStats are available

  // Function to load accounts
  const loadAccounts = async () => {
    setLoadingAccounts(true);
    setAccountsError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Use paginated accounts API instead of fetchAllAccountsApi
      const accountsData = await fetchAccountsApi(token, 0, 100);
      setAccounts(accountsData.content || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccountsError(
        t('errors.failedToLoadAccounts') || 'Failed to load accounts'
      );
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async (accountId) => {
    if (!accountId) return;
    
    if (!window.confirm(t('admin.confirmDeleteAccount') || 'Are you sure you want to delete this account?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      await deleteAccountApi(token, accountId);
      
      // Update accounts list by removing the deleted account
      setAccounts(prevAccounts => prevAccounts.filter(account => account.id !== accountId));
      
      alert(t('admin.accountDeleted') || 'Account deleted successfully!');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(error.message || 'Failed to delete account. Please try again.');
    }
  };
  
  // Handle account edit
  const handleEditAccount = (updatedAccount) => {
    setAccounts(prevAccounts => 
      prevAccounts.map(account => 
        account.id === updatedAccount.id ? { ...account, ...updatedAccount } : account
      )
    );
  };

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
      
      // Ensure restaurant and customer information is available
      const enhancedDetails = {
        ...details,
        restaurantName: details.restaurantName || order.restaurantName || 'Unknown Restaurant',
        restaurantId: details.restaurantId || order.restorantId || order.restaurantId,
        customerName: details.customerName || order.customerName || 'Unknown Customer',
        customerId: details.customerId || order.customerId,
        status: details.status || order.status || 'ACCEPTED', // Use order status if details.status is missing
        totalAmount: details.totalAmount || order.totalAmount || 0, // Use order total if details.totalAmount is missing
      };
      
      setOrderDetails(enhancedDetails);
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
      
      // Update order details with the correct status property
      setOrderDetails(prev => ({
        ...prev,
        status: newStatus,
        statusDate: new Date().toISOString()
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

      // Get values from refs
      const restaurantData = {
        restorantName: restorantNameRef.current.value.trim(),
        phoneNumber: phoneNumberRef.current.value.trim(),
        address: addressRef.current.value.trim(),
        email: emailRef.current.value.trim()
      };

      // Validate form
      if (!restaurantData.restorantName) {
        throw new Error('Restaurant name is required');
      }

      const newRestaurant = await createRestaurantApi(token, restaurantData);
      
      // Close modal and reset form
      setShowRestaurantModal(false);

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
                    ref={restorantNameRef}
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
                    ref={phoneNumberRef}
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
                    ref={addressRef}
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
                    ref={emailRef}
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
  
  // Filter function for restaurants
  const getFilteredRestaurants = () => {
    if (!adminStats?.restaurantStats || !Array.isArray(adminStats.restaurantStats)) {
      return [];
    }
    
    // Filter by search term
    const filtered = adminStats.restaurantStats.filter(restaurant => {
      const searchTermLower = restaurantSearchTerm.toLowerCase();
      return (
        (restaurant.name?.toLowerCase() || '').includes(searchTermLower) ||
        (restaurant.restorantName?.toLowerCase() || '').includes(searchTermLower) ||
        (restaurant.id?.toString() || '').includes(searchTermLower)
      );
    });
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      // Determine which field to sort by
      switch(restaurantSortField) {
        case 'id':
          aValue = Number(a.id);
          bValue = Number(b.id);
          break;
        case 'name':
          aValue = (a.name || a.restorantName || '').toLowerCase();
          bValue = (b.name || b.restorantName || '').toLowerCase();
          break;
        case 'revenue':
          aValue = Number(a.totalRevenue || 0);
          bValue = Number(b.totalRevenue || 0);
          break;
        case 'orders':
          aValue = Number(a.totalOrders || a.orderCount || 0);
          bValue = Number(b.totalOrders || b.orderCount || 0);
          break;
        case 'avgOrder':
          aValue = Number(a.averageOrderValue || 0);
          bValue = Number(b.averageOrderValue || 0);
          break;
        default:
          aValue = a[restaurantSortField];
          bValue = b[restaurantSortField];
      }
      
      // Compare based on sort direction
      if (restaurantSortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Handle column header click for sorting restaurants
  const handleRestaurantSort = (field) => {
    if (restaurantSortField === field) {
      // Toggle direction if clicking the same field
      setRestaurantSortDirection(restaurantSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setRestaurantSortField(field);
      setRestaurantSortDirection('asc');
    }
    setRestaurantPage(1); // Reset to first page when sorting
  };

  // Render sort indicator for restaurant table
  const renderSortIndicator = (field, currentSortField, currentSortDirection) => {
    if (currentSortField !== field) {
      return (
        <span className="text-gray-400 ml-1">
          <svg className="h-4 w-4 inline-block" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
          </svg>
        </span>
      );
    }
    
    if (currentSortDirection === 'asc') {
      return (
        <span className="text-blue-500 ml-1">
          <svg className="h-4 w-4 inline-block" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M5 15l7-7 7 7"></path>
          </svg>
        </span>
      );
    } else {
      return (
        <span className="text-blue-500 ml-1">
          <svg className="h-4 w-4 inline-block" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 9l-7 7-7-7"></path>
          </svg>
        </span>
      );
    }
  };

  // Filter function for products
  const getFilteredProducts = () => {
    if (!adminStats?.popularProducts || !Array.isArray(adminStats.popularProducts)) {
      return [];
    }
    
    // Filter by search term
    const filtered = adminStats.popularProducts.filter(product => {
      const searchTermLower = productSearchTerm.toLowerCase();
      return (
        (product.name?.toLowerCase() || '').includes(searchTermLower) ||
        (product.restaurantName?.toLowerCase() || '').includes(searchTermLower)
      );
    });
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      // Determine which field to sort by
      switch(productSortField) {
        case 'id':
          aValue = Number(a.id);
          bValue = Number(b.id);
          break;
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'restaurant':
          aValue = (a.restaurantName || '').toLowerCase();
          bValue = (b.restaurantName || '').toLowerCase();
          break;
        case 'orderCount':
          aValue = Number(a.orderCount || 0);
          bValue = Number(b.orderCount || 0);
          break;
        default:
          aValue = a[productSortField];
          bValue = b[productSortField];
      }
      
      // Compare based on sort direction
      if (productSortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Handle column header click for sorting products
  const handleProductSort = (field) => {
    if (productSortField === field) {
      // Toggle direction if clicking the same field
      setProductSortDirection(productSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setProductSortField(field);
      setProductSortDirection('asc');
    }
    setProductsPage(1); // Reset to first page when sorting
  };

  // Filter function for orders
  const getFilteredOrders = () => {
    if (!adminStats?.recentOrders || !Array.isArray(adminStats.recentOrders)) {
      return [];
    }
    
    // Filter by search term
    const filtered = adminStats.recentOrders.filter(order => {
      const searchTermLower = orderSearchTerm.toLowerCase();
      return (
        (order.id?.toString() || '').includes(searchTermLower) ||
        (order.customerName?.toLowerCase() || '').includes(searchTermLower) ||
        (order.restaurantName?.toLowerCase() || '').includes(searchTermLower) ||
        (order.status?.toLowerCase() || '').includes(searchTermLower)
      );
    });
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      // Determine which field to sort by
      switch(orderSortField) {
        case 'id':
          aValue = Number(a.id);
          bValue = Number(b.id);
          break;
        case 'customer':
          aValue = (a.customerName || '').toLowerCase();
          bValue = (b.customerName || '').toLowerCase();
          break;
        case 'restaurant':
          aValue = (a.restaurantName || '').toLowerCase();
          bValue = (b.restaurantName || '').toLowerCase();
          break;
        case 'amount':
          aValue = Number(a.totalAmount || 0);
          bValue = Number(b.totalAmount || 0);
          break;
        case 'status':
          aValue = (a.status || '').toLowerCase();
          bValue = (b.status || '').toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.orderDate || 0).getTime();
          bValue = new Date(b.orderDate || 0).getTime();
          break;
        default:
          aValue = a[orderSortField];
          bValue = b[orderSortField];
      }
      
      // Compare based on sort direction
      if (orderSortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Handle column header click for sorting orders
  const handleOrderSort = (field) => {
    if (orderSortField === field) {
      // Toggle direction if clicking the same field
      setOrderSortDirection(orderSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setOrderSortField(field);
      setOrderSortDirection('asc');
    }
    setOrdersPage(1); // Reset to first page when sorting
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

  // Update the getStatusClass function to handle the new status types
  const getStatusClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100';
      case 'READY':
        return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Format orders and order values as needed from real data
  const getTotalOrders = () => {
    if (adminStats.orderStatusCounts) {
      return Object.values(adminStats.orderStatusCounts).reduce((a, b) => a + b, 0);
    }
    return adminStats.totalOrders || 0;
  };
  
  // Update the getTotalRevenue function to exclude cancelled orders
  const getTotalRevenue = () => {
    // If we have recentOrders data, calculate revenue excluding cancelled orders
    if (adminStats.recentOrders && Array.isArray(adminStats.recentOrders)) {
      const activeOrdersRevenue = adminStats.recentOrders
        .filter(order => order.status?.toUpperCase() !== 'CANCELLED')
        .reduce((total, order) => total + (Number(order.totalAmount) || 0), 0);
      
      return activeOrdersRevenue;
    }
    
    // Fallback to the pre-calculated total if recentOrders is not available
    return adminStats.totalRevenue || 0;
  };
  
  const getRestaurantCount = () => {
    return adminStats.restaurantStats ? adminStats.restaurantStats.length : 0;
  };
  
  // Add filter functions for time period statistics to exclude cancelled orders
  // Create filtered time statistics that exclude cancelled orders
  const getFilteredTimeStats = () => {
    // If we don't have recentOrders data, return the pre-calculated stats
    if (!adminStats.recentOrders || !Array.isArray(adminStats.recentOrders)) {
      return adminStats.timeStats || {};
    }

    // Helper to check if a date is today
    const isToday = (dateString) => {
      const today = new Date();
      const date = new Date(dateString);
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    };

    // Helper to check if a date is this week
    const isThisWeek = (dateString) => {
      const today = new Date();
      const date = new Date(dateString);
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as the first day of week
      firstDayOfWeek.setHours(0, 0, 0, 0);
      
      return date >= firstDayOfWeek;
    };

    // Helper to check if a date is this month
    const isThisMonth = (dateString) => {
      const today = new Date();
      const date = new Date(dateString);
      return date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    };

    // Filter out cancelled orders
    const activeOrders = adminStats.recentOrders.filter(order => 
      order.status?.toUpperCase() !== 'CANCELLED'
    );

    // Calculate today's stats
    const todayOrders = activeOrders.filter(order => isToday(order.orderDate));
    const todayRevenue = todayOrders.reduce((total, order) => total + (Number(order.totalAmount) || 0), 0);

    // Calculate this week's stats
    const thisWeekOrders = activeOrders.filter(order => isThisWeek(order.orderDate));
    const thisWeekRevenue = thisWeekOrders.reduce((total, order) => total + (Number(order.totalAmount) || 0), 0);

    // Calculate this month's stats
    const thisMonthOrders = activeOrders.filter(order => isThisMonth(order.orderDate));
    const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (Number(order.totalAmount) || 0), 0);

    return {
      today: {
        orders: todayOrders.length,
        revenue: todayRevenue
      },
      thisWeek: {
        orders: thisWeekOrders.length,
        revenue: thisWeekRevenue
      },
      thisMonth: {
        orders: thisMonthOrders.length,
        revenue: thisMonthRevenue
      }
    };
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
            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('admin.searchRestaurants') || 'Search restaurants...'}
                  value={restaurantSearchTerm}
                  onChange={(e) => {
                    setRestaurantSearchTerm(e.target.value);
                    setRestaurantPage(1); // Reset to first page when searching
                  }}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                
                {restaurantSearchTerm && (
                  <button
                    onClick={() => {
                      setRestaurantSearchTerm('');
                      setRestaurantPage(1);
                    }}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <HiX className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleRestaurantSort('name')}
                    >
                      <div className="flex items-center">
                      {t('admin.restaurantName') || 'Restaurant'}
                        {renderSortIndicator('name', restaurantSortField, restaurantSortDirection)}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleRestaurantSort('revenue')}
                    >
                      <div className="flex items-center">
                      {t('admin.revenue') || 'Revenue'}
                        {renderSortIndicator('revenue', restaurantSortField, restaurantSortDirection)}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleRestaurantSort('orders')}
                    >
                      <div className="flex items-center">
                        {t('admin.orderCount') || 'Orders'}
                        {renderSortIndicator('orders', restaurantSortField, restaurantSortDirection)}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleRestaurantSort('avgOrder')}
                    >
                      <div className="flex items-center">
                      {t('admin.avgOrder') || 'Avg. Order'}
                        {renderSortIndicator('avgOrder', restaurantSortField, restaurantSortDirection)}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.actions') || 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {getPaginatedData(getFilteredRestaurants(), restaurantPage, itemsPerPage).map((restaurant, index) => (
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
                        <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(restaurant.totalRevenue || 0)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{restaurant.totalOrders || restaurant.orderCount || 0}</div>
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
                            <HiEye className="mr-1 h-4 w-4" />
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
              totalPages={getTotalPages(getFilteredRestaurants(), itemsPerPage)} 
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
            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('admin.searchProducts') || 'Search products or restaurants...'}
                  value={productSearchTerm}
                  onChange={(e) => {
                    setProductSearchTerm(e.target.value);
                    setProductsPage(1); // Reset to first page when searching
                  }}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                
                {productSearchTerm && (
                  <button
                    onClick={() => {
                      setProductSearchTerm('');
                      setProductsPage(1);
                    }}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <HiX className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleProductSort('name')}
                    >
                      <div className="flex items-center">
                      {t('admin.product') || 'Product'}
                        {renderSortIndicator('name', productSortField, productSortDirection)}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleProductSort('restaurant')}
                    >
                      <div className="flex items-center">
                      {t('admin.restaurant') || 'Restaurant'}
                        {renderSortIndicator('restaurant', productSortField, productSortDirection)}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleProductSort('orderCount')}
                    >
                      <div className="flex items-center">
                      {t('admin.orderCount') || 'Orders'}
                        {renderSortIndicator('orderCount', productSortField, productSortDirection)}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.revenue') || 'Revenue'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {getPaginatedData(getFilteredProducts(), productsPage, itemsPerPage).map((product, index) => (
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
              totalPages={getTotalPages(getFilteredProducts(), itemsPerPage)} 
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
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                          {t('orders.orderInfo') || 'Order Information'}
                        </h4>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('orders.id') || 'ID'}</p>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">#{orderDetails.id}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('orders.date') || 'Date'}</p>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">{formatDate(orderDetails.orderDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('orders.status') || 'Status'}</p>
                          <p className="text-sm mt-1">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(orderDetails.status)}`}>
                              {orderDetails.status || 'ACCEPTED'}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('orders.statusDate') || 'Status Date'}</p>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">{formatDate(orderDetails.statusDate || orderDetails.lastUpdated)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('orders.total') || 'Total'}</p>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">
                            {formatCurrency(orderDetails.totalAmount || orderDetails.totalPrice || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('orders.customer') || 'Customer'}</p>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">{orderDetails.customerName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('orders.restaurant') || 'Restaurant'}</p>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">{orderDetails.restaurantName || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Update Status */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">{t('orders.updateStatus') || 'Update Status'}</h4>
                      <div className="flex items-center mt-4 space-x-3">
                        <button
                          onClick={() => handleUpdateOrderStatus(orderDetails.id, 'ACCEPTED')}
                          className={`px-3 py-1 text-xs font-medium rounded-md ${
                            (orderDetails.status || orderDetails.orderStatus || '').toUpperCase() === 'ACCEPTED'
                              ? 'bg-blue-600 text-white cursor-not-allowed opacity-70'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-600'
                          }`}
                          disabled={(orderDetails.status || orderDetails.orderStatus || '').toUpperCase() === 'ACCEPTED'}
                        >
                          {t('admin.acceptOrder') || 'Accept'}
                        </button>
                        
                        <button
                          onClick={() => handleUpdateOrderStatus(orderDetails.id, 'READY')}
                          className={`px-3 py-1 text-xs font-medium rounded-md ${
                            (orderDetails.status || orderDetails.orderStatus || '').toUpperCase() === 'READY'
                              ? 'bg-green-600 text-white cursor-not-allowed opacity-70'
                              : 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-600'
                          }`}
                          disabled={(orderDetails.status || orderDetails.orderStatus || '').toUpperCase() === 'READY'}
                        >
                          {t('admin.orderReady') || 'Ready'}
                        </button>
                        
                        <button
                          onClick={() => handleUpdateOrderStatus(orderDetails.id, 'CANCELLED')}
                          className={`px-3 py-1 text-xs font-medium rounded-md ${
                            (orderDetails.status || orderDetails.orderStatus || '').toUpperCase() === 'CANCELLED'
                              ? 'bg-red-600 text-white cursor-not-allowed opacity-70'
                              : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-600'
                          }`}
                          disabled={(orderDetails.status || orderDetails.orderStatus || '').toUpperCase() === 'CANCELLED'}
                        >
                          {t('admin.cancelOrder') || 'Cancel'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                          {t('orders.items') || 'Order Items'}
                        </h4>
                      </div>
                      <div className="p-4">
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
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
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
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">
              {/* Search Bar */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('admin.searchOrders') || 'Search orders by ID, customer, restaurant or status...'}
                    value={orderSearchTerm}
                    onChange={(e) => {
                      setOrderSearchTerm(e.target.value);
                      setOrdersPage(1); // Reset to first page when searching
                    }}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  
                  {orderSearchTerm && (
                    <button
                      onClick={() => {
                        setOrderSearchTerm('');
                        setOrdersPage(1);
                      }}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <HiX className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleOrderSort('id')}
                      >
                        <div className="flex items-center">
                      {t('admin.orderId') || 'Order ID'}
                          {renderSortIndicator('id', orderSortField, orderSortDirection)}
                        </div>
                    </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleOrderSort('customer')}
                      >
                        <div className="flex items-center">
                      {t('admin.customer') || 'Customer'}
                          {renderSortIndicator('customer', orderSortField, orderSortDirection)}
                        </div>
                    </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleOrderSort('restaurant')}
                      >
                        <div className="flex items-center">
                          {t('admin.restaurant') || 'Restaurant'}
                          {renderSortIndicator('restaurant', orderSortField, orderSortDirection)}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleOrderSort('amount')}
                      >
                        <div className="flex items-center">
                      {t('admin.amount') || 'Amount'}
                          {renderSortIndicator('amount', orderSortField, orderSortDirection)}
                        </div>
                    </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleOrderSort('status')}
                      >
                        <div className="flex items-center">
                      {t('admin.status') || 'Status'}
                          {renderSortIndicator('status', orderSortField, orderSortDirection)}
                        </div>
                    </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleOrderSort('date')}
                      >
                        <div className="flex items-center">
                      {t('admin.date') || 'Date'}
                          {renderSortIndicator('date', orderSortField, orderSortDirection)}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('admin.actions') || 'Actions'}
                    </th>
                  </tr>
                </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {getPaginatedData(getFilteredOrders(), ordersPage, itemsPerPage).map((order, index) => (
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
                totalPages={getTotalPages(getFilteredOrders(), itemsPerPage)}
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
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {getFilteredTimeStats().today?.orders || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.revenue') || 'Revenue'}</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {formatCurrency(getFilteredTimeStats().today?.revenue || 0)}
                  </p>
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
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {getFilteredTimeStats().thisWeek?.orders || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.revenue') || 'Revenue'}</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {formatCurrency(getFilteredTimeStats().thisWeek?.revenue || 0)}
                  </p>
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
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {getFilteredTimeStats().thisMonth?.orders || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.revenue') || 'Revenue'}</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {formatCurrency(getFilteredTimeStats().thisMonth?.revenue || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Accounts */}
      {/* User Accounts Management */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          {t('admin.accountsManagement') || 'Accounts Management'}
        </h3>
        
        {loadingAccounts ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : accountsError ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-5 rounded-lg flex flex-col items-start">
            <div className="flex items-start mb-4">
              <HiExclamationCircle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-1">{t('errors.loadFailed') || 'Failed to load accounts'}</h3>
                <p>{accountsError}</p>
                <p className="mt-2 text-sm">Access to this feature might be restricted to certain account types.</p>
              </div>
            </div>
            
            <button
              onClick={loadAccounts}
              className="flex items-center self-center mt-4 bg-red-100 hover:bg-red-200 dark:bg-red-800/30 dark:hover:bg-red-700/30 text-red-800 dark:text-red-300 font-medium py-2 px-4 rounded-lg transition"
            >
              <HiRefresh className="w-5 h-5 mr-2" />
              {t('common.retry') || 'Retry'}
            </button>
          </div>
        ) : !accounts || accounts.length === 0 ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-5 rounded-lg">
            <div className="flex items-center justify-center">
              <HiExclamationCircle className="w-6 h-6 mr-3 flex-shrink-0" />
              <p>{t('admin.noAccountsAvailable') || 'No accounts available or you may not have permission to view them.'}</p>
            </div>
          </div>
        ) : (
          <AccountsTable 
            accounts={accounts} 
            onEdit={handleEditAccount}
            onDelete={handleDeleteAccount}
            showTitle={false}
            showSearch={true}
          />
        )}
      </div>
      
      {/* Render the restaurant modal */}
      <RestaurantModal />

      {/* Delete Restaurant Confirmation Modal */}
      <DeleteConfirmationModal />
    </div>
  );
};

export default AdminProfileContent; 