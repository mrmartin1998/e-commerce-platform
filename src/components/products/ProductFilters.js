"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ProductFiltersContent({ onFilterChange, isLoading, isMobileCollapse = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        setCategoriesLoading(true);
        const response = await fetch('/api/categories'); // Change from /api/admin/categories
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Only show active categories with products
        const activeCategories = data.categories.filter(cat => 
          cat.isActive && (cat.metadata?.productCount > 0)
        );
        setCategories(activeCategories);
      } catch (err) {
        console.error('Categories fetch error:', err);
        // Fall back to default categories if API fails
        setCategories([
          { slug: 'electronics', name: 'Electronics' },
          { slug: 'clothing', name: 'Clothing' },
          { slug: 'books', name: 'Books' },
          { slug: 'home', name: 'Home & Kitchen' }
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    }

    fetchCategories();
  }, []);

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

  // Build hierarchical category options
  const buildCategoryOptions = () => {
    const topLevel = categories.filter(cat => !cat.parentCategory);
    const children = categories.filter(cat => cat.parentCategory);
    
    const options = [];
    
    topLevel.forEach(parent => {
      options.push(parent);
      
      // Add children
      const parentChildren = children.filter(child => 
        child.parentCategory?._id === parent._id
      );
      parentChildren.forEach(child => {
        options.push({ ...child, isChild: true });
      });
    });
    
    return options;
  };

  return (
    <div className={isMobileCollapse ? "space-y-4 w-full" : "card bg-base-100 shadow-xl"}>
      <div className={isMobileCollapse ? "space-y-4 w-full" : "card-body"}>
        {!isMobileCollapse && <h2 className="card-title">Filters</h2>}
        
        {/* Category Filter */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Category</span>
          </label>
          {categoriesLoading ? (
            <div className="skeleton h-12 w-full"></div>
          ) : (
            <select 
              className="select select-bordered min-h-[48px] w-full"
              value={filters.category}
              onChange={(e) => handleFilterChange({ category: e.target.value })}
              disabled={isLoading}
            >
              <option value="">All Categories</option>
              {buildCategoryOptions().map((category) => (
                <option key={category._id || category.slug} value={category.slug}>
                  {category.isChild ? '  ↳ ' : ''}{category.name}
                  {category.metadata?.icon && ` ${category.metadata.icon}`}
                  {category.metadata?.productCount && ` (${category.metadata.productCount})`}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Price Range */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Price Range</span>
          </label>
          <div className="flex gap-2 w-full">
            <input
              type="number"
              placeholder="Min"
              className="input input-bordered min-h-[44px] flex-1 w-0"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange({ minPrice: e.target.value })}
              disabled={isLoading}
            />
            <input
              type="number"
              placeholder="Max"
              className="input input-bordered min-h-[44px] flex-1 w-0"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange({ maxPrice: e.target.value })}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Sort By</span>
          </label>
          <select 
            className="select select-bordered min-h-[48px] w-full"
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
          className="btn btn-ghost btn-sm md:btn-md mt-4 min-h-[44px] w-full"
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

export default function ProductFilters({ onFilterChange, isLoading, isMobileCollapse = false }) {
  return (
    <Suspense fallback={
      <div className={isMobileCollapse ? "space-y-4" : "card bg-base-100 shadow-xl"}>
        <div className={isMobileCollapse ? "space-y-4" : "card-body"}>
          <div className="skeleton h-8 w-24 mb-4"></div>
          <div className="skeleton h-12 w-full mb-4"></div>
          <div className="skeleton h-12 w-full mb-4"></div>
          <div className="skeleton h-12 w-full"></div>
        </div>
      </div>
    }>
      <ProductFiltersContent onFilterChange={onFilterChange} isLoading={isLoading} isMobileCollapse={isMobileCollapse} />
    </Suspense>
  );
}

