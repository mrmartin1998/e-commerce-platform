/**
 * User Order Detail Page
 * 
 * This page shows customers the complete details of their order including:
 * - Order status timeline (visual progress tracking)
 * - Shipping/tracking information
 * - Ordered items with images
 * - Price breakdown
 * - Shipping address
 * 
 * Educational Notes:
 * - Uses Next.js App Router with dynamic route [id]
 * - Fetches order data from /api/orders/[id] endpoint
 * - Integrates OrderStatusTimeline component for visual tracking
 * - Conditionally displays tracking info when available
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import OrderStatusTimeline from '@/components/orders/OrderStatusTimeline';

export default function OrderDetails({ params }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchOrder() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch the order with populated relationships
        // The API will return statusHistory with updatedBy populated
        const res = await fetch(`/api/orders/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch order');
        }
        
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        // Set the order with all its data including statusHistory
        setOrder(data.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [params.id, router]);

  if (loading) return <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="text-error text-center p-8">{error}</div>;
  if (!order) return <div className="text-center p-8">Order not found</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Order Details</h1>
      
      {/* Main Order Card */}
      <div className="card bg-base-200 mb-6">
        <div className="card-body">
          {/* Order Header */}
          <div className="flex justify-between mb-4">
            <div>
              <h2 className="text-xl">Order #{order._id}</h2>
              <p className="text-sm opacity-70">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              {/* Status badge with color coding based on order status */}
              <div className={`badge ${
                order.status === 'delivered' ? 'badge-success' :
                order.status === 'shipped' ? 'badge-primary' :
                order.status === 'processing' ? 'badge-info' :
                order.status === 'cancelled' ? 'badge-error' :
                'badge-warning'
              }`}>
                {order.status}
              </div>
            </div>
          </div>

          <div className="divider"></div>

          {/* 
            Order Status Timeline Component
            
            This is the component we created in Task 2. It shows:
            - Visual timeline of all status changes
            - When each status change happened
            - Current status highlighted with animation
            - Next steps for the customer
            
            We pass:
            - statusHistory: Array of all status changes from the Order model
            - currentStatus: The current order status
            - estimatedDelivery: When the order is expected to arrive (optional)
            - showAdminInfo: false (customers don't need to see which admin made changes)
          */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-4">Order Status</h3>
            <OrderStatusTimeline 
              statusHistory={order.statusHistory}
              currentStatus={order.status}
              estimatedDelivery={order.estimatedDelivery}
              showAdminInfo={false}
            />
          </div>

          {/* 
            Tracking Information Section
            
            This section only displays if the order has been shipped and has tracking info.
            
            Conditional rendering explained:
            - {condition && <JSX>} means "if condition is true, render the JSX"
            - If order.trackingUrl exists (is not null/undefined), show this section
            - This is called "short-circuit evaluation" in JavaScript
            
            Why this matters:
            - Pending/processing orders don't have tracking yet
            - Only show tracking section when it's relevant
            - Cleaner UI without empty sections
          */}
          {order.trackingUrl && (
            <>
              <div className="divider"></div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">📦 Shipping Information</h3>
                <div className="space-y-2">
                  {/* Carrier name if available */}
                  {order.carrier && (
                    <p className="text-sm">
                      <span className="font-semibold">Carrier:</span> {order.carrier}
                    </p>
                  )}
                  
                  {/* 
                    Tracking link
                    
                    - target="_blank": Opens link in new tab
                    - rel="noopener noreferrer": Security best practice when using target="_blank"
                      * noopener: Prevents the new page from accessing window.opener
                      * noreferrer: Prevents sending referer header to tracking site
                    
                    Why external link icon (↗):
                    - Visual indicator that link goes to another website
                    - Standard UX pattern users recognize
                  */}
                  <p className="text-sm">
                    <span className="font-semibold">Tracking Number:</span>{' '}
                    <a 
                      href={order.trackingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="link link-primary"
                    >
                      Track Package ↗
                    </a>
                  </p>
                  
                  {/* Estimated delivery date if available */}
                  {order.estimatedDelivery && (
                    <p className="text-sm">
                      <span className="font-semibold">Estimated Delivery:</span>{' '}
                      {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
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

          {/* Order Items List */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Items Ordered</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex gap-4 items-center">
                  {/* Product image with fallback */}
                  {item.productId.images?.[0] ? (
                    <Image
                      src={item.productId.images[0]}
                      alt={item.productId.name}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-base-300 rounded-lg flex items-center justify-center">
                      <span className="text-sm opacity-50">No image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.productId.name}</h3>
                    <p className="text-sm opacity-70">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="divider"></div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${order.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="divider"></div>

          <div>
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <address className="not-italic">
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
              {order.shippingAddress.country}
            </address>
          </div>
        </div>
      </div>
    </div>
  );
} 