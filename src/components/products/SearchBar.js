"use client";

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar({ onSearch, isLoading }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  // Proper debounced search without causing re-renders
  const debouncedSearch = useCallback((term) => {
    const timer = setTimeout(() => {
      onSearch(term);
      
      // Update URL with search parameter
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set('q', term);
      } else {
        params.delete('q');
      }
      
      // Update URL without page refresh
      const newUrl = params.toString() ? `?${params.toString()}` : '/products';
      router.replace(newUrl, { scroll: false });
    }, 300);

    return timer;
  }, [onSearch, router, searchParams]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear previous timeout and set new one
    const timer = debouncedSearch(value);
    return () => clearTimeout(timer);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    router.replace('/products', { scroll: false });
  };

  return (
    <div className="relative">
      <div className="form-control">
        <div className="input-group">
          <input
            type="text"
            placeholder="Search products..."
            className="input input-bordered flex-1"
            value={searchTerm}
            onChange={handleInputChange}
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="btn btn-ghost btn-sm"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
          <div className="btn btn-square">
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
