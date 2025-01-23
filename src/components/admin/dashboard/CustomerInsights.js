'use client';

import { useState, useEffect } from 'react';

export default function CustomerInsights() {
  const [customerData, setData] = useState({
    overview: {
      totalCustomers: 0,
      activeCustomers: 0,
      averageOrdersPerCustomer: 0,
      newCustomersThisMonth: 0
    },
    trends: [],
    geoDistribution: [],
    purchaseFrequency: {
      oneTime: 0,
      repeated: 0,
      frequent: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCustomerData() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/analytics/customers', {
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

    fetchCustomerData();
  }, []);

  if (loading) return <div className="text-center p-4">Loading customer data...</div>;
  if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-base-100 shadow-xl rounded-box p-6">
          <h3 className="text-sm font-medium opacity-70">Total Customers</h3>
          <p className="text-3xl font-bold mt-2">{customerData.overview.totalCustomers}</p>
        </div>
        <div className="bg-base-100 shadow-xl rounded-box p-6">
          <h3 className="text-sm font-medium opacity-70">Active Customers</h3>
          <p className="text-3xl font-bold mt-2">{customerData.overview.activeCustomers}</p>
        </div>
        <div className="bg-base-100 shadow-xl rounded-box p-6">
          <h3 className="text-sm font-medium opacity-70">Avg Orders/Customer</h3>
          <p className="text-3xl font-bold mt-2">
            {customerData.overview.averageOrdersPerCustomer.toFixed(1)}
          </p>
        </div>
        <div className="bg-base-100 shadow-xl rounded-box p-6">
          <h3 className="text-sm font-medium opacity-70">New This Month</h3>
          <p className="text-3xl font-bold mt-2">{customerData.overview.newCustomersThisMonth}</p>
        </div>
      </div>

      {/* Customer Growth */}
      <div className="bg-base-100 shadow-xl rounded-box">
        <div className="p-6 border-b border-base-200">
          <h2 className="text-xl font-bold">Customer Growth</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>New Customers</th>
                <th>Total Customers</th>
              </tr>
            </thead>
            <tbody>
              {customerData.trends.map((day) => (
                <tr key={day._id}>
                  <td>{new Date(day._id).toLocaleDateString()}</td>
                  <td>{day.newCustomers}</td>
                  <td>{day.totalCustomers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-base-100 shadow-xl rounded-box">
        <div className="p-6 border-b border-base-200">
          <h2 className="text-xl font-bold">Geographic Distribution</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customerData.geoDistribution.map((item) => (
              <div key={item.country} className="bg-base-200 p-4 rounded-lg">
                <h3 className="font-medium">{item.country}</h3>
                <p className="mt-2 opacity-70">
                  Customers: {item.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Purchase Frequency */}
      <div className="bg-base-100 shadow-xl rounded-box">
        <div className="p-6 border-b border-base-200">
          <h2 className="text-xl font-bold">Purchase Frequency</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-base-200 p-4 rounded-lg">
              <h3 className="font-medium">One-time Customers</h3>
              <p className="text-2xl font-bold mt-2">{customerData.purchaseFrequency.oneTime}</p>
            </div>
            <div className="bg-base-200 p-4 rounded-lg">
              <h3 className="font-medium">Repeat Customers</h3>
              <p className="text-2xl font-bold mt-2">{customerData.purchaseFrequency.repeated}</p>
            </div>
            <div className="bg-base-200 p-4 rounded-lg">
              <h3 className="font-medium">Frequent Customers</h3>
              <p className="text-2xl font-bold mt-2">{customerData.purchaseFrequency.frequent}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 