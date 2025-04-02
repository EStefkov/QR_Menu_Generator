import React, { useState, useEffect } from 'react';
import { fetchAllOrdersApi } from '../api/adminDashboard';
import { orderApi } from '../api/orderApi';
import { useTranslation } from 'react-i18next';

const OrdersHistory = ({ token }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [orderStatus, setOrderStatus] = useState('ALL');
    const [sortDirection, setSortDirection] = useState('desc');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [showClearAllModal, setShowClearAllModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { t } = useTranslation();

    const pageSize = 10;

    useEffect(() => {
        fetchOrders();
    }, [token, currentPage, sortDirection, orderStatus]);

    const fetchOrders = async () => {
        if (!token) return;
        
        try {
            setLoading(true);
            setError(null);
            const data = await fetchAllOrdersApi(token, currentPage, pageSize, 'orderTime', sortDirection);
            
            // Filter by status if needed
            let filteredOrders = data.content;
            if (orderStatus !== 'ALL') {
                filteredOrders = data.content.filter(order => order.orderStatus === orderStatus);
            }
            
            setOrders(filteredOrders);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(t('errors.failedToLoadOrders'));
        } finally {
            setLoading(false);
        }
    };

    const handleOrderClick = async (order) => {
        setSelectedOrder(order);
        setLoadingDetails(true);
        
        try {
            const details = await orderApi.getOrderById(order.id);
            setOrderDetails(details);
        } catch (err) {
            console.error('Error fetching order details:', err);
            setError(t('errors.failedToLoadOrderDetails'));
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCloseDetails = () => {
        setSelectedOrder(null);
        setOrderDetails(null);
    };

    const handleStatusChange = (e) => {
        setOrderStatus(e.target.value);
        setCurrentPage(0); // Reset to first page when filter changes
    };

    const handleSortDirectionChange = () => {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    };

    // For updating status in the order details view
    const handleUpdateOrderStatusInDetail = async (newStatus) => {
        if (!selectedOrder || !orderDetails) return;
        
        try {
            await orderApi.updateOrderStatus(selectedOrder.id, newStatus);
            
            // Update local state
            setOrderDetails({
                ...orderDetails,
                orderStatus: newStatus
            });
            
            // Update the order in the list
            setOrders(prev => prev.map(order => 
                order.id === selectedOrder.id 
                    ? { ...order, orderStatus: newStatus } 
                    : order
            ));
            
        } catch (err) {
            console.error('Error updating order status:', err);
            setError(t('errors.failedToUpdateOrderStatus'));
        }
    };

    const handleDeleteClick = (order, event) => {
        if (event) {
            event.stopPropagation(); // Prevent triggering the row click
        }
        setOrderToDelete(order);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!orderToDelete) return;
        
        setIsDeleting(true);
        try {
            await orderApi.deleteOrder(orderToDelete.id);
            
            // Remove from local state
            setOrders(prevOrders => prevOrders.filter(o => o.id !== orderToDelete.id));
            
            // If this was the selected order in details view, close it
            if (selectedOrder && selectedOrder.id === orderToDelete.id) {
                setSelectedOrder(null);
                setOrderDetails(null);
            }
            
            setShowDeleteModal(false);
            setOrderToDelete(null);
        } catch (err) {
            console.error('Error deleting order:', err);
            setError(t('errors.failedToDeleteOrder'));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClearAllClick = () => {
        setShowClearAllModal(true);
    };

    const handleConfirmClearAll = async () => {
        setIsDeleting(true);
        try {
            // For this example, we're assuming all orders in the list are from the same restaurant
            // In a real app, you might need to pass the restaurant ID explicitly
            if (orders.length > 0) {
                const restaurantId = orders[0].restorantId;
                await orderApi.deleteAllOrdersByRestaurant(restaurantId);
                
                // Clear local state
                setOrders([]);
                setSelectedOrder(null);
                setOrderDetails(null);
            }
            
            setShowClearAllModal(false);
        } catch (err) {
            console.error('Error clearing order history:', err);
            setError(t('errors.failedToClearOrderHistory'));
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-800 text-yellow-100 border border-yellow-700';
            case 'PREPARING':
                return 'bg-blue-800 text-blue-100 border border-blue-700';
            case 'READY':
                return 'bg-green-800 text-green-100 border border-green-700';
            case 'DELIVERED':
                return 'bg-purple-800 text-purple-100 border border-purple-700';
            case 'CANCELLED':
                return 'bg-red-800 text-red-100 border border-red-700';
            default:
                return 'bg-gray-700 text-gray-100 border border-gray-600';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('bg-BG', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <svg className="h-4 w-4 text-yellow-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>;
            case 'PREPARING':
                return <svg className="h-4 w-4 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>;
            case 'READY':
                return <svg className="h-4 w-4 text-green-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>;
            case 'DELIVERED':
                return <svg className="h-4 w-4 text-purple-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7M3 17h6m4 0h8" />
                </svg>;
            case 'CANCELLED':
                return <svg className="h-4 w-4 text-red-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>;
            default:
                return <svg className="h-4 w-4 text-gray-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>;
        }
    };

    if (loading && orders.length === 0) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">{t('common.error')}!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
            {selectedOrder && orderDetails ? (
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">
                            {t('orders.orderDetails')} #{selectedOrder.id}
                        </h3>
                        <button 
                            onClick={handleCloseDetails}
                            className="text-gray-300 hover:text-white focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    {loadingDetails ? (
                        <div className="flex justify-center items-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-700 rounded-lg">
                                    <h4 className="font-medium text-white mb-2">{t('orders.orderInfo')}</h4>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-300">
                                            <span className="font-medium">{t('orders.date')}:</span> {formatDate(orderDetails.orderTime)}
                                        </p>
                                        <p className="text-sm text-gray-300">
                                            <span className="font-medium">{t('orders.status')}:</span> 
                                            <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(orderDetails.orderStatus)}`}>
                                                {orderDetails.orderStatus.replace('_', ' ')}
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-300">
                                            <span className="font-medium">{t('orders.total')}:</span> {orderDetails.totalPrice ? `${orderDetails.totalPrice.toFixed(2)} лв.` : '-'}
                                        </p>
                                        <p className="text-sm text-gray-300">
                                            <span className="font-medium">{t('orders.restaurant')}:</span> {orderDetails.restorantId || t('common.unknown')}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-gray-700 rounded-lg">
                                    <h4 className="font-medium text-white mb-2">{t('orders.updateStatus')}</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleUpdateOrderStatusInDetail(status)}
                                                disabled={orderDetails.orderStatus === status}
                                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors 
                                                    ${orderDetails.orderStatus === status 
                                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                                        : `${getStatusClass(status)} hover:bg-opacity-80`
                                                    }`}
                                            >
                                                {t(`orders.status${status}`)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-gray-700 rounded-lg">
                                <h4 className="font-medium text-white mb-4">{t('orders.items')}</h4>
                                {orderDetails.products && orderDetails.products.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-600">
                                            <thead>
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                        {t('orders.product')}
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                        {t('orders.quantity')}
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                        {t('orders.price')}
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                        {t('orders.subtotal')}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-600">
                                                {orderDetails.products.map((item, index) => (
                                                    <tr key={index} className="hover:bg-gray-600">
                                                        <td className="px-4 py-2 text-sm text-gray-300">
                                                            {item.productName || `Product #${item.productId}`}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-300">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-300">
                                                            {item.productPriceAtOrder ? `${item.productPriceAtOrder.toFixed(2)} лв.` : '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-300">
                                                            {item.productPriceAtOrder && item.quantity ? `${(item.productPriceAtOrder * item.quantity).toFixed(2)} лв.` : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">
                                        {t('orders.noItems')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="p-4 border-b border-gray-700 flex flex-col md:flex-row justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">
                            {t('admin.ordersHistory')}
                        </h3>
                        <div className="flex flex-col md:flex-row gap-3 mt-3 md:mt-0">
                            <select 
                                value={orderStatus}
                                onChange={handleStatusChange}
                                className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 bg-gray-700 border-gray-600 text-white"
                            >
                                <option value="ALL">{t('orders.allStatuses')}</option>
                                <option value="PENDING">{t('orders.statusPENDING')}</option>
                                <option value="PREPARING">{t('orders.statusPREPARING')}</option>
                                <option value="READY">{t('orders.statusREADY')}</option>
                                <option value="DELIVERED">{t('orders.statusDELIVERED')}</option>
                                <option value="CANCELLED">{t('orders.statusCANCELLED')}</option>
                            </select>
                            <button
                                onClick={handleSortDirectionChange}
                                className="flex items-center justify-center px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 bg-gray-700 border-gray-600 text-white"
                            >
                                {sortDirection === 'asc' ? 
                                    <>{t('common.sortOldestFirst')} <span className="ml-1">↑</span></> : 
                                    <>{t('common.sortNewestFirst')} <span className="ml-1">↓</span></>
                                }
                            </button>
                            <button
                                onClick={handleClearAllClick}
                                className="flex items-center justify-center px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring focus:border-red-500 bg-red-700 border-red-600 text-white hover:bg-red-800"
                            >
                                Clear All History
                            </button>
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        <div className="p-6 text-center text-gray-400">
                            {t('orders.noOrdersFound')}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                {t('orders.id')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                {t('orders.date')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                {t('orders.restaurant')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                {t('orders.status')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                {t('orders.total')}
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                                        {orders.map((order) => (
                                            <tr 
                                                key={order.id} 
                                                className="hover:bg-gray-700 cursor-pointer"
                                                onClick={() => handleOrderClick(order)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                    #{order.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                    {formatDate(order.orderTime)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                    {order.restorantId || t('common.unknown')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.orderStatus)}`}>
                                                        {getStatusIcon(order.orderStatus)}
                                                        <span className="ml-1">
                                                            {order.orderStatus.replace('_', ' ')}
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                    {order.totalPrice ? `${order.totalPrice.toFixed(2)} лв.` : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button 
                                                            onClick={(e) => handleOrderClick(order)}
                                                            className="text-blue-400 hover:text-blue-300"
                                                            title="View details"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                        <button 
                                                            onClick={(e) => handleDeleteClick(order, e)}
                                                            className="text-red-400 hover:text-red-300"
                                                            title="Delete order"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-6 py-4 bg-gray-700 border-t border-gray-600 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-300">
                                        {t('pagination.showing')} <span className="font-medium">{orders.length}</span> {t('pagination.results')}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                        disabled={currentPage === 0}
                                        className={`px-3 py-1 border rounded text-sm ${
                                            currentPage === 0
                                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        {t('pagination.previous')}
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                        disabled={currentPage >= totalPages - 1}
                                        className={`px-3 py-1 border rounded text-sm ${
                                            currentPage >= totalPages - 1
                                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        {t('pagination.next')}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Delete Order Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-white mb-4">Confirm Delete</h3>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete order #{orderToDelete?.id}? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setOrderToDelete(null);
                                }}
                                className="px-4 py-2 border border-gray-600 rounded-md text-sm text-gray-300 hover:bg-gray-700"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 border border-red-700 rounded-md text-sm text-white hover:bg-red-700"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Deleting...
                                    </span>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear All Orders Confirmation Modal */}
            {showClearAllModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-white mb-4">Clear All Order History</h3>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete ALL orders for this restaurant? This action cannot be undone and will remove {orders.length} orders.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowClearAllModal(false)}
                                className="px-4 py-2 border border-gray-600 rounded-md text-sm text-gray-300 hover:bg-gray-700"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmClearAll}
                                className="px-4 py-2 bg-red-600 border border-red-700 rounded-md text-sm text-white hover:bg-red-700"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Deleting...
                                    </span>
                                ) : (
                                    'Delete All'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersHistory;