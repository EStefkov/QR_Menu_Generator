import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiX } from 'react-icons/hi';

const OrderDetailsModal = ({ 
  order, 
  onClose, 
  loading, 
  error, 
  formatCurrency, 
  formatDate,
  onUpdateStatus 
}) => {
  const { t } = useLanguage();
  
  if (!order) return null;
  
  // Function to determine status class
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

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">
      <div className="p-4 md:p-6 dark:bg-gray-900">
        <div className="flex justify-between items-center mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {t('orders.orderDetails') || 'Order Details'} #{order.id}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
          >
            <HiX className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg">
            <p>{error}</p>
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
                  <p className="text-sm text-gray-900 dark:text-white mt-1">#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('orders.date') || 'Date'}</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{formatDate(order.orderDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('orders.status') || 'Status'}</p>
                  <p className="text-sm mt-1">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                      {order.status || 'ACCEPTED'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('orders.statusDate') || 'Status Date'}</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{formatDate(order.statusDate || order.lastUpdated)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('orders.total') || 'Total'}</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {formatCurrency(order.totalAmount || order.totalPrice || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('orders.customer') || 'Customer'}</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{order.customerName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('orders.restaurant') || 'Restaurant'}</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{order.restaurantName || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {/* Update Status */}
            {onUpdateStatus && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">{t('orders.updateStatus') || 'Update Status'}</h4>
                <div className="flex items-center mt-4 space-x-3">
                  <button
                    onClick={() => onUpdateStatus(order.id, 'ACCEPTED')}
                    className={`px-3 py-1 text-xs font-medium rounded-md ${
                      (order.status || order.orderStatus || '').toUpperCase() === 'ACCEPTED'
                        ? 'bg-blue-600 text-white cursor-not-allowed opacity-70'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-600'
                    }`}
                    disabled={(order.status || order.orderStatus || '').toUpperCase() === 'ACCEPTED'}
                  >
                    {t('admin.acceptOrder') || 'Accept'}
                  </button>
                  
                  <button
                    onClick={() => onUpdateStatus(order.id, 'READY')}
                    className={`px-3 py-1 text-xs font-medium rounded-md ${
                      (order.status || order.orderStatus || '').toUpperCase() === 'READY'
                        ? 'bg-green-600 text-white cursor-not-allowed opacity-70'
                        : 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-600'
                    }`}
                    disabled={(order.status || order.orderStatus || '').toUpperCase() === 'READY'}
                  >
                    {t('admin.orderReady') || 'Ready'}
                  </button>
                  
                  <button
                    onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                    className={`px-3 py-1 text-xs font-medium rounded-md ${
                      (order.status || order.orderStatus || '').toUpperCase() === 'CANCELLED'
                        ? 'bg-red-600 text-white cursor-not-allowed opacity-70'
                        : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-600'
                    }`}
                    disabled={(order.status || order.orderStatus || '').toUpperCase() === 'CANCELLED'}
                  >
                    {t('admin.cancelOrder') || 'Cancel'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                  {t('orders.items') || 'Order Items'}
                </h4>
              </div>
              <div className="p-4">
                {order.products && order.products.length > 0 ? (
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
                        {order.products.map((item, index) => (
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
  );
};

export default OrderDetailsModal; 