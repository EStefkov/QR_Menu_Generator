import React, { useState } from 'react';
import { HiEye } from 'react-icons/hi';
import { useLanguage } from '../../contexts/LanguageContext';
import PaginationControls from '../common/PaginationControls';
import SearchBar from '../common/SearchBar';

const OrdersTable = ({ 
  orders, 
  onViewDetails, 
  formatCurrency,
  formatDate 
}) => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const itemsPerPage = 5;
  
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

  // Filter function for orders
  const getFilteredOrders = () => {
    if (!orders || !Array.isArray(orders)) {
      return [];
    }
    
    // Filter by search term
    const filtered = orders.filter(order => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (order.id?.toString() || '').includes(searchTermLower) ||
        (order.customerName?.toLowerCase() || '').includes(searchTermLower) ||
        (order.restaurantName?.toLowerCase() || '').includes(searchTermLower) ||
        (order.status?.toLowerCase() || '').includes(searchTermLower)
      );
    });
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      // Determine which field to sort by
      switch(sortField) {
        case 'id':
          aValue = Number(a.id);
          bValue = Number(b.id);
          break;
        case 'customer':
          aValue = (a.customerName || '').toLowerCase();
          bValue = (b.customerName || '').toLowerCase();
          break;
        case 'restaurant':
          aValue = (a.restaurantName || '').toLowerCase();
          bValue = (b.restaurantName || '').toLowerCase();
          break;
        case 'amount':
          aValue = Number(a.totalAmount || 0);
          bValue = Number(b.totalAmount || 0);
          break;
        case 'status':
          aValue = (a.status || '').toLowerCase();
          bValue = (b.status || '').toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.orderDate || 0).getTime();
          bValue = new Date(b.orderDate || 0).getTime();
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }
      
      // Compare based on sort direction
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Handle column header click for sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return (
        <span className="text-gray-400 ml-1">
          <svg className="h-4 w-4 inline-block" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
          </svg>
        </span>
      );
    }
    
    if (sortDirection === 'asc') {
      return (
        <span className="text-blue-500 ml-1">
          <svg className="h-4 w-4 inline-block" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M5 15l7-7 7 7"></path>
          </svg>
        </span>
      );
    } else {
      return (
        <span className="text-blue-500 ml-1">
          <svg className="h-4 w-4 inline-block" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 9l-7 7-7-7"></path>
          </svg>
        </span>
      );
    }
  };

  // Pagination functions
  const getPaginatedData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };
  
  const getTotalPages = (data) => {
    if (!data || !Array.isArray(data)) return 0;
    return Math.ceil(data.length / itemsPerPage);
  };

  const filteredOrders = getFilteredOrders();
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">
      {/* Search Bar */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <SearchBar 
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1); // Reset to first page when searching
          }}
          placeholder={t('admin.searchOrders') || 'Search orders by ID, customer, restaurant or status...'}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center">
                  {t('admin.orderId') || 'Order ID'}
                  {renderSortIndicator('id')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('customer')}
              >
                <div className="flex items-center">
                  {t('admin.customer') || 'Customer'}
                  {renderSortIndicator('customer')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('restaurant')}
              >
                <div className="flex items-center">
                  {t('admin.restaurant') || 'Restaurant'}
                  {renderSortIndicator('restaurant')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center">
                  {t('admin.amount') || 'Amount'}
                  {renderSortIndicator('amount')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  {t('admin.status') || 'Status'}
                  {renderSortIndicator('status')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  {t('admin.date') || 'Date'}
                  {renderSortIndicator('date')}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.actions') || 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {getPaginatedData(filteredOrders).map((order, index) => (
              <tr 
                key={order.id || index} 
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation(); 
                  onViewDetails(order);
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">#{order.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{order.customerName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{order.restaurantName}</div>
                  {order.restorantId && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">ID: {order.restorantId}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(order.totalAmount)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(order.orderDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the row click
                      onViewDetails(order);
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                  >
                    <HiEye className="mr-1 h-4 w-4" />
                    {t('admin.viewDetails') || 'View'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <PaginationControls 
        currentPage={currentPage} 
        totalPages={getTotalPages(filteredOrders)}
        onPageChange={setCurrentPage} 
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default OrdersTable; 