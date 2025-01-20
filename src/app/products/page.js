"use client";

import { useState, useEffect } from 'react';
import ProductCard from '@/components/products/ProductCard';
import ProductListItem from '@/components/products/ProductListItem';

async function getProducts() {
  const res = await fetch('/api/products', {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export default function ProductsPage() {
  const [viewType, setViewType] = useState('grid');
  const [products, setProducts] = useState([]);

  // Use React Query or useEffect to fetch products
  useEffect(() => {
    getProducts().then(data => setProducts(data.products));
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Our Products</h1>
        <div className="join self-end sm:self-auto">
          <button 
            className={`btn join-item btn-sm ${viewType === 'grid' ? 'btn-active' : ''}`}
            onClick={() => setViewType('grid')}
            aria-label="Grid view"
          >
            Grid
          </button>
          <button 
            className={`btn join-item btn-sm ${viewType === 'list' ? 'btn-active' : ''}`}
            onClick={() => setViewType('list')}
            aria-label="List view"
          >
            List
          </button>
        </div>
      </div>

      {viewType === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {products?.map((product) => (
            <ProductListItem key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
} 