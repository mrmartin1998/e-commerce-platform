"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ProductFiltersContent({ onFilterChange, isLoading }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Initialize from URL params
  useEffect(() => {
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    setFilters({ category, minPrice, maxPrice, sortBy, sortOrder });
  }, [searchParams]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Update URL
    const params = new URLSearchParams(searchParams);
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    router.replace(`/products?${params.toString()}`, { scroll: false });
    
    // Notify parent
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Filters</h2>
        
        {/* Category Filter */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Category</span>
          </label>
          <select 
            className="select select-bordered"
            value={filters.category}
            onChange={(e) => handleFilterChange({ category: e.target.value })}
            disabled={isLoading}
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
            <option value="home">Home & Garden</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Price Range</span>
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              className="input input-bordered input-sm flex-1"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange({ minPrice: e.target.value })}
              disabled={isLoading}
            />
            <input
              type="number"
              placeholder="Max"
              className="input input-bordered input-sm flex-1"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange({ maxPrice: e.target.value })}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Sort By</span>
          </label>
          <select 
            className="select select-bordered"
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleFilterChange({ sortBy, sortOrder });
            }}
            disabled={isLoading}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        {/* Clear Filters */}
        <button 
          className="btn btn-ghost btn-sm mt-4"
          onClick={() => handleFilterChange({
            category: '',
            minPrice: '',
            maxPrice: '',
            sortBy: 'createdAt',
            sortOrder: 'desc'
          })}
          disabled={isLoading}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

export default function ProductFilters({ onFilterChange, isLoading }) {
  return (
    <Suspense fallback={
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="skeleton h-8 w-24 mb-4"></div>
          <div className="skeleton h-12 w-full mb-4"></div>
          <div className="skeleton h-12 w-full mb-4"></div>
          <div className="skeleton h-12 w-full"></div>
        </div>
      </div>
    }>
      <ProductFiltersContent onFilterChange={onFilterChange} isLoading={isLoading} />
    </Suspense>
  );
}

