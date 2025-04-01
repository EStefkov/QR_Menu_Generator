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
    const [editingOrderStatus, setEditingOrderStatus] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
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

    // For clicking on status in the table
    const handleStatusClick = (order, event) => {
        event.stopPropagation(); // Prevent triggering the row click
        setEditingOrderStatus(order.id);
    };

    // For handling status change in the dropdown in the table
    const handleStatusUpdateInList = async (orderId, newStatus, event) => {
        if (event) {
            event.stopPropagation(); // Prevent triggering the row click
        }
        
        setUpdatingStatus(true);
        try {
            await orderApi.updateOrderStatus(orderId, newStatus);
            
            // Update the order in the list
            setOrders(prev => prev.map(order => 
                order.id === orderId 
                    ? { ...order, orderStatus: newStatus } 
                    : order
            ));
            
            // If this was the selected order, update its details too
            if (selectedOrder && selectedOrder.id === orderId) {
                setOrderDetails(prev => ({
                    ...prev,
                    orderStatus: newStatus
                }));
            }
            
            setEditingOrderStatus(null);
        } catch (err) {
            console.error('Error updating order status:', err);
            setError(t('errors.failedToUpdateOrderStatus'));
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleCancelStatusEdit = (event) => {
        event.stopPropagation(); // Prevent triggering the row click
        setEditingOrderStatus(null);
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
                                                    {editingOrderStatus === order.id ? (
                                                        <div className="flex items-center space-x-2">
                                                            <select 
                                                                defaultValue={order.orderStatus}
                                                                onChange={(e) => handleStatusUpdateInList(order.id, e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="text-xs rounded border border-gray-600 bg-gray-700 text-white py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            >
                                                                <option value="PENDING">{t('orders.statusPENDING')}</option>
                                                                <option value="PREPARING">{t('orders.statusPREPARING')}</option>
                                                                <option value="READY">{t('orders.statusREADY')}</option>
                                                                <option value="DELIVERED">{t('orders.statusDELIVERED')}</option>
                                                                <option value="CANCELLED">{t('orders.statusCANCELLED')}</option>
                                                            </select>
                                                            <button 
                                                                onClick={handleCancelStatusEdit}
                                                                className="text-gray-400 hover:text-gray-200"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path d="M6 18L18 6M6 6l12 12"></path>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={(e) => handleStatusClick(order, e)}
                                                            className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.orderStatus)} hover:opacity-80 transition-opacity`}
                                                        >
                                                            {getStatusIcon(order.orderStatus)}
                                                            <span className="ml-1">
                                                                {order.orderStatus.replace('_', ' ')}
                                                            </span>
                                                            <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                    {order.totalPrice ? `${order.totalPrice.toFixed(2)} лв.` : '-'}
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
        </div>
    );
};

export default OrdersHistory;