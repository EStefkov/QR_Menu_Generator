import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import RestaurantOwnerDashboard from '../components/dashboard/RestaurantOwnerDashboard';
import { orderApi } from '../api/orderApi';
import { restaurantApi } from '../api/restaurantApi';
import { menuApi } from '../api/menuApi';
import { OrderDetailsModal } from '../components/profile/OrderDetailsModal';
import { RestaurantDetailsModal } from '../components/restaurants/RestaurantDetailsModal';
import { MenuItemDetailsModal } from '../components/menu/MenuItemDetailsModal';
import { AlertModal } from '../components/modals/DashboardModal';
import QRCodeModal from '../components/modals/QRCodeModal';

const RestaurantOwnerDashboardPage = () => {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    orderCount: 0,
    restaurantCount: 0,
    menuItemCount: 0
  });
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', title: '', type: 'info' });

  // Fetch data for the dashboard
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Get statistics for this owner
      const statsData = await orderApi.getOwnerStats();
      if (statsData) {
        setStats(statsData);
      }
      
      // Get owner's restaurants
      const restaurantsData = await restaurantApi.getOwnerRestaurants();
      if (restaurantsData) {
        setRestaurants(restaurantsData);
      }
      
      // Get recent orders for all owner's restaurants
      const recentOrdersData = await orderApi.getOwnerRecentOrders();
      if (recentOrdersData) {
        setRecentOrders(recentOrdersData);
      }
      
      // Get popular menu items from all owner's restaurants
      const popularItemsData = await menuApi.getPopularItems();
      if (popularItemsData) {
        setPopularItems(popularItemsData);
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

  // Handle restaurant viewing
  const handleViewRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsRestaurantModalOpen(true);
  };

  // Handle restaurant editing
  const handleEditRestaurant = (restaurant) => {
    // Navigate to restaurant edit page
    window.location.href = `/owner/restaurants/${restaurant.id}/edit`;
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

  // Handle menu item viewing
  const handleViewMenuItem = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setIsMenuItemModalOpen(true);
  };

  // Handle menu item editing
  const handleEditMenuItem = (menuItem) => {
    // Navigate to menu item edit page
    window.location.href = `/owner/restaurants/${menuItem.restaurantId}/menu/${menuItem.id}/edit`;
  };

  return (
    <DashboardLayout
      currentUserRole="RESTAURANT_OWNER"
      currentUserName={currentUser?.username || 'Restaurant Owner'}
      onLogout={logout}
    >
      <RestaurantOwnerDashboard
        restaurants={restaurants}
        recentOrders={recentOrders}
        popularItems={popularItems}
        stats={stats}
        onViewRestaurant={handleViewRestaurant}
        onEditRestaurant={handleEditRestaurant}
        onGenerateQR={handleGenerateQR}
        onViewOrder={handleViewOrder}
        onPrintReceipt={handlePrintReceipt}
        onViewMenuItem={handleViewMenuItem}
        onEditMenuItem={handleEditMenuItem}
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

      {/* Menu Item Details Modal */}
      {selectedMenuItem && (
        <MenuItemDetailsModal
          isOpen={isMenuItemModalOpen}
          onClose={() => setIsMenuItemModalOpen(false)}
          menuItem={selectedMenuItem}
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

export default RestaurantOwnerDashboardPage; 