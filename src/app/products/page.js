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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Our Products</h1>
        <div className="join">
          <button 
            className={`btn join-item btn-sm ${viewType === 'grid' ? 'btn-active' : ''}`}
            onClick={() => setViewType('grid')}
          >
            Grid
          </button>
          <button 
            className={`btn join-item btn-sm ${viewType === 'list' ? 'btn-active' : ''}`}
            onClick={() => setViewType('list')}
          >
            List
          </button>
        </div>
      </div>

      {viewType === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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