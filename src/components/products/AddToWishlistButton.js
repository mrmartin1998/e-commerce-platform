"use client";

import { useWishlist } from '@/store/wishlistStore';
import { useToast } from '@/components/ui/Toast';
import { useState, useEffect } from 'react';

export default function AddToWishlistButton({ productId, className = "" }) {
  const { addToWishlist, removeFromWishlist, isInWishlist, loading } = useWishlist();
  const { showToast } = useToast();
  const [inWishlist, setInWishlist] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setInWishlist(isInWishlist(productId));
  }, [productId, isInWishlist]);

  const handleToggleWishlist = async (e) => {
    e.preventDefault(); // Prevent navigation if button is in a Link
    e.stopPropagation(); // Prevent event bubbling
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please login to add items to wishlist', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(productId);
        showToast('Removed from wishlist', 'success');
        setInWishlist(false);
      } else {
        await addToWishlist(productId);
        showToast('Added to wishlist!', 'success');
        setInWishlist(true);
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={loading || isProcessing}
      className={`btn btn-circle btn-ghost ${className} ${isProcessing ? 'loading' : ''}`}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {!isProcessing && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill={inWishlist ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  );
}
