'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getRecentlyViewed, clearRecentlyViewed } from '@/lib/utils/recentlyViewed';

export default function RecentlyViewed({ 
  title = "Recently Viewed", 
  limit = 10,
  excludeIds = [],
  showClearButton = false 
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const recentProducts = getRecentlyViewed();
        
        // Filter out excluded IDs
        const excludeArray = Array.isArray(excludeIds) ? excludeIds : [excludeIds];
        const filtered = recentProducts.filter(p => !excludeArray.includes(p._id));
        
        // Apply limit
        const limited = filtered.slice(0, limit);
        
        setProducts(limited);
      } catch (error) {
        console.error('Error loading recently viewed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRecentlyViewed();
  }, [limit]); // Only depend on limit, not excludeIds array

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your viewing history?')) {
      clearRecentlyViewed();
      setProducts([]);
    }
  };

  // Don't render if no products
  if (!loading && products.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 border-t">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {showClearButton && products.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="btn btn-sm md:btn-md btn-ghost min-h-[44px]"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Product Grid - 2 Columns on Mobile, More on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

/**
 * Simplified ProductCard for Recently Viewed
 * Displays minimal product info with image, name, and price
 */
function ProductCard({ product }) {
  return (
    <Link 
      href={`/products/${product._id}`}
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow group"
    >
      <figure className="relative h-48 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 200px, (max-width: 1200px) 33vw, 20vw"
          loading="lazy"
        />
      </figure>
      <div className="card-body p-4">
        <h3 className="card-title text-sm line-clamp-2">{product.name}</h3>
        <p className="text-primary font-bold">${product.price}</p>
        {product.category && (
          <p className="text-xs text-base-content/60">{product.category}</p>
        )}
      </div>
    </Link>
  );
}
