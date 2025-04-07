import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const OrderStatusDistribution = ({ statusCounts }) => {
  const { t } = useLanguage();
  
  if (!statusCounts || Object.keys(statusCounts).length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{status}</p>
            <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">{count}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusDistribution; 