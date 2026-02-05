"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import ProductCard from '@/components/products/ProductCard';
import ProductListItem from '@/components/products/ProductListItem';
import SearchBar from '@/components/products/SearchBar';
import ProductFilters from '@/components/products/ProductFilters';
import Pagination from '@/components/products/Pagination';
import { 
  ProductCardSkeleton, 
  ProductListSkeleton, 
  LoadingSpinner,
  EmptyState,
  ErrorState 
} from '@/components/ui/SkeletonLoader';

export default function ProductsPage() {
  const [viewType, setViewType] = useState('grid');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ current: 1, total: 1, hasMore: false });

  // Memoized fetch function to prevent infinite re-renders
  const fetchProducts = useCallback(async (search = '', currentFilters = {}, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (currentFilters.category) params.set('category', currentFilters.category);
      if (currentFilters.minPrice) params.set('minPrice', currentFilters.minPrice);
      if (currentFilters.maxPrice) params.set('maxPrice', currentFilters.maxPrice);
      if (currentFilters.sortBy) params.set('sortBy', currentFilters.sortBy);
      if (currentFilters.sortOrder) params.set('sortOrder', currentFilters.sortOrder);
      params.set('page', page.toString());

      const token = localStorage.getItem('token');
      const headers = {};
      if (token && token !== 'null' && token.length > 10) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`/api/products?${params.toString()}`, { headers });
      
      if (!res.ok) throw new Error('Failed to fetch products');
      
      const data = await res.json();
      setProducts(data.products || []);
      setPagination(data.pagination || { current: 1, total: 1, hasMore: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array - function is stable

  // Initial load only - no dependencies to cause re-renders
  useEffect(() => {
    fetchProducts();
  }, []); // Only run on mount

  // Handle search - memoized to prevent re-renders
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    fetchProducts(term, filters, 1);
  }, [fetchProducts, filters]);

  // Handle filter changes - memoized to prevent re-renders
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    fetchProducts(searchTerm, newFilters, 1);
  }, [fetchProducts, searchTerm]);

  // Handle page changes - memoized to prevent re-renders
  const handlePageChange = useCallback((page) => {
    fetchProducts(searchTerm, filters, page);
  }, [fetchProducts, searchTerm, filters]);

  // Retry fetching products in case of error
  const retryFetch = () => {
    fetchProducts(searchTerm, filters, pagination.current);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content - Shows FIRST on mobile */}
        <div className="lg:w-3/4 space-y-6 order-2 lg:order-2">
          {/* Header with Search and View Toggle */}
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-center sm:text-left">Our Products</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex-1">
                <Suspense fallback={
                  <div className="input input-bordered w-full h-12 animate-pulse bg-base-200"></div>
                }>
                  <SearchBar onSearch={handleSearch} isLoading={loading} />
                </Suspense>
              </div>
              <div className="join self-center sm:self-auto">
                <button 
                  className={`btn join-item min-h-[44px] min-w-[64px] ${viewType === 'grid' ? 'btn-active' : ''}`}
                  onClick={() => setViewType('grid')}
                  aria-label="Grid view"
                  disabled={loading}
                >
                  Grid
                </button>
                <button 
                  className={`btn join-item min-h-[44px] min-w-[64px] ${viewType === 'list' ? 'btn-active' : ''}`}
                  onClick={() => setViewType('list')}
                  aria-label="List view"
                  disabled={loading}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && !loading && (
            <ErrorState 
              title="Failed to Load Products"
              message={error}
              onRetry={retryFetch}
            />
          )}

          {/* Loading State with Skeletons */}
          {loading && (
            <>
              {viewType === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProductListSkeleton key={i} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Products Display */}
          {!loading && !error && (
            <>
              {products?.length > 0 ? (
                <>
                  {viewType === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {products.map((product) => (
                        <ProductListItem key={product._id} product={product} />
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  <Pagination 
                    pagination={pagination} 
                    onPageChange={handlePageChange} 
                    isLoading={loading} 
                  />
                </>
              ) : (
                <EmptyState 
                  icon="🔍"
                  title="No products found"
                  message={searchTerm ? `No products match "${searchTerm}"` : "No products available at the moment"}
                  actionText={searchTerm ? "Clear Search" : "Refresh"}
                  onAction={searchTerm ? () => handleSearch('') : retryFetch}
                />
              )}
            </>
          )}
        </div>

        {/* Sidebar Filters - Shows AFTER products on mobile, before on desktop */}
        <div className="lg:w-1/4 order-1 lg:order-1">
          <div className="collapse lg:collapse-open collapse-arrow bg-base-100 lg:bg-transparent border lg:border-0 border-base-300 rounded-lg lg:rounded-none">
            <input type="checkbox" defaultChecked={false} className="lg:hidden" />
            <div className="collapse-title text-lg font-medium lg:hidden min-h-[56px] flex items-center">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                </svg>
                Filters & Sort
              </span>
            </div>
            <div className="collapse-content lg:p-0 px-4 pb-4">
              <ProductFilters onFilterChange={handleFilterChange} isLoading={loading} isMobileCollapse={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}