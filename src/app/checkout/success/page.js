'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/store/cartStore';
import Link from 'next/link';

export default function SuccessPage() {
  const [status, setStatus] = useState('loading');
  const [orderDetails, setOrderDetails] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    async function verifyPayment(retries = 3) {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(`/api/payment/verify?session_id=${sessionId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error);
          }

          setOrderDetails(data);
          setStatus('success');
          
          if (typeof clearCart === 'function') {
            try {
              clearCart();
            } catch (err) {
              console.warn('Failed to clear cart:', err);
            }
          }
          
          return;
        } catch (err) {
          console.error('Payment verification attempt failed:', err);
          if (i === retries - 1) {
            setStatus('error');
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }
    }

    verifyPayment();
  }, [sessionId, clearCart]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="mt-4 text-lg">Verifying your payment...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 space-y-4">
        <div className="text-error text-5xl">⚠️</div>
        <h1 className="text-2xl font-bold text-error">Payment Verification Failed</h1>
        <p className="text-gray-600">We couldn't verify your payment. Please contact support if you believe this is an error.</p>
        <div className="flex gap-4 mt-4">
          <Link href="/cart" className="btn btn-primary">
            Return to Cart
          </Link>
          <Link href="/contact" className="btn btn-outline">
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="text-success text-5xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-success mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Thank you for your order.</p>
          </div>

          {orderDetails && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono">{orderDetails.orderId}</span>
              </div>
              
              <div className="divider"></div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Order Summary</h3>
                {orderDetails.items?.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="divider"></div>
              
              <div className="flex justify-between font-bold">
                <span>Total Paid</span>
                <span>${orderDetails.total?.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 mt-8">
            <Link href="/orders" className="btn btn-primary">
              View Order Details
            </Link>
            <Link href="/products" className="btn btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}