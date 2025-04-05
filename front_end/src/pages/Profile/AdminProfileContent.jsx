import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import {
  createRestaurantApi,
  deleteRestaurantApi,
  fetchMenusByRestaurantIdApi,
  fetchAccountsApi,
  deleteAccountApi
} from '../../api/adminDashboard';

import { HiExclamationCircle, HiRefresh } from 'react-icons/hi';

import AdminStatsOverview from '../../components/admin/AdminStatsOverview';
import RestaurantPerformance from '../../components/admin/RestaurantPerformance';
import RestaurantModal from '../../components/admin/RestaurantModal';
import RestaurantDeleteConfirmation from '../../components/admin/RestaurantDeleteConfirmation';
import OrderStatusDistribution from '../../components/admin/OrderStatusDistribution';
import PopularProducts from '../../components/admin/PopularProducts';
import RecentOrders from '../../components/admin/RecentOrders';
import TimePeriodStats from '../../components/admin/TimePeriodStats';
import AccountsManagement from '../../components/admin/AccountsManagement';

const AdminProfileContent = ({ adminStats, loading, error, onRetry }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // General states
  const [restaurantPage, setRestaurantPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const itemsPerPage = 5;

  // Restaurant create modal
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [creatingRestaurant, setCreatingRestaurant] = useState(false);
  const [createError, setCreateError] = useState(null);
  const restorantNameRef = useRef();
  const phoneNumberRef = useRef();
  const addressRef = useRef();
  const emailRef = useRef();

  // Restaurant delete modal
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [deletingRestaurant, setDeletingRestaurant] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Accounts
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState(null);

  // Order details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  useEffect(() => {
    if (adminStats) loadAccounts();
  }, [adminStats]);

  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true);
      setAccountsError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required.');
      const data = await fetchAccountsApi(token, 0, 100);
      setAccounts(data.content || []);
    } catch (e) {
      setAccountsError(t('errors.failedToLoadAccounts') || 'Failed to load accounts.');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    setCreatingRestaurant(true);
    setCreateError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required.');
      const restaurantData = {
        restorantName: restorantNameRef.current.value.trim(),
        phoneNumber: phoneNumberRef.current.value.trim(),
        address: addressRef.current.value.trim(),
        email: emailRef.current.value.trim()
      };
      await createRestaurantApi(token, restaurantData);
      setShowRestaurantModal(false);
      if (onRetry) onRetry();
      alert(t('admin.restaurantCreated') || 'Restaurant created successfully!');
    } catch (err) {
      setCreateError(err.message || 'Failed to create restaurant.');
    } finally {
      setCreatingRestaurant(false);
    }
  };

  const handleDeleteRestaurant = (restaurant, e) => {
    e.stopPropagation();
    setRestaurantToDelete(restaurant);
    setShowDeleteConfirmation(true);
    setDeleteError(null);
  };

  const confirmDeleteRestaurant = async () => {
    if (!restaurantToDelete || !restaurantToDelete.id) {
      setDeleteError('Restaurant ID is missing.');
      return;
    }
    setDeletingRestaurant(true);
    setDeleteError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required.');
      await deleteRestaurantApi(token, restaurantToDelete.id);
      setShowDeleteConfirmation(false);
      setRestaurantToDelete(null);
      if (onRetry) onRetry();
      alert(t('admin.restaurantDeleted') || 'Restaurant deleted successfully!');
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete restaurant.');
    } finally {
      setDeletingRestaurant(false);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm(t('admin.confirmDeleteAccount') || 'Are you sure?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required.');
      await deleteAccountApi(token, id);
      setAccounts((prev) => prev.filter((x) => x.id !== id));
      alert(t('admin.accountDeleted') || 'Account deleted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to delete account.');
    }
  };

  const handleEditAccount = (updated) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updated.id ? { ...acc, ...updated } : acc))
    );
  };

  const handleOrderClick = async (order) => {
    setSelectedOrder(order);
    setLoadingDetails(true);
    setDetailsError(null);
    try {
      const details = await orderApi.getOrderById(order.id);
      setOrderDetails({
        ...details,
        restaurantName:
          details.restaurantName || order.restaurantName || 'Unknown Restaurant',
        restaurantId: details.restaurantId || order.restorantId,
        customerName: details.customerName || order.customerName || 'Unknown Customer',
        status: details.status || order.status || 'ACCEPTED',
        totalAmount: details.totalAmount || order.totalAmount || 0
      });
    } catch (err) {
      setDetailsError('Failed to load order details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      await orderApi.updateOrderStatus(id, newStatus);
      setOrderDetails((prev) => ({
        ...prev,
        status: newStatus,
        statusDate: new Date().toISOString()
      }));
      if (adminStats.recentOrders) {
        adminStats.recentOrders = adminStats.recentOrders.map((o) =>
          o.id === id ? { ...o, status: newStatus } : o
        );
      }
    } catch (err) {
      setDetailsError('Failed to update order status');
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
      <div className="bg-red-50 p-5 rounded-lg flex flex-col items-start">
        <div className="flex items-start mb-4">
          <HiExclamationCircle className="w-6 h-6 mr-3 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg mb-1">
              {t('errors.loadFailed') || 'Failed to load data'}
            </h3>
            <p>{error}</p>
            <p className="mt-3 text-sm">Please try again later.</p>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center self-center mt-4 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded-lg transition"
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
      <div className="bg-blue-50 p-5 rounded-lg flex flex-col items-center">
        <div className="flex items-center mb-4">
          <HiExclamationCircle className="w-6 h-6 mr-3" />
          <p>{t('admin.noDataAvailable') || 'No statistics available.'}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center mt-4 bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded-lg transition"
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
      <h2 className="text-2xl font-bold mb-6">{t('admin.dashboard') || 'Admin Dashboard'}</h2>
      <AdminStatsOverview adminStats={adminStats} />
      <RestaurantPerformance
        adminStats={adminStats}
        restaurantPage={restaurantPage}
        setRestaurantPage={setRestaurantPage}
        itemsPerPage={itemsPerPage}
        onDeleteRestaurant={handleDeleteRestaurant}
        onShowCreateModal={() => setShowRestaurantModal(true)}
      />
      {showRestaurantModal && (
        <RestaurantModal
          t={t}
          show={showRestaurantModal}
          onClose={() => setShowRestaurantModal(false)}
          onSubmit={handleCreateRestaurant}
          creatingRestaurant={creatingRestaurant}
          createError={createError}
          refs={{ restorantNameRef, phoneNumberRef, addressRef, emailRef }}
        />
      )}
      {showDeleteConfirmation && restaurantToDelete && (
        <RestaurantDeleteConfirmation
          t={t}
          restaurant={restaurantToDelete}
          deleting={deletingRestaurant}
          deleteError={deleteError}
          onConfirm={confirmDeleteRestaurant}
          onClose={() => setShowDeleteConfirmation(false)}
        />
      )}
      <OrderStatusDistribution adminStats={adminStats} />
      <PopularProducts
        adminStats={adminStats}
        productsPage={productsPage}
        setProductsPage={setProductsPage}
        itemsPerPage={itemsPerPage}
      />
      <RecentOrders
        adminStats={adminStats}
        ordersPage={ordersPage}
        setOrdersPage={setOrdersPage}
        itemsPerPage={itemsPerPage}
        selectedOrder={selectedOrder}
        orderDetails={orderDetails}
        loadingDetails={loadingDetails}
        detailsError={detailsError}
        onOrderClick={handleOrderClick}
        onCloseDetails={handleCloseDetails}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />
      <TimePeriodStats adminStats={adminStats} />
      <AccountsManagement
        t={t}
        accounts={accounts}
        loadingAccounts={loadingAccounts}
        accountsError={accountsError}
        loadAccounts={loadAccounts}
        onDeleteAccount={handleDeleteAccount}
        onEditAccount={handleEditAccount}
      />
    </div>
  );
};

export default AdminProfileContent;
