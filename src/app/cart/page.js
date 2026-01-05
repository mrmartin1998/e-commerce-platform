"use client";

import { useCart } from '@/store/cartStore';
import Link from 'next/link';
import CartItem from '@/components/cart/CartItem';
import { useEffect } from 'react';

export default function CartPage() {
  const { items, loading, fetchCart, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 10; // Fixed shipping cost
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="skeleton h-8 w-32 mb-8"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-20 w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-base-content/70 mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link href="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-base-100 rounded-lg shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Items ({items.length})
              </h2>
              <div className="space-y-0">
                {items.map((item) => (
                  <CartItem
                    key={item.productId}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-base-100 rounded-lg shadow-lg p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="divider"></div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            
            <Link 
              href="/checkout" 
              className="btn btn-primary w-full mt-6"
            >
              Proceed to Checkout
            </Link>
            
            <Link 
              href="/products" 
              className="btn btn-ghost w-full mt-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}