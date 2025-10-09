"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import ProductCard from '@/components/products/ProductCard';
import ProductListItem from '@/components/products/ProductListItem';
import SearchBar from '@/components/products/SearchBar';
import ProductFilters from '@/components/products/ProductFilters';
import Pagination from '@/components/products/Pagination';

export default function ProductsPage() {
  const [viewType, setViewType] = useState('grid');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ current: 1, total: 1, hasMore: false });

  // Memoized fetch function to prevent infinite re-renders
  const fetchProducts = useCallback(async (search = '', currentFilters = {}, page = 1) => {
    setLoading(true);
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <div className="lg:w-1/4">
          <ProductFilters onFilterChange={handleFilterChange} isLoading={loading} />
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4 space-y-6">
          {/* Header with Search and View Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">Our Products</h1>
            <div className="flex items-center gap-4">
              <Suspense fallback={
                <div className="input input-bordered w-64 h-12 animate-pulse bg-base-200"></div>
              }>
                <SearchBar onSearch={handleSearch} isLoading={loading} />
              </Suspense>
              <div className="join">
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
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}

          {/* Products Grid/List */}
          {!loading && (
            <>
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

              {/* Empty State */}
              {products?.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-lg opacity-60">No products found</p>
                </div>
              )}

              {/* Pagination */}
              <Pagination 
                pagination={pagination} 
                onPageChange={handlePageChange} 
                isLoading={loading} 
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}