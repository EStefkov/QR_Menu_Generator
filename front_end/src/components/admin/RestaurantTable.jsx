import React, { useState } from 'react';
import { HiEye, HiTrash } from 'react-icons/hi';
import { useLanguage } from '../../contexts/LanguageContext';
import PaginationControls from '../common/PaginationControls';
import SearchBar from '../common/SearchBar';

const RestaurantTable = ({ 
  restaurants, 
  onViewMenus, 
  onDeleteRestaurant,
  formatCurrency
}) => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const itemsPerPage = 5;
  
  // Filter function for restaurants
  const getFilteredRestaurants = () => {
    if (!restaurants || !Array.isArray(restaurants)) {
      return [];
    }
    
    // Filter by search term
    const filtered = restaurants.filter(restaurant => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (restaurant.name?.toLowerCase() || '').includes(searchTermLower) ||
        (restaurant.restorantName?.toLowerCase() || '').includes(searchTermLower) ||
        (restaurant.id?.toString() || '').includes(searchTermLower)
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
        case 'name':
          aValue = (a.name || a.restorantName || '').toLowerCase();
          bValue = (b.name || b.restorantName || '').toLowerCase();
          break;
        case 'revenue':
          aValue = Number(a.totalRevenue || 0);
          bValue = Number(b.totalRevenue || 0);
          break;
        case 'orders':
          aValue = Number(a.totalOrders || a.orderCount || 0);
          bValue = Number(b.totalOrders || b.orderCount || 0);
          break;
        case 'avgOrder':
          aValue = Number(a.averageOrderValue || 0);
          bValue = Number(b.averageOrderValue || 0);
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

  const filteredRestaurants = getFilteredRestaurants();
  
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
          placeholder={t('admin.searchRestaurants') || 'Search restaurants...'}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  {t('admin.restaurantName') || 'Restaurant'}
                  {renderSortIndicator('name')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('revenue')}
              >
                <div className="flex items-center">
                  {t('admin.revenue') || 'Revenue'}
                  {renderSortIndicator('revenue')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('orders')}
              >
                <div className="flex items-center">
                  {t('admin.orderCount') || 'Orders'}
                  {renderSortIndicator('orders')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('avgOrder')}
              >
                <div className="flex items-center">
                  {t('admin.avgOrder') || 'Avg. Order'}
                  {renderSortIndicator('avgOrder')}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.actions') || 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {getPaginatedData(filteredRestaurants).map((restaurant, index) => (
              <tr 
                key={restaurant.id || index} 
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{restaurant.name || restaurant.restorantName}</div>
                  {restaurant.id && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">ID: {restaurant.id}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(restaurant.totalRevenue || 0)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{restaurant.totalOrders || restaurant.orderCount || 0}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(restaurant.averageOrderValue || 0)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => onViewMenus(restaurant)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                    >
                      <HiEye className="mr-1 h-4 w-4" />
                      {t('admin.viewMenus') || 'View Menus'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRestaurant(restaurant, e);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                    >
                      <HiTrash className="mr-1 h-4 w-4" />
                      {t('common.delete') || 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <PaginationControls 
        currentPage={currentPage} 
        totalPages={getTotalPages(filteredRestaurants)} 
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default RestaurantTable; 