// Примерен вариант на PopularProducts.jsx, който използва вашия съществуващ компонент Pagination вместо PaginationControls

import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Pagination from '../Pagination';
import { HiArrowUp, HiArrowDown, HiSearch } from 'react-icons/hi';

const PopularProducts = ({ adminStats, productsPage, setProductsPage, itemsPerPage, setItemsPerPage }) => {
  const { t } = useLanguage();
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [sortField, setSortField] = useState('orderCount');
  const [sortDirection, setSortDirection] = useState('desc');

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN'
    }).format(val || 0);
  };

  const getFilteredProducts = () => {
    if (!adminStats?.popularProducts) return [];
    const lower = productSearchTerm.toLowerCase();
    const filtered = adminStats.popularProducts.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const rest = (p.restaurantName || '').toLowerCase();
      return name.includes(lower) || rest.includes(lower);
    });

    return filtered.sort((a, b) => {
      let aVal, bVal;
      if (sortField === 'name') {
        aVal = (a.name || '').toLowerCase();
        bVal = (b.name || '').toLowerCase();
      } else if (sortField === 'restaurant') {
        aVal = (a.restaurantName || '').toLowerCase();
        bVal = (b.restaurantName || '').toLowerCase();
      } else if (sortField === 'orderCount') {
        aVal = a.orderCount || 0;
        bVal = b.orderCount || 0;
      } else {
        aVal = 0;
        bVal = 0;
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
    setProductsPage(1);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <HiArrowUp className="inline-block ml-1" />
    ) : (
      <HiArrowDown className="inline-block ml-1" />
    );
  };

  const data = getFilteredProducts();
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (productsPage - 1) * itemsPerPage;
  const pageData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        {t('admin.popularProducts') || 'Most Popular Products'}
      </h3>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden transition-colors duration-200">
        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('admin.searchProducts') || "Search products or restaurants..."}
              value={productSearchTerm}
              onChange={(e) => {
                setProductSearchTerm(e.target.value);
                setProductsPage(1);
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('name')}
                >
                  <span className="flex items-center">
                    {t('products.name') || 'Product'}
                    {renderSortIcon('name')}
                  </span>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('restaurant')}
                >
                  <span className="flex items-center">
                    {t('restaurants.restaurant') || 'Restaurant'}
                    {renderSortIcon('restaurant')}
                  </span>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('orderCount')}
                >
                  <span className="flex items-center">
                    {t('orders.count') || 'Orders'}
                    {renderSortIcon('orderCount')}
                  </span>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {t('orders.amount') || 'Revenue'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {pageData.length > 0 ? (
                pageData.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {p.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {p.restaurantName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        {p.orderCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {formatCurrency(p.revenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t('admin.noPopularProducts') || 'No popular products found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination using your Pagination component */}
        <Pagination
          currentPage={productsPage}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          itemsPerPage={itemsPerPage}
          onPageChange={setProductsPage}
          onItemsPerPageChange={setItemsPerPage}
          itemLabel={t('products.products') || 'products'}
        />
      </div>
    </div>
  );
};

export default PopularProducts;
