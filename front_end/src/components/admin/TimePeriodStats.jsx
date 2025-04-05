import React from 'react';
import { HiClock } from 'react-icons/hi';

const TimePeriodStats = ({ adminStats }) => {
  const isToday = (date) => {
    const d = new Date(date);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };
  const isThisWeek = (date) => {
    const d = new Date(date);
    const now = new Date();
    const firstDayOfWeek = new Date(now);
    firstDayOfWeek.setDate(now.getDate() - now.getDay());
    firstDayOfWeek.setHours(0, 0, 0, 0);
    return d >= firstDayOfWeek;
  };
  const isThisMonth = (date) => {
    const d = new Date(date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  let todayOrders = 0;
  let todayRevenue = 0;
  let weekOrders = 0;
  let weekRevenue = 0;
  let monthOrders = 0;
  let monthRevenue = 0;

  if (adminStats?.recentOrders) {
    const active = adminStats.recentOrders.filter(
      (o) => (o.status || '').toUpperCase() !== 'CANCELLED'
    );
    for (const o of active) {
      if (isToday(o.orderDate)) {
        todayOrders++;
        todayRevenue += o.totalAmount || 0;
      }
      if (isThisWeek(o.orderDate)) {
        weekOrders++;
        weekRevenue += o.totalAmount || 0;
      }
      if (isThisMonth(o.orderDate)) {
        monthOrders++;
        monthRevenue += o.totalAmount || 0;
      }
    }
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' }).format(val || 0);
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Time Period Statistics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl shadow p-6">
          <div className="flex items-center mb-4">
            <div className="bg-orange-500 p-3 rounded-lg">
              <HiClock className="h-6 w-6 text-white" />
            </div>
            <h4 className="ml-3 text-lg font-semibold">Today</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm">Orders</p>
              <p className="text-xl font-bold">{todayOrders}</p>
            </div>
            <div>
              <p className="text-sm">Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(todayRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-teal-50 to-emerald-100 rounded-xl shadow p-6">
          <div className="flex items-center mb-4">
            <div className="bg-teal-500 p-3 rounded-lg">
              <HiClock className="h-6 w-6 text-white" />
            </div>
            <h4 className="ml-3 text-lg font-semibold">This Week</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm">Orders</p>
              <p className="text-xl font-bold">{weekOrders}</p>
            </div>
            <div>
              <p className="text-sm">Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(weekRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <HiClock className="h-6 w-6 text-white" />
            </div>
            <h4 className="ml-3 text-lg font-semibold">This Month</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm">Orders</p>
              <p className="text-xl font-bold">{monthOrders}</p>
            </div>
            <div>
              <p className="text-sm">Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(monthRevenue)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimePeriodStats;
