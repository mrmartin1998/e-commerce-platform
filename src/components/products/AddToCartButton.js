"use client";

import { useCart } from '@/store/cartStore';
import { useToast } from '@/components/ui/Toast';
import { useState } from 'react';

export default function AddToCartButton({ productId }) {
  const { addToCart, loading } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    try {
      await addToCart(productId, quantity);
      showToast('Added to cart!', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="join">
        <button 
          className="btn btn-sm join-item"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
        >
          -
        </button>
        <input 
          type="number" 
          className="input input-bordered input-sm w-20 join-item text-center"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          min="1"
        />
        <button 
          className="btn btn-sm join-item"
          onClick={() => setQuantity(quantity + 1)}
        >
          +
        </button>
      </div>
      <button 
        className={`btn btn-primary ${loading ? 'loading' : ''}`}
        onClick={handleAddToCart}
        disabled={loading}
      >
        Add to Cart
      </button>
    </div>
  );
} 