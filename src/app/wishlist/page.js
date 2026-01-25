"use client";

import { useEffect, useState } from 'react';
import { useWishlist } from '@/store/wishlistStore';
import { useCart } from '@/store/cartStore';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const router = useRouter();
  const { items, loading, fetchWishlist, removeFromWishlist, clearWishlist, moveToCart } = useWishlist();
  const { showToast } = useToast();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [processingItem, setProcessingItem] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchWishlist();
  }, [fetchWishlist, router]);

  const handleRemove = async (productId, productName) => {
    setProcessingItem(productId);
    try {
      await removeFromWishlist(productId);
      showToast(`${productName} removed from wishlist`, 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setProcessingItem(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearWishlist();
      showToast('Wishlist cleared', 'success');
      setShowClearDialog(false);
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleMoveToCart = async (productId, productName) => {
    setProcessingItem(productId);
    try {
      await moveToCart(productId);
      showToast(`${productName} moved to cart`, 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setProcessingItem(null);
    }
  };

  // Loading state
  if (loading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="skeleton h-8 w-48 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-xl">
              <div className="skeleton h-48 w-full"></div>
              <div className="card-body">
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 mx-auto text-base-content/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h1 className="text-3xl font-bold">Your Wishlist is Empty</h1>
          <p className="text-base-content/70">
            Save items you love so you can easily find them later!
          </p>
          <Link href="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            My Wishlist
          </h1>
          <p className="text-base-content/70 mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>
        
        {items.length > 0 && (
          <button
            onClick={() => setShowClearDialog(true)}
            className="btn btn-outline btn-error btn-sm"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.productId} className="card bg-base-100 shadow-xl">
            <figure className="relative h-48">
              <Link href={`/products/${item.productId}`}>
                <Image
                  src={item.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzM3NDE1MSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMjAwIiBzdHlsZT0iZmlsbDojOWNhM2FmO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjI1cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </Link>
              
              {/* Remove button */}
              <button
                onClick={() => handleRemove(item.productId, item.name)}
                disabled={processingItem === item.productId}
                className="btn btn-circle btn-sm btn-ghost absolute top-2 right-2 bg-base-100/80"
                aria-label="Remove from wishlist"
              >
                ✕
              </button>

              {/* Out of stock badge */}
              {!item.isAvailable && (
                <div className="badge badge-error absolute top-2 left-2">
                  {item.stock === 0 ? 'Out of Stock' : 'Unavailable'}
                </div>
              )}
            </figure>
            
            <div className="card-body">
              <Link href={`/products/${item.productId}`}>
                <h2 className="card-title hover:text-primary transition-colors">
                  {item.name}
                </h2>
              </Link>
              
              <p className="text-2xl font-bold text-primary">${item.price}</p>
              
              {/* Rating */}
              {item.averageRating > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-yellow-500">★</span>
                  <span>{item.averageRating.toFixed(1)}</span>
                  <span className="text-base-content/70">({item.reviewCount})</span>
                </div>
              )}
              
              {/* Added date */}
              <p className="text-sm text-base-content/70">
                Added {new Date(item.addedAt).toLocaleDateString()}
              </p>
              
              <div className="card-actions justify-end mt-4">
                {item.isAvailable ? (
                  <button
                    onClick={() => handleMoveToCart(item.productId, item.name)}
                    disabled={processingItem === item.productId}
                    className={`btn btn-primary btn-sm flex-1 ${processingItem === item.productId ? 'loading' : ''}`}
                  >
                    {processingItem === item.productId ? '' : 'Move to Cart'}
                  </button>
                ) : (
                  <button className="btn btn-disabled btn-sm flex-1" disabled>
                    Unavailable
                  </button>
                )}
                
                <Link 
                  href={`/products/${item.productId}`}
                  className="btn btn-outline btn-sm"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Clear All Confirmation Dialog */}
      {showClearDialog && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Clear Wishlist?</h3>
            <p className="py-4">
              Are you sure you want to remove all {items.length} items from your wishlist? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                onClick={() => setShowClearDialog(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="btn btn-error"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowClearDialog(false)}></div>
        </div>
      )}
    </div>
  );
}
