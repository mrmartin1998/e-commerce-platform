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
            className="btn btn-sm btn-ghost"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Product Grid - Horizontal Scroll on Mobile, Grid on Desktop */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
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
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow min-w-[200px] md:min-w-0 group"
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
