import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import AdminDashboardContent from '../components/dashboard/AdminDashboard';
import { userApi } from '../api/userApi';
import { restaurantApi } from '../api/restaurantApi';
import { orderApi } from '../api/orderApi';
import { OrderDetailsModal } from '../components/profile/OrderDetailsModal';
import { RestaurantDetailsModal } from '../components/restaurants/RestaurantDetailsModal';
import { UserDetailsModal } from '../components/profile/UserDetailsModal';
import { AlertModal } from '../components/modals/DashboardModal';
import QRCodeModal from '../components/modals/QRCodeModal';

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    orderCount: 0,
    userCount: 0,
    restaurantCount: 0
  });
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', title: '', type: 'info' });

  // Fetch data for the dashboard
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Get statistics
      const statsData = await orderApi.getAdminStats();
      if (statsData) {
        setStats(statsData);
      }
      
      // Get recent users
      const usersData = await userApi.getRecentUsers();
      if (usersData) {
        setUsers(usersData);
      }
      
      // Get recent restaurants
      const restaurantsData = await restaurantApi.getRecentRestaurants();
      if (restaurantsData) {
        setRestaurants(restaurantsData);
      }
      
      // Get recent orders
      const recentOrdersData = await orderApi.getRecentOrders();
      if (recentOrdersData) {
        setRecentOrders(recentOrdersData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showAlert('Error loading dashboard data', 'Please try again later.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Show alert modal
  const showAlert = (title, message, type) => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  // Handle user viewing
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  // Handle user editing
  const handleEditUser = (user) => {
    // Navigate to user edit page
    window.location.href = `/admin/users/${user.id}/edit`;
  };

  // Handle user deletion
  const handleDeleteUser = async (user) => {
    try {
      const result = await userApi.deleteUser(user.id);
      if (result) {
        showAlert('User Deleted', 'User has been successfully deleted.', 'success');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showAlert('Error', 'Failed to delete user. Please try again.', 'error');
    }
  };

  // Handle user status toggle
  const handleToggleUserStatus = async (user) => {
    try {
      const newStatus = user.enabled ? false : true;
      const result = await userApi.updateUserStatus(user.id, newStatus);
      if (result) {
        showAlert('User Status Updated', `User has been ${newStatus ? 'activated' : 'deactivated'}.`, 'success');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      showAlert('Error', 'Failed to update user status. Please try again.', 'error');
    }
  };

  // Handle restaurant viewing
  const handleViewRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsRestaurantModalOpen(true);
  };

  // Handle restaurant editing
  const handleEditRestaurant = (restaurant) => {
    // Navigate to restaurant edit page
    window.location.href = `/admin/restaurants/${restaurant.id}/edit`;
  };

  // Handle restaurant deletion
  const handleDeleteRestaurant = async (restaurant) => {
    try {
      const result = await restaurantApi.deleteRestaurant(restaurant.id);
      if (result) {
        showAlert('Restaurant Deleted', 'Restaurant has been successfully deleted.', 'success');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      showAlert('Error', 'Failed to delete restaurant. Please try again.', 'error');
    }
  };

  // Handle QR code generation
  const handleGenerateQR = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsQRModalOpen(true);
  };

  // Handle order viewing
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  // Handle print receipt
  const handlePrintReceipt = (order) => {
    // Create a printable version of the receipt
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Order Receipt #${order.orderId}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .details { margin-bottom: 20px; }
              .items { width: 100%; border-collapse: collapse; }
              .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .total { margin-top: 20px; text-align: right; font-weight: bold; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; }
              @media print {
                body { margin: 0; padding: 10px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Order Receipt</h1>
              <p>Order #${order.orderId}</p>
              <p>Date: ${new Date(order.createdDate).toLocaleString()}</p>
            </div>
            <div class="details">
              <p><strong>Restaurant:</strong> ${order.restaurant?.name || 'N/A'}</p>
              <p><strong>Customer:</strong> ${order.user?.username || order.customerName || 'Anonymous'}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>
            <table class="items">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${(order.orderItems || []).map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price?.toFixed(2) || '0.00'} BGN</td>
                    <td>${(item.price * item.quantity)?.toFixed(2) || '0.00'} BGN</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">
              <p>Total: ${order.totalPrice?.toFixed(2) || '0.00'} BGN</p>
            </div>
            <div class="footer">
              <p>Thank you for your order!</p>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <DashboardLayout
      currentUserRole="ADMIN"
      currentUserName={currentUser?.username || 'Administrator'}
      onLogout={logout}
    >
      <AdminDashboardContent
        users={users}
        restaurants={restaurants}
        recentOrders={recentOrders}
        stats={stats}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        onToggleUserStatus={handleToggleUserStatus}
        onViewRestaurant={handleViewRestaurant}
        onEditRestaurant={handleEditRestaurant}
        onDeleteRestaurant={handleDeleteRestaurant}
        onGenerateQR={handleGenerateQR}
        onViewOrder={handleViewOrder}
        onPrintReceipt={handlePrintReceipt}
        onRefreshData={fetchDashboardData}
        isLoading={isLoading}
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          order={selectedOrder}
        />
      )}

      {/* Restaurant Details Modal */}
      {selectedRestaurant && (
        <RestaurantDetailsModal
          isOpen={isRestaurantModalOpen}
          onClose={() => setIsRestaurantModalOpen(false)}
          restaurant={selectedRestaurant}
        />
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          user={selectedUser}
        />
      )}

      {/* QR Code Modal */}
      {selectedRestaurant && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          restaurant={selectedRestaurant}
        />
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </DashboardLayout>
  );
};

export default AdminDashboardPage; 