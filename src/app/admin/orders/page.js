'use client';

import { useState, useEffect } from 'react';
import OrderDetailsModal from '@/app/components/admin/OrderDetailsModal';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function fetchOrders() {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '10'
      });
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setOrders(data.orders);
    } catch (err) {
      console.error('Orders fetch error:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(orderId, newStatus) {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update order status');
      }
      
      const updatedOrder = await response.json();
      setOrders(orders.map(order => 
        order._id === orderId ? updatedOrder : order
      ));
    } catch (err) {
      console.error('Status update error:', err);
      alert(err.message);
    }
  }

  async function viewOrderDetails(orderId) {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
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

  if (loading) {
    return <div className="flex justify-center p-8">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select 
          className="select select-bordered"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.userId?.email || 'N/A'}</td>
                <td>{new Date(order.paidAt || order.createdAt).toLocaleDateString()}</td>
                <td>${order.total?.toFixed(2) || '0.00'}</td>
                <td>
                  <select
                    className="select select-bordered select-sm"
                    value={order.status || 'pending'}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => viewOrderDetails(order._id)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
