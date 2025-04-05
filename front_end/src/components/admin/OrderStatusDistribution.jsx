import React from 'react';

const OrderStatusDistribution = ({ adminStats }) => {
  if (!adminStats.orderStatusCounts) return null;
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Order Status Distribution</h3>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Object.entries(adminStats.orderStatusCounts).map(([status, count]) => (
            <div key={status} className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-xs uppercase tracking-wide text-gray-500">{status}</p>
              <p className="mt-2 text-2xl font-bold text-gray-800">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusDistribution;
