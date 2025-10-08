"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProductFilters({ onFilterChange, isLoading }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL parameters
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const [categories, setCategories] = useState([]);

  // Fetch available categories for filter dropdown
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/products/categories', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }

    fetchCategories();
  }, []);

  // Update URL and trigger filter change
  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    
    // Update URL parameters
    const params = new URLSearchParams(searchParams);
    
    // Preserve existing search query
    const currentQuery = searchParams.get('q');
    if (currentQuery) params.set('q', currentQuery);
    
    // Set filter parameters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    // Update URL
    const newUrl = params.toString() ? `?${params.toString()}` : '/products';
    router.replace(newUrl, { scroll: false });
    
    // Trigger filter change callback
    onFilterChange(newFilters);
  }, [searchParams, router, onFilterChange]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    updateFilters(newFilters);
  };

  const handlePriceRangeChange = (min, max) => {
    const newFilters = { 
      ...filters, 
      minPrice: min > 0 ? min.toString() : '',
      maxPrice: max < 1000 ? max.toString() : ''
    };
    updateFilters(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    updateFilters(clearedFilters);
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || 
    filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc';

  return (
    <div className="bg-base-100 rounded-box shadow-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="btn btn-ghost btn-sm"
            disabled={isLoading}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="divider my-2"></div>

      {/* Category Filter */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Category</span>
        </label>
        <select 
          className="select select-bordered select-sm"
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          disabled={isLoading}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Price Range</span>
        </label>
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              className="input input-bordered input-sm flex-1"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              min="0"
              disabled={isLoading}
            />
            <span className="text-sm opacity-60">to</span>
            <input
              type="number"
              placeholder="Max"
              className="input input-bordered input-sm flex-1"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              min="0"
              disabled={isLoading}
            />
          </div>
          
          {/* Quick price filters */}
          <div className="flex flex-wrap gap-1">
            <button 
              className="btn btn-outline btn-xs"
              onClick={() => handlePriceRangeChange(0, 25)}
              disabled={isLoading}
            >
              Under $25
            </button>
            <button 
              className="btn btn-outline btn-xs"
              onClick={() => handlePriceRangeChange(25, 50)}
              disabled={isLoading}
            >
              $25 - $50
            </button>
            <button 
              className="btn btn-outline btn-xs"
              onClick={() => handlePriceRangeChange(50, 100)}
              disabled={isLoading}
            >
              $50 - $100
            </button>
            <button 
              className="btn btn-outline btn-xs"
              onClick={() => handlePriceRangeChange(100, 1000)}
              disabled={isLoading}
            >
              Over $100
            </button>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Sort By</span>
        </label>
        <select 
          className="select select-bordered select-sm"
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            const newFilters = { ...filters, sortBy, sortOrder };
            updateFilters(newFilters);
          }}
          disabled={isLoading}
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
        </select>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <div className="divider my-2"></div>
          <span className="text-sm font-medium">Active Filters:</span>
          <div className="flex flex-wrap gap-1">
            {filters.category && (
              <span className="badge badge-primary gap-1">
                {filters.category}
                <button 
                  onClick={() => handleFilterChange('category', '')}
                  className="text-xs"
                  disabled={isLoading}
                >
                  ✕
                </button>
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="badge badge-primary gap-1">
                ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
                <button 
                  onClick={() => {
                    handleFilterChange('minPrice', '');
                    handleFilterChange('maxPrice', '');
                  }}
                  className="text-xs"
                  disabled={isLoading}
                >
                  ✕
                </button>
              </span>
            )}
            {(filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc') && (
              <span className="badge badge-primary gap-1">
                Sort: {filters.sortBy} ({filters.sortOrder})
                <button 
                  onClick={() => {
                    handleFilterChange('sortBy', 'createdAt');
                    handleFilterChange('sortOrder', 'desc');
                  }}
                  className="text-xs"
                  disabled={isLoading}
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

