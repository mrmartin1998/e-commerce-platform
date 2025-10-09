"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSearch, FiX } from 'react-icons/fi';

function SearchBarContent({ onSearch, isLoading }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize search term from URL params
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
      
      // Update URL with search parameter
      const params = new URLSearchParams(searchParams);
      if (searchTerm) {
        params.set('q', searchTerm);
      } else {
        params.delete('q');
      }
      
      // Update URL without page refresh
      const newUrl = params.toString() ? `?${params.toString()}` : '/products';
      router.replace(newUrl, { scroll: false });
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearch, router, searchParams]);

  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
    router.replace('/products', { scroll: false });
  };

  return (
    <div className="relative">
      <div className="form-control">
        <div className="input-group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5">
            <FiSearch />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            className="input input-bordered flex-1 pl-10 pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <FiX className="w-5 h-5" />
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

export default function SearchBar({ onSearch, isLoading }) {
  return (
    <Suspense fallback={
      <div className="relative">
        <div className="form-control">
          <div className="input-group">
            <input
              type="text"
              placeholder="Search products..."
              className="input input-bordered flex-1"
              disabled
            />
            <div className="btn btn-square">
              <span className="loading loading-spinner loading-sm"></span>
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchBarContent onSearch={onSearch} isLoading={isLoading} />
    </Suspense>
  );
}
