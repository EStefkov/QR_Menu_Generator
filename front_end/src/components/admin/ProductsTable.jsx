import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import PaginationControls from '../common/PaginationControls';
import SearchBar from '../common/SearchBar';

const ProductsTable = ({ 
  products, 
  formatCurrency 
}) => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('orderCount');
  const [sortDirection, setSortDirection] = useState('desc');
  const itemsPerPage = 5;
  
  // Filter function for products
  const getFilteredProducts = () => {
    if (!products || !Array.isArray(products)) {
      return [];
    }
    
    // Filter by search term
    const filtered = products.filter(product => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (product.name?.toLowerCase() || '').includes(searchTermLower) ||
        (product.restaurantName?.toLowerCase() || '').includes(searchTermLower)
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
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'restaurant':
          aValue = (a.restaurantName || '').toLowerCase();
          bValue = (b.restaurantName || '').toLowerCase();
          break;
        case 'orderCount':
          aValue = Number(a.orderCount || 0);
          bValue = Number(b.orderCount || 0);
          break;
        case 'revenue':
          aValue = Number(a.revenue || 0);
          bValue = Number(b.revenue || 0);
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

  const filteredProducts = getFilteredProducts();
  
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
          placeholder={t('admin.searchProducts') || 'Search products or restaurants...'}
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
                  {t('admin.product') || 'Product'}
                  {renderSortIndicator('name')}
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
                onClick={() => handleSort('orderCount')}
              >
                <div className="flex items-center">
                  {t('admin.orderCount') || 'Orders'}
                  {renderSortIndicator('orderCount')}
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
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {getPaginatedData(filteredProducts).map((product, index) => (
              <tr key={product.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{product.restaurantName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{product.orderCount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(product.revenue)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <PaginationControls 
        currentPage={currentPage} 
        totalPages={getTotalPages(filteredProducts)} 
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default ProductsTable; 