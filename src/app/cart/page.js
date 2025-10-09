"use client";

import { useCart } from '@/store/cartStore';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartItemSkeleton, EmptyState, ErrorState, LoadingSpinner } from '@/components/ui/SkeletonLoader';

export default function CartPage() {
  const { items, loading, error, fetchCart, updateQuantity, removeItem, clearCart } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const retryFetch = () => {
    fetchCart();
  };

  if (error && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <ErrorState
          title="Cart Error"
          message={error}
          onRetry={retryFetch}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {loading ? (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CartItemSkeleton key={i} />
            ))}
          </div>
          <div className="bg-base-100 p-6 rounded-lg shadow-lg h-fit">
            <div className="skeleton h-6 w-32 mb-4"></div>
            <div className="skeleton h-4 w-full mb-2"></div>
            <div className="skeleton h-4 w-full mb-2"></div>
            <div className="skeleton h-4 w-full mb-4"></div>
            <div className="skeleton h-12 w-full"></div>
          </div>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          message="Looks like you haven't added anything to your cart yet"
          actionText="Start Shopping"
          onAction={() => window.location.href = '/products'}
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-base-100 rounded-lg shadow-lg">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Items ({items.length})</h2>
                  <button 
                    onClick={clearCart}
                    className="btn btn-ghost btn-sm text-error"
                    disabled={loading}
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
              
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.productId} className="p-6 flex gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={item.image || '/images/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <p className="text-primary font-semibold">${item.price}</p>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <button 
                            className="btn btn-outline btn-sm btn-circle"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1 || loading}
                          >
                            -
                          </button>
                          <span className="px-3 py-1 bg-base-200 rounded">{item.quantity}</span>
                          <button 
                            className="btn btn-outline btn-sm btn-circle"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={loading}
                          >
                            +
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeItem(item.productId)}
                          className="btn btn-ghost btn-sm text-error"
                          disabled={loading}
                        >
                          {loading ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            'Remove'
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-base-100 p-6 rounded-lg shadow-lg h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="divider my-2"></div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            
            <Link 
              href="/checkout" 
              className="btn btn-primary w-full mt-6"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Proceed to Checkout'
              )}
            </Link>
            
            <Link 
              href="/products" 
              className="btn btn-outline w-full mt-3"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}