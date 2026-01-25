"use client";

import { useWishlist } from '@/store/wishlistStore';
import { useEffect } from 'react';
import Link from 'next/link';

export default function WishlistIcon() {
  const { items, fetchWishlist } = useWishlist();

  useEffect(() => {
    // Fetch wishlist on mount
    const token = localStorage.getItem('token');
    if (token) {
      fetchWishlist();
    }
  }, [fetchWishlist]);

  const itemCount = items.length;

  return (
    <Link href="/wishlist" className="indicator">
      Wishlist
      {itemCount > 0 && (
        <span className="badge badge-sm badge-primary indicator-item">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
