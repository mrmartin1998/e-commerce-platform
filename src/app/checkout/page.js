'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!items?.length) {
      router.push('/cart');
    }
  }, [items, router]);

  const subtotal = items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const shipping = 10; // Fixed shipping cost
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate cart items
      if (!items?.length) {
        throw new Error('Your cart is empty');
      }

      // Create checkout session
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items,
          shipping
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.url) {
        throw new Error('Invalid checkout session response');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!items?.length) {
    return <div className="flex justify-center p-8">Redirecting to cart...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Order Summary</h2>
              <div className="divider"></div>
              
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 relative">
                      <Image
                        src={item.image || '/images/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-sm">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              
              <div className="divider"></div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="card bg-base-100 shadow-xl h-fit">
          <div className="card-body">
            <h2 className="card-title">Payment</h2>
            <div className="divider"></div>
            {error && (
              <div className="alert alert-error mb-4">
                {error}
              </div>
            )}
            <button 
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}