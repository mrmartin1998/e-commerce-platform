"use client";

import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';

export default function CartDropdown({ isOpen, onClose }) {
  const { items, loading, error, removeItem, updateQuantity } = useCartStore();

  const subtotal = items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );

  if (!isOpen) return null;

  return (
    <div className="dropdown-content z-[1] menu p-4 shadow bg-base-100 rounded-box w-80 absolute right-0 top-full mt-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Cart ({items.length})</h3>
        <button onClick={onClose} className="btn btn-ghost btn-sm">×</button>
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <span className="loading loading-spinner"></span>
        </div>
      ) : error ? (
        <div className="text-error text-center p-4">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-center p-4">Your cart is empty</div>
      ) : (
        <>
          <div className="max-h-96 overflow-auto space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 items-center">
                <div className="relative w-16 h-16">
                  <Image
                    src={item.image || '/images/placeholder.png'}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm">${item.price}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button 
                      className="btn btn-xs"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >-</button>
                    <span>{item.quantity}</span>
                    <button 
                      className="btn btn-xs"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >+</button>
                  </div>
                </div>
                <button 
                  onClick={() => removeItem(item.productId)}
                  className="btn btn-ghost btn-sm"
                >×</button>
              </div>
            ))}
          </div>

          <div className="divider"></div>
          
          <div className="space-y-4">
            <div className="flex justify-between font-bold">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <Link 
              href="/checkout" 
              className="btn btn-primary w-full"
              onClick={onClose}
            >
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
} 