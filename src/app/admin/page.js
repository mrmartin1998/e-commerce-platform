'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/admin/dashboard', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setDashboardData(data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Total Orders</div>
          <div className="stat-value">{dashboardData?.metrics?.totalOrders || 0}</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Total Users</div>
          <div className="stat-value">{dashboardData?.metrics?.totalUsers || 0}</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Products</div>
          <div className="stat-value">{dashboardData?.metrics?.totalProducts || 0}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <Link href="/admin/products/add" className="btn btn-primary">
          Add New Product
        </Link>
        <Link href="/admin/orders" className="btn btn-outline">
          View All Orders
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-base-100 shadow-xl rounded-box p-6">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.recentOrders?.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.userId?.name}</td>
                  <td>
                    <span className={`badge ${
                      order.status === 'delivered' ? 'badge-success' : 
                      order.status === 'pending' ? 'badge-warning' : 
                      'badge-info'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/orders/${order._id}`} className="btn btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
