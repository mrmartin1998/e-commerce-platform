'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

export default function SalesOverview() {
  const [salesData, setData] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      totalProducts: 0
    },
    trends: [],
    categories: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSalesData() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/analytics/sales', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);
        setData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSalesData();
  }, []);

  if (loading) return <div className="text-center p-4">Loading sales data...</div>;
  if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-base-100 shadow-xl rounded-box p-6">
          <h3 className="text-sm font-medium opacity-70">Revenue</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(salesData.overview.totalRevenue)}</p>
        </div>
        <div className="bg-base-100 shadow-xl rounded-box p-6">
          <h3 className="text-sm font-medium opacity-70">Orders</h3>
          <p className="text-3xl font-bold mt-2">{salesData.overview.totalOrders}</p>
        </div>
        <div className="bg-base-100 shadow-xl rounded-box p-6">
          <h3 className="text-sm font-medium opacity-70">Avg. Order Value</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(salesData.overview.averageOrderValue)}</p>
        </div>
        <div className="bg-base-100 shadow-xl rounded-box p-6">
          <h3 className="text-sm font-medium opacity-70">Products Sold</h3>
          <p className="text-3xl font-bold mt-2">{salesData.overview.totalProducts}</p>
        </div>
      </div>

      {/* All Sales */}
      <div className="bg-base-100 shadow-xl rounded-box">
        <div className="p-6 border-b border-base-200">
          <h2 className="text-xl font-bold">All Sales</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {salesData.trends.map((day) => (
                <tr key={day._id}>
                  <td>{new Date(day._id).toLocaleDateString()}</td>
                  <td>{day.orders}</td>
                  <td>{formatCurrency(day.sales)}</td>
                  <td>
                    <span className="badge badge-warning">pending</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-base-100 shadow-xl rounded-box">
        <div className="p-6 border-b border-base-200">
          <h2 className="text-xl font-bold">Category Performance</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {salesData.categories.map((category) => (
              <div key={category._id} className="bg-base-200 p-4 rounded-lg">
                <h3 className="font-medium">{category._id || 'Uncategorized'}</h3>
                <p className="mt-2 opacity-70">
                  Revenue: {formatCurrency(category.revenue)}
                  <span className="ml-4">Orders: {category.orders}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 