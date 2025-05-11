import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiX, HiClock, HiCheck } from 'react-icons/hi';
import { orderApi } from '../../api/orderApi';

/**
 * OrderDetailsModal component for showing order details and allowing status updates
 * @param {Object} props Component props
 * @param {Object} props.order The order object to display
 * @param {Function} props.onClose Function to close the modal
 * @param {Function} props.onOrderUpdated Function to call when order status is updated
 */
const OrderDetailsModal = ({ order, onClose, onOrderUpdated }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle updating the order status
  const handleUpdateStatus = async (newStatus) => {
    setLoading(true);
    setError(null);
    
    try {
      await orderApi.updateOrderStatus(order.id, newStatus);
      
      if (onOrderUpdated) {
        onOrderUpdated(order.id, newStatus);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      
      // More descriptive error messages based on error type
      if (err.message?.includes('Authentication required') || 
          err.message?.includes('401') || 
          err.message?.includes('403')) {
        setError(t('errors.sessionExpired') || 'Your session has expired. Please refresh.');
      } else if (err.message?.includes('Network Error')) {
        setError(t('errors.networkError') || 'Network error. Please check your connection.');
      } else {
        setError(t('errors.failedToUpdateOrderStatus') || 'Failed to update order status. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle retry
  const handleRetry = (newStatus) => {
    // Get a fresh token
    const token = localStorage.getItem('token');
    if (!token) {
      // If no token is found, close modal and let parent handle refresh
      onClose();
      return;
    }
    
    // Try the update again
    handleUpdateStatus(newStatus);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '—';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Stop propagation to prevent closing when clicking inside modal
  const handleModalClick = (e) => {
    e.stopPropagation();
  };
  
  if (!order) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('orders.orderDetails') || 'Order Details'} #{order.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 transition"
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 m-4 md:m-6 rounded-lg">
            <p className="mb-2">{error}</p>
            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleRetry((order.orderStatus || order.status) === 'PENDING' ? 'ACCEPTED' : (order.orderStatus || order.status) === 'ACCEPTED' ? 'READY' : 'CANCELLED')}
                className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-300 rounded"
              >
                {t('common.retry') || 'Retry'}
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-6">
          {/* Order Information */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('orders.orderInfo') || 'Order Information'}
            </h3>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('orders.id') || 'ID'}:</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{order.id}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('orders.date') || 'Date'}:</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(order.orderDate || order.created || order.orderTime)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('orders.status') || 'Status'}:</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.orderStatus || order.status || '—'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('orders.customer') || 'Customer'}:</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.customerName || '—'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('orders.total') || 'Total'}:</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(order.totalAmount || order.totalPrice)}
                </div>
              </div>
            </div>
            
            {/* Status update buttons */}
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('orders.updateStatus') || 'Update Status'}
              </h4>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleUpdateStatus('ACCEPTED')}
                  disabled={loading || (order.orderStatus || order.status) === 'ACCEPTED'}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded ${
                    (order.orderStatus || order.status) === 'ACCEPTED'
                      ? 'bg-blue-600 text-white cursor-not-allowed'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-600'
                  }`}
                >
                  <HiClock className="w-4 h-4 mr-1" />
                  {t('admin.acceptOrder') || 'Accept'}
                </button>
                
                <button
                  onClick={() => handleUpdateStatus('READY')}
                  disabled={loading || (order.orderStatus || order.status) === 'READY'}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded ${
                    (order.orderStatus || order.status) === 'READY'
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-700 dark:text-green-100 dark:hover:bg-green-600'
                  }`}
                >
                  <HiCheck className="w-4 h-4 mr-1" />
                  {t('admin.orderReady') || 'Ready'}
                </button>
                
                <button
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  disabled={loading || (order.orderStatus || order.status) === 'CANCELLED'}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded ${
                    (order.orderStatus || order.status) === 'CANCELLED'
                      ? 'bg-red-600 text-white cursor-not-allowed'
                      : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-700 dark:text-red-100 dark:hover:bg-red-600'
                  }`}
                >
                  <HiX className="w-4 h-4 mr-1" />
                  {t('admin.cancelOrder') || 'Cancel'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('orders.items') || 'Order Items'}
            </h3>
            
            {/* Check both orderItems and products property names */}
            {(!order.orderItems && !order.products) || (order.orderItems && order.orderItems.length === 0) || (order.products && order.products.length === 0) ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                {t('orders.noItems') || 'No items in this order'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                  <thead className="bg-gray-100 dark:bg-gray-600">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        {t('orders.product') || 'Product'}
                      </th>
                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        {t('orders.quantity') || 'Qty'}
                      </th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        {t('orders.price') || 'Price'}
                      </th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        {t('orders.subtotal') || 'Subtotal'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                    {/* Map over the items, using either orderItems or products property */}
                    {(order.orderItems || order.products || []).map((item, index) => (
                      <tr key={item.id || index}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{item.productName || item.name}</div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <div className="text-sm text-gray-500 dark:text-gray-300">{item.quantity}</div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-300">{formatCurrency(item.price || item.unitPrice || item.productPriceAtOrder)}</div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency((item.price || item.unitPrice || item.productPriceAtOrder) * item.quantity)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-600">
                    <tr>
                      <td colSpan="3" className="px-3 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('orders.total') || 'Total'}:
                      </td>
                      <td className="px-3 py-2 text-right text-sm font-bold text-gray-900 dark:text-white">
                        {formatCurrency(order.totalAmount || order.totalPrice)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 md:p-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            {t('common.close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal; 