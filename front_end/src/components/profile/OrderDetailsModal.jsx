import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiX, HiOutlineCheckCircle, HiOutlineClock, HiOutlineX } from 'react-icons/hi';

const OrderDetailsModal = ({ order, onClose, isOpen }) => {
  const { t } = useLanguage();
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    // Reset loading state when modal opens or order changes
    if (isOpen && order) {
      setIsLoadingItems(false);
      console.log("Order in modal:", order);
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "—";
      }
      
      // Use the current language for date formatting
      const locale = localStorage.getItem('language') === 'bg' ? 'bg-BG' : 'en-US';
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return "—";
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "—";
    
    try {
      const locale = localStorage.getItem('language') === 'bg' ? 'bg-BG' : 'en-US';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD', // You may need to adjust this or make it dynamic
        minimumFractionDigits: 2
      }).format(amount);
    } catch (e) {
      console.error('Error formatting currency:', e);
      return amount.toFixed(2);
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return null;
    
    switch(status.toString().toUpperCase()) {
      case 'COMPLETED':
      case 'FINISHED':
      case 'DELIVERED':
        return <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />;
      case 'PENDING':
      case 'PREPARING':
      case 'READY':
      case 'ACCEPTED':
        return <HiOutlineClock className="w-5 h-5 text-yellow-500" />;
      case 'CANCELLED':
        return <HiOutlineX className="w-5 h-5 text-red-500" />;
      default:
        return <HiOutlineClock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusClass = (status) => {
    if (!status) return "text-gray-500";
    
    switch(status.toString().toUpperCase()) {
      case 'COMPLETED':
      case 'FINISHED':
      case 'DELIVERED':
        return "text-green-600 dark:text-green-400";
      case 'PENDING':
      case 'PREPARING':
      case 'READY':
      case 'ACCEPTED':
        return "text-yellow-600 dark:text-yellow-400";
      case 'CANCELLED':
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('orders.details') || 'Order Details'} - #{order.id}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Order Summary */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('orders.orderInfo') || 'Order Information'}
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('profile.orderId') || 'Order ID'}:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">#{order.id}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('profile.date') || 'Date'}:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{formatDate(order.orderTime)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('profile.status') || 'Status'}:</span>
                  <div className="flex items-center">
                    {getStatusIcon(order.orderStatus)}
                    <span className={`ml-1 text-sm font-medium ${getStatusClass(order.orderStatus)}`}>
                      {order.orderStatus ? order.orderStatus.replace(/_/g, ' ') : '—'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('profile.amount') || 'Total Amount'}:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{formatCurrency(order.totalPrice)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('orders.restaurantInfo') || 'Restaurant Information'}
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('orders.restaurant') || 'Restaurant'}:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{order.restorantName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('orders.restaurantId') || 'Restaurant ID'}:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">#{order.restorantId || '—'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('orders.orderItems') || 'Order Items'}
            </h4>
            {isLoadingItems ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 dark:border-gray-300 mb-2"></div>
                <p className="text-gray-600 dark:text-gray-300">{t('loading') || 'Loading...'}</p>
              </div>
            ) : order.products && order.products.length > 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('orders.item') || 'Item'}
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('orders.quantity') || 'Quantity'}
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('orders.price') || 'Price'}
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('orders.subtotal') || 'Subtotal'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                    {order.products.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                          <div className="flex items-center">
                            {item.productImage ? (
                              <div className="w-12 h-12 relative rounded overflow-hidden border border-gray-200 dark:border-gray-600 mr-3 flex-shrink-0">
                                <img 
                                  src={`${import.meta.env.VITE_API_URL}${item.productImage}`} 
                                  alt={item.productName} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/48?text=No+Image";
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="text-xs text-gray-500 dark:text-gray-400">No image</span>
                              </div>
                            )}
                            <span className="font-medium">{item.productName || 'Product'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-800 dark:text-white">
                          {item.quantity || 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-800 dark:text-white">
                          {formatCurrency(item.productPriceAtOrder)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-800 dark:text-white">
                          {formatCurrency(item.productPriceAtOrder * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-sm text-right font-medium text-gray-700 dark:text-gray-300">
                        {t('orders.total') || 'Total'}:
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-900 dark:text-white">
                        {formatCurrency(order.totalPrice)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-300">
                  {t('orders.noItemDetails') || 'No detailed item information available for this order'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('orders.total') || 'Total'}: {formatCurrency(order.totalPrice)}
                </p>
              </div>
            )}
          </div>
          
          {/* Additional Information */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('orders.additionalInfo') || 'Additional Information'}
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <p>{t('orders.thanksMessage') || 'Thank you for your order! If you have any questions, please contact our support.'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {t('common.close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal; 