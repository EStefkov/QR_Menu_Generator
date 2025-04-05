import React, { useState } from 'react';
import { HiEye, HiX, HiSearch, HiArrowUp, HiArrowDown } from 'react-icons/hi';
import { useLanguage } from '../../contexts/LanguageContext';
// Заменете пътя спрямо вашата реална структура
import Pagination from '../Pagination';

const RecentOrders = ({
  adminStats,
  ordersPage,
  setOrdersPage,
  itemsPerPage,
  selectedOrder,
  orderDetails,
  loadingDetails,
  detailsError,
  onOrderClick,
  onCloseDetails,
  onUpdateOrderStatus
}) => {
  const { t } = useLanguage();
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const formatDate = (str) => {
    if (!str) return '-';
    return new Intl.DateTimeFormat('bg-BG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(str));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  const getStatusClass = (status) => {
    if (!status) return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    const st = status.toUpperCase();
    if (st === 'ACCEPTED') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
    if (st === 'READY') return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    if (st === 'CANCELLED') return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
    if (st === 'PENDING') return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    if (st === 'DELIVERED') return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <HiArrowUp className="inline-block ml-1" />
    ) : (
      <HiArrowDown className="inline-block ml-1" />
    );
  };

  const getFilteredOrders = () => {
    if (!adminStats?.recentOrders) return [];
    const lower = orderSearchTerm.toLowerCase();
    const filtered = adminStats.recentOrders.filter((o) => {
      return (
        (o.id || '').toString().includes(lower) ||
        (o.customerName || '').toLowerCase().includes(lower) ||
        (o.restaurantName || '').toLowerCase().includes(lower) ||
        (o.status || '').toLowerCase().includes(lower)
      );
    });
    return filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case 'id':
          aVal = a.id;
          bVal = b.id;
          break;
        case 'customer':
          aVal = (a.customerName || '').toLowerCase();
          bVal = (b.customerName || '').toLowerCase();
          break;
        case 'restaurant':
          aVal = (a.restaurantName || '').toLowerCase();
          bVal = (b.restaurantName || '').toLowerCase();
          break;
        case 'amount':
          aVal = a.totalAmount || 0;
          bVal = b.totalAmount || 0;
          break;
        case 'status':
          aVal = (a.status || '').toLowerCase();
          bVal = (b.status || '').toLowerCase();
          break;
        case 'date':
          aVal = new Date(a.orderDate).getTime();
          bVal = new Date(b.orderDate).getTime();
          break;
        default:
          aVal = 0;
          bVal = 0;
          break;
      }
      if (sortDirection === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setOrdersPage(1);
  };

  const data = getFilteredOrders();
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (ordersPage - 1) * itemsPerPage;
  const pageData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        {t('admin.recentOrders') || 'Recent Orders'}
      </h3>

      {selectedOrder && orderDetails ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden transition-colors duration-200">
          <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {t('orders.orderDetails') || 'Order Details'} #{selectedOrder.id}
              </h3>
              <button 
                onClick={onCloseDetails}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : detailsError ? (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">{detailsError}</div>
            ) : (
              <div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
                  <p className="mb-1 text-gray-700 dark:text-gray-300">{t('orders.status') || 'Status'}:</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusClass(
                        orderDetails.status
                      )}`}
                    >
                      {t(`orders.status.${orderDetails.status?.toLowerCase()}`) || orderDetails.status}
                    </span>
                    <button
                      className="ml-2 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                      onClick={() => onUpdateOrderStatus(orderDetails.id, 'ACCEPTED')}
                    >
                      {t('admin.acceptOrder') || 'Accept'}
                    </button>
                    <button
                      className="ml-2 px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-md hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors"
                      onClick={() => onUpdateOrderStatus(orderDetails.id, 'READY')}
                    >
                      {t('admin.orderReady') || 'Ready'}
                    </button>
                    <button
                      className="ml-2 px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                      onClick={() => onUpdateOrderStatus(orderDetails.id, 'CANCELLED')}
                    >
                      {t('admin.cancelOrder') || 'Cancel'}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">{t('orders.items') || 'Order Items'}</h4>
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
                          {orderDetails.products.map((item, i) => (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                              <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{item.productName}</td>
                              <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300">{item.quantity}</td>
                              <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300">
                                {formatCurrency(item.productPriceAtOrder)}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300">
                                {formatCurrency(
                                  (item.productPriceAtOrder || 0) * (item.quantity || 0)
                                )}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50 dark:bg-gray-700 font-medium">
                            <td colSpan="3" className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                              {t('orders.total') || 'Total'}:
                            </td>
                            <td className="px-3 py-2 text-gray-900 dark:text-white">
                              {formatCurrency(orderDetails.totalAmount)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm italic text-gray-500 dark:text-gray-400">{t('orders.noItems') || 'No items.'}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden transition-colors duration-200">
          {/* Search */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('admin.searchOrders') || "Search orders..."}
                value={orderSearchTerm}
                onChange={(e) => {
                  setOrderSearchTerm(e.target.value);
                  setOrdersPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    onClick={() => handleSort('id')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span className="flex items-center">
                      {t('orders.id') || 'ID'}
                      {renderSortIcon('id')}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('date')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span className="flex items-center">
                      {t('orders.date') || 'Date'}
                      {renderSortIcon('date')}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('customer')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span className="flex items-center">
                      {t('orders.customer') || 'Customer'}
                      {renderSortIcon('customer')}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('restaurant')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span className="flex items-center">
                      {t('restaurants.restaurant') || 'Restaurant'}
                      {renderSortIcon('restaurant')}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span className="flex items-center">
                      {t('orders.status') || 'Status'}
                      {renderSortIcon('status')}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('amount')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span className="flex items-center">
                      {t('orders.total') || 'Total'}
                      {renderSortIcon('amount')}
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('common.actions') || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {pageData.length > 0 ? (
                  pageData.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {order.customerName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {order.restaurantName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {t(`orders.status.${order.status?.toLowerCase()}`) || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <button
                          onClick={() => onOrderClick(order)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title={t('common.view') || 'View'}
                        >
                          <HiEye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {t('admin.noOrders') || 'No orders found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={ordersPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            itemsPerPage={itemsPerPage}
            onPageChange={setOrdersPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setOrdersPage(1);
            }}
            itemLabel={t('orders.orders') || 'orders'}
          />
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
