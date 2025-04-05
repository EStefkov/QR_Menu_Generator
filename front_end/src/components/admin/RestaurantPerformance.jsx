import React, { useState } from 'react';
import PaginationControls from '../Pagination';
import { HiPlus, HiTrash, HiEye } from 'react-icons/hi';

const RestaurantPerformance = ({
  adminStats,
  restaurantPage,
  setRestaurantPage,
  itemsPerPage,
  onDeleteRestaurant,
  onShowCreateModal
}) => {
  const [restaurantSearchTerm, setRestaurantSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getFilteredRestaurants = () => {
    if (!adminStats?.restaurantStats) return [];
    const searchLower = restaurantSearchTerm.toLowerCase();
    const filtered = adminStats.restaurantStats.filter((r) => {
      const name = (r.name || r.restorantName || '').toLowerCase();
      return name.includes(searchLower) || (r.id || '').toString().includes(searchLower);
    });
    return filtered.sort((a, b) => {
      let aVal, bVal;
      if (sortField === 'name') {
        aVal = (a.name || a.restorantName || '').toLowerCase();
        bVal = (b.name || b.restorantName || '').toLowerCase();
      } else if (sortField === 'revenue') {
        aVal = a.totalRevenue || 0;
        bVal = b.totalRevenue || 0;
      } else if (sortField === 'orders') {
        aVal = a.totalOrders || a.orderCount || 0;
        bVal = b.totalOrders || b.orderCount || 0;
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
    setRestaurantPage(1);
  };

  const data = getFilteredRestaurants();
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (restaurantPage - 1) * itemsPerPage;
  const pageData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Restaurant Performance</h3>
        <button
          onClick={onShowCreateModal}
          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md"
        >
          <HiPlus className="mr-1 h-4 w-4" />
          Add Restaurant
        </button>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search restaurants..."
              value={restaurantSearchTerm}
              onChange={(e) => {
                setRestaurantSearchTerm(e.target.value);
                setRestaurantPage(1);
              }}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 cursor-pointer text-left text-xs font-medium"
                  onClick={() => handleSort('name')}
                >
                  Restaurant
                </th>
                <th
                  className="px-6 py-3 cursor-pointer text-left text-xs font-medium"
                  onClick={() => handleSort('revenue')}
                >
                  Revenue
                </th>
                <th
                  className="px-6 py-3 cursor-pointer text-left text-xs font-medium"
                  onClick={() => handleSort('orders')}
                >
                  Orders
                </th>
                <th className="px-6 py-3 text-xs font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>{r.name || r.restorantName}</div>
                    <div className="text-xs text-gray-500">ID: {r.id}</div>
                  </td>
                  <td className="px-6 py-4">{formatCurrency(r.totalRevenue || 0)}</td>
                  <td className="px-6 py-4">{r.totalOrders || r.orderCount || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center space-x-2">
                      <button className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded flex items-center">
                        <HiEye className="mr-1" />
                        View Menus
                      </button>
                      <button
                        onClick={(e) => onDeleteRestaurant(r, e)}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs rounded flex items-center"
                      >
                        <HiTrash className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationControls
          currentPage={restaurantPage}
          totalPages={totalPages}
          onPageChange={setRestaurantPage}
          itemsPerPage={itemsPerPage}
          totalItems={data.length}
        />
      </div>
    </div>
  );
};

export default RestaurantPerformance;
