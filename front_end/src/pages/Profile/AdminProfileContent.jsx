import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiCurrencyDollar, HiShoppingCart, HiCollection, HiExclamationCircle, HiRefresh, HiPlus } from 'react-icons/hi';
import { orderApi } from '../../api/orderApi';
import { useNavigate } from 'react-router-dom';
import { createRestaurantApi, deleteRestaurantApi, fetchMenusByRestaurantIdApi, fetchAccountsApi, deleteAccountApi } from '../../api/adminDashboard';
import { AccountsTable } from '../../components/AccountsTable';

// Import reusable components
import StatsCard from '../../components/stats/StatsCard';
import RestaurantTable from '../../components/admin/RestaurantTable';
import ProductsTable from '../../components/admin/ProductsTable';
import OrdersTable from '../../components/admin/OrdersTable';
import TimeStats from '../../components/admin/TimeStats';
import OrderStatusDistribution from '../../components/admin/OrderStatusDistribution';
import RestaurantModal from '../../components/admin/RestaurantModal';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';

const AdminProfileContent = ({ adminStats, loading, error, onRetry }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Order detail states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  // Create Restaurant Modal State
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [creatingRestaurant, setCreatingRestaurant] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Delete Restaurant Confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [deletingRestaurant, setDeletingRestaurant] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Accounts state
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState(null);

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
  
  // Handle create restaurant form submission
  const handleCreateRestaurant = async (restaurantData) => {
    setCreatingRestaurant(true);
    setCreateError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Validate form
      if (!restaurantData.restorantName) {
        throw new Error('Restaurant name is required');
      }

      await createRestaurantApi(token, restaurantData);
      
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

  // Function to show delete confirmation modal
  const handleDeleteRestaurant = (restaurant, e) => {
    e?.stopPropagation(); // Prevent triggering row click if any
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
  
  // Format orders and order values as needed from real data
  const getTotalOrders = () => {
    if (adminStats?.orderStatusCounts) {
      return Object.values(adminStats.orderStatusCounts).reduce((a, b) => a + b, 0);
    }
    return adminStats?.totalOrders || 0;
  };
  
  // Update the getTotalRevenue function to exclude cancelled orders
  const getTotalRevenue = () => {
    // If we have recentOrders data, calculate revenue excluding cancelled orders
    if (adminStats?.recentOrders && Array.isArray(adminStats.recentOrders)) {
      const activeOrdersRevenue = adminStats.recentOrders
        .filter(order => order.status?.toUpperCase() !== 'CANCELLED')
        .reduce((total, order) => total + (Number(order.totalAmount) || 0), 0);
      
      return activeOrdersRevenue;
    }
    
    // Fallback to the pre-calculated total if recentOrders is not available
    return adminStats?.totalRevenue || 0;
  };
  
  const getRestaurantCount = () => {
    return adminStats?.restaurantStats ? adminStats.restaurantStats.length : 0;
  };
  
  // Add filter functions for time period statistics to exclude cancelled orders
  // Create filtered time statistics that exclude cancelled orders
  const getFilteredTimeStats = () => {
    // If we don't have recentOrders data, return the pre-calculated stats
    if (!adminStats?.recentOrders || !Array.isArray(adminStats.recentOrders)) {
      return adminStats?.timeStats || {};
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

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        {t('admin.dashboard') || 'Admin Dashboard'}
      </h2>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <StatsCard
          icon={HiCurrencyDollar}
          title={t('admin.totalRevenue') || 'Total Revenue'}
          value={formatCurrency(getTotalRevenue())}
          description={t('admin.allTimeRevenue') || 'All-time revenue across all restaurants'}
          bgColorClass="from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30"
          iconBgClass="bg-green-500 dark:bg-green-600"
        />
        
        {/* Total Orders Card */}
        <StatsCard
          icon={HiShoppingCart}
          title={t('admin.totalOrders') || 'Total Orders'}
          value={getTotalOrders()}
          description={t('admin.ordersProcessed') || 'Orders processed across all restaurants'}
          bgColorClass="from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30"
          iconBgClass="bg-blue-500 dark:bg-blue-600"
        />
        
        {/* Restaurants Card */}
        <StatsCard
          icon={HiCollection}
          title={t('admin.restaurants') || 'Restaurants'}
          value={getRestaurantCount()}
          description={t('admin.activeRestaurants') || 'Active restaurants in your portfolio'}
          bgColorClass="from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-800/30"
          iconBgClass="bg-purple-500 dark:bg-purple-600"
        />
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
          
          <RestaurantTable 
            restaurants={adminStats.restaurantStats} 
            onViewMenus={handleRestaurantClick}
            onDeleteRestaurant={handleDeleteRestaurant}
            formatCurrency={formatCurrency}
          />
        </div>
      )}
      
      {/* Order Status Distribution */}
      {adminStats.orderStatusCounts && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('admin.orderStatusDistribution') || 'Order Status Distribution'}
          </h3>
          <OrderStatusDistribution statusCounts={adminStats.orderStatusCounts} />
        </div>
      )}
      
      {/* Most Popular Products */}
      {adminStats.popularProducts && adminStats.popularProducts.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('admin.popularProducts') || 'Most Popular Products'}
          </h3>
          <ProductsTable 
            products={adminStats.popularProducts} 
            formatCurrency={formatCurrency}
          />
        </div>
      )}
      
      {/* Recent Orders */}
      {adminStats.recentOrders && adminStats.recentOrders.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('admin.recentOrders') || 'Recent Orders'}
          </h3>
          
          {selectedOrder && orderDetails ? (
            <OrderDetailsModal
              order={orderDetails}
              onClose={handleCloseDetails}
              loading={loadingDetails}
              error={detailsError}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          ) : (
            <OrdersTable 
              orders={adminStats.recentOrders}
              onViewDetails={handleOrderClick}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          )}
        </div>
      )}
      
      {/* Time-based Statistics */}
      {adminStats.timeStats && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('admin.timePeriodStats') || 'Time Period Statistics'}
          </h3>
          <TimeStats 
            timeStats={getFilteredTimeStats()} 
            formatCurrency={formatCurrency} 
          />
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
      
      {/* Restaurant Modal */}
      <RestaurantModal
        showModal={showRestaurantModal}
        onClose={() => setShowRestaurantModal(false)}
        onSubmit={handleCreateRestaurant}
        isCreating={creatingRestaurant}
        error={createError}
      />

      {/* Delete Restaurant Confirmation Modal */}
      <DeleteConfirmationModal
        showModal={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDeleteRestaurant}
        isDeleting={deletingRestaurant}
        error={deleteError}
        itemToDelete={restaurantToDelete}
        itemType="restaurant"
      />
    </div>
  );
};

export default AdminProfileContent; 