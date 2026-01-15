'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReviewForm from '@/components/products/ReviewForm';
import OrderStatusTimeline from '@/components/orders/OrderStatusTimeline';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [reviewingProduct, setReviewingProduct] = useState(null); // Product being reviewed
  const [existingReviews, setExistingReviews] = useState({}); // Map of productId -> review
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

  // Check existing reviews when orders are loaded
  useEffect(() => {
    if (orders.length > 0) {
      checkExistingReviews();
    }
  }, [orders]);

  /**
   * Check which products user has already reviewed
   * This determines whether to show "Write Review" or "Edit Review"
   */
  const checkExistingReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || orders.length === 0) return;

      // Get all unique product IDs from delivered orders
      const deliveredOrders = orders.filter(order => order.status === 'delivered');
      const productIds = [...new Set(
        deliveredOrders.flatMap(order => 
          order.items?.map(item => item.productId?._id || item.productId) || []
        )
      )];

      if (productIds.length === 0) return;

      // Check review status for each product
      const reviewChecks = await Promise.all(
        productIds.map(async (productId) => {
          const response = await fetch(`/api/reviews/user-review?productId=${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          return { productId, review: data.review };
        })
      );

      // Convert to map for easy lookup
      const reviewsMap = {};
      reviewChecks.forEach(({ productId, review }) => {
        if (review) {
          reviewsMap[productId] = review;
        }
      });

      setExistingReviews(reviewsMap);
    } catch (err) {
      console.error('Error checking existing reviews:', err);
    }
  };

  /**
   * Open review modal for a product
   */
  const handleReviewProduct = (product) => {
    setReviewingProduct(product);
  };

  /**
   * Close review modal
   */
  const handleCloseReviewModal = () => {
    setReviewingProduct(null);
  };

  /**
   * Handle successful review submission
   */
  const handleReviewSubmitted = () => {
    // Refresh existing reviews to update button state
    checkExistingReviews();
    // Close modal
    handleCloseReviewModal();
  };

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
        <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
          <h3 className="font-bold text-lg mb-4">
            Order Details #{selectedOrder._id}
          </h3>
          
          {/* Order Status Timeline */}
          <div className="mb-6">
            <h4 className="font-semibold text-md mb-3">Order Status</h4>
            <OrderStatusTimeline 
              statusHistory={selectedOrder.statusHistory || []}
              currentStatus={selectedOrder.status}
              estimatedDelivery={selectedOrder.estimatedDelivery}
              showAdminInfo={false}
            />
          </div>

          {/* Tracking Information */}
          {selectedOrder.trackingUrl && (
            <>
              <div className="divider"></div>
              <div className="bg-primary/10 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-md mb-3">📦 Shipping Information</h4>
                <div className="space-y-2">
                  {selectedOrder.carrier && (
                    <p className="text-sm">
                      <span className="font-semibold">Carrier:</span> {selectedOrder.carrier}
                    </p>
                  )}
                  <p className="text-sm">
                    <a 
                      href={selectedOrder.trackingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="link link-primary"
                    >
                      Track Your Package ↗
                    </a>
                  </p>
                  {selectedOrder.estimatedDelivery && (
                    <p className="text-sm">
                      <span className="font-semibold">Estimated Delivery:</span>{' '}
                      {new Date(selectedOrder.estimatedDelivery).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="divider"></div>

          {/* Order Items */}
          <h4 className="font-semibold text-md mb-3">Items</h4>
          <div className="space-y-4">
            {selectedOrder.items.map((item) => {
              const productId = item.productId._id || item.productId;
              const existingReview = existingReviews[productId];
              const isDelivered = selectedOrder.status === 'delivered';
              
              // Get image URL with proper fallback
              const getImageUrl = () => {
                if (item.productId?.images?.[0]) {
                  // Check if it's an object with url property or just a string
                  const img = item.productId.images[0];
                  return typeof img === 'string' ? img : img.url;
                }
                // Fallback placeholder
                return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
              };

              return (
                <div key={item._id} className="flex gap-4 items-center border-b pb-4">
                  <Image
                    src={getImageUrl()}
                    alt={item.productId?.name || 'Product'}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.productId?.name || 'Unknown Product'}</h3>
                    <p className="text-sm opacity-70">Quantity: {item.quantity}</p>
                    <p className="font-semibold">${item.price?.toFixed(2) || '0.00'}</p>
                    
                    {/* Review Button - Only for delivered orders */}
                    {isDelivered && (
                      <button
                        className={`btn btn-sm mt-2 ${existingReview ? 'btn-outline' : 'btn-primary'}`}
                        onClick={() => handleReviewProduct(item.productId)}
                      >
                        {existingReview ? '✏️ Edit Review' : '⭐ Write Review'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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

          {/* Shipping Address */}
          {selectedOrder.shippingAddress && (
            <>
              <div className="divider"></div>
              <div className="bg-base-200 p-4 rounded-lg">
                <h4 className="font-semibold text-md mb-2">📍 Shipping Address</h4>
                <p className="text-sm">{selectedOrder.shippingAddress.fullName}</p>
                <p className="text-sm">{selectedOrder.shippingAddress.street}</p>
                <p className="text-sm">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                </p>
                <p className="text-sm">{selectedOrder.shippingAddress.country}</p>
                {selectedOrder.shippingAddress.phone && (
                  <p className="text-sm mt-2">
                    <span className="font-semibold">Phone:</span> {selectedOrder.shippingAddress.phone}
                  </p>
                )}
              </div>
            </>
          )}

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
      
      {/* Review Modal */}
      {reviewingProduct && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={handleCloseReviewModal}
            >
              ✕
            </button>
            
            <h3 className="font-bold text-lg mb-4">
              {existingReviews[reviewingProduct._id] ? 'Edit Review' : 'Write Review'}
            </h3>
            
            {/* Product Info */}
            <div className="flex gap-4 items-center mb-6 p-4 bg-base-200 rounded-lg">
              {reviewingProduct.images && reviewingProduct.images[0] && (
                <Image
                  src={reviewingProduct.images[0].url || reviewingProduct.images[0]}
                  alt={reviewingProduct.name}
                  width={60}
                  height={60}
                  className="rounded object-cover"
                />
              )}
              <div>
                <h4 className="font-semibold">{reviewingProduct.name}</h4>
                <p className="text-sm opacity-70">${reviewingProduct.price}</p>
              </div>
            </div>

            {/* Review Form */}
            <ReviewForm
              productId={reviewingProduct._id}
              existingReview={existingReviews[reviewingProduct._id]}
              mode={existingReviews[reviewingProduct._id] ? 'edit' : 'create'}
              onReviewSubmitted={handleReviewSubmitted}
            />
          </div>
          <form method="dialog" className="modal-backdrop" onClick={handleCloseReviewModal}>
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
