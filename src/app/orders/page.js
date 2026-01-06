'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      const response = await fetch(`/api/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Orders fetch error:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [currentPage, router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function viewOrderDetails(orderId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch order details');
      }

      const data = await response.json();
      setSelectedOrder(data.order);
    } catch (err) {
      console.error('Fetch order details error:', err);
      alert(err.message);
    }
  }

  const OrderDetailsModal = () => {
    if (!selectedOrder) return null;
    
    return (
      <dialog className="modal modal-open">
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-lg mb-4">
            Order Details #{selectedOrder._id}
          </h3>
          
          <div className="space-y-4">
            {selectedOrder.items.map((item) => (
              <div key={item._id} className="flex gap-4 items-center">
                <Image
                  src={item.productId.images[0]}
                  alt={item.productId.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                  loading="lazy"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.productId.name}</h3>
                  <p className="text-sm opacity-70">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="divider"></div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${selectedOrder.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${selectedOrder.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${selectedOrder.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${selectedOrder.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="modal-action">
            <button 
              className="btn" 
              onClick={() => setSelectedOrder(null)}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    );
  };

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
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg mb-4">You haven&apos;t placed any orders yet.</p>
          <Link href="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.items?.length} items</td>
                  <td>${order.total?.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${
                      order.status === 'delivered' ? 'badge-success' : 
                      order.status === 'pending' ? 'badge-warning' : 
                      'badge-info'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => viewOrderDetails(order._id)}
                      className="btn btn-sm btn-outline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.total > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="py-2 px-4">
            Page {currentPage} of {pagination.total}
          </span>
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!pagination.hasMore}
          >
            Next
          </button>
        </div>
      )}

      <OrderDetailsModal />
    </div>
  );
}
