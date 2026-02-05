"use client";

import { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SearchBarContent({ onSearch, isLoading }) {
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
    <div className="relative w-full">
      <div className="flex items-center gap-0 border border-base-300 rounded-lg overflow-hidden bg-base-100 focus-within:outline focus-within:outline-2 focus-within:outline-primary">
        <input
          type="text"
          placeholder="Search products..."
          className="input flex-1 border-0 focus:outline-none min-h-[44px] bg-transparent"
          value={searchTerm}
          onChange={handleInputChange}
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="btn btn-ghost btn-circle min-h-[44px] min-w-[44px] border-0"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        <button 
          className="btn btn-ghost btn-square min-h-[44px] min-w-[44px] border-0"
          type="button"
          aria-label="Search"
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default function SearchBar({ onSearch, isLoading }) {
  return (
    <Suspense fallback={
      <div className="relative w-full">
        <div className="flex items-center gap-0 border border-base-300 rounded-lg overflow-hidden bg-base-100">
          <input
            type="text"
            placeholder="Search products..."
            className="input flex-1 border-0 min-h-[44px] bg-transparent"
            disabled
          />
          <button 
            className="btn btn-ghost btn-square min-h-[44px] min-w-[44px] border-0"
            type="button"
            disabled
          >
            <span className="loading loading-spinner loading-sm"></span>
          </button>
        </div>
      </div>
    }>
      <SearchBarContent onSearch={onSearch} isLoading={isLoading} />
    </Suspense>
  );
}
