import React from 'react';

const StatsCard = ({ 
  icon: Icon, 
  title, 
  value, 
  description, 
  bgColorClass = "from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30",
  iconBgClass = "bg-blue-500 dark:bg-blue-600"
}) => {
  return (
    <div className={`bg-gradient-to-br ${bgColorClass} rounded-xl shadow p-6 transition hover:shadow-lg`}>
      <div className="flex items-center mb-4">
        <div className={`${iconBgClass} p-3 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">
          {title}
        </h3>
      </div>
      <p className="text-3xl font-bold text-gray-800 dark:text-white">
        {value}
      </p>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
};

export default StatsCard; 