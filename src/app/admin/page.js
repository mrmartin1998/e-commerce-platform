'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import OrderDetailsModal from '@/app/components/admin/OrderDetailsModal';
import { StatCardSkeleton, TableSkeleton, ErrorState } from '@/components/ui/SkeletonLoader';
import SalesChart from '@/components/admin/dashboard/charts/SalesChart';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setDashboardData(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function viewOrderDetails(orderId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch order details');
      }

      const order = await response.json();
      setSelectedOrder(order);
    } catch (err) {
      console.error('Fetch order details error:', err);
      alert(err.message);
    }
  }

  const retryFetch = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (error && !loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <ErrorState 
          title="Dashboard Error"
          message={error}
          onRetry={retryFetch}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Sales Chart Section */}
      <div className="mb-8">
        <SalesChart />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <Link href="/admin/products/add" className="btn btn-primary">
          Add New Product
        </Link>
        <Link href="/admin/analytics" className="btn btn-secondary">
          📊 Analytics Dashboard
        </Link>
        <Link href="/admin/orders" className="btn btn-outline">
          View All Orders
        </Link>
        <Link href="/admin/products" className="btn btn-outline">
          View All Products
        </Link>
        <Link href="/admin/sales" className="btn btn-outline">
          View All Sales
        </Link>
        <Link href="/admin/customers/analytics" className="btn btn-outline">
          View All Customers
        </Link>
        <Link href="/admin/inventory/analytics" className="btn btn-outline">
          View All Inventory
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-base-100 shadow-xl rounded-box p-6">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        
        {loading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : (
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
                    <td>{order.userId?.name || order.userId?.email || 'Unknown'}</td>
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
                      <button 
                        onClick={() => viewOrderDetails(order._id)}
                        className="btn btn-sm"
                        disabled={loading}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OrderDetailsModal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
