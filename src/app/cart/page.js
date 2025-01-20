"use client";

import { useEffect } from 'react';
import { useCart } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, loading, error, fetchCart, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center p-8 text-error">{error}</div>;
  }

  if (!items?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Link href="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="card card-compact sm:card-side bg-base-100 shadow-xl">
              <figure className="w-full sm:w-48 h-48 sm:h-full relative">
                <Image
                  src={item.image || '/images/placeholder.png'}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 192px"
                />
              </figure>
              <div className="card-body">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h2 className="card-title">{item.name}</h2>
                    <p className="text-lg font-bold">${item.price}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="join">
                      <button 
                        className="btn btn-sm join-item"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >-</button>
                      <span className="btn btn-sm join-item no-animation pointer-events-none">
                        {item.quantity}
                      </span>
                      <button 
                        className="btn btn-sm join-item"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >+</button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.productId)}
                      className="btn btn-ghost btn-sm"
                      aria-label="Remove item"
                    >×</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card bg-base-100 shadow-xl h-fit">
          <div className="card-body">
            <h2 className="card-title">Order Summary</h2>
            <div className="py-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </div>
            </div>
            <div className="card-actions">
              <Link 
                href="/checkout" 
                className="btn btn-primary btn-block"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 