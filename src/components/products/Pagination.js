"use client";

import { useRouter, useSearchParams } from 'next/navigation';

export default function Pagination({ pagination, onPageChange, isLoading }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!pagination || pagination.total <= 1) {
    return null;
  }

  const handlePageClick = (page) => {
    if (page === pagination.current || isLoading) return;
    
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    
    const newUrl = `?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
    
    onPageChange(page);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const { current, total } = pagination;
    
    // Always show first page
    if (current > 3) pages.push(1);
    
    // Show ellipsis if needed
    if (current > 4) pages.push('...');
    
    // Show pages around current
    for (let i = Math.max(1, current - 1); i <= Math.min(total, current + 1); i++) {
      pages.push(i);
    }
    
    // Show ellipsis if needed
    if (current < total - 3) pages.push('...');
    
    // Always show last page
    if (current < total - 2) pages.push(total);
    
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <div className="join">
        <button
          className="join-item btn btn-sm"
          onClick={() => handlePageClick(pagination.current - 1)}
          disabled={pagination.current === 1 || isLoading}
        >
          «
        </button>
        
        {generatePageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={index} className="join-item btn btn-sm btn-disabled">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`join-item btn btn-sm ${
                page === pagination.current ? 'btn-active' : ''
              }`}
              onClick={() => handlePageClick(page)}
              disabled={isLoading}
            >
              {page}
            </button>
          )
        ))}
        
        <button
          className="join-item btn btn-sm"
          onClick={() => handlePageClick(pagination.current + 1)}
          disabled={!pagination.hasMore || isLoading}
        >
          »
        </button>
      </div>
      
      <div className="text-sm opacity-70 ml-4">
        Page {pagination.current} of {pagination.total}
      </div>
    </div>
  );
}
