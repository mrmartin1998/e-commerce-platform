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

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        className="btn btn-sm"
        onClick={() => handlePageClick(pagination.current - 1)}
        disabled={pagination.current === 1 || isLoading}
      >
        Previous
      </button>
      
      <span className="px-4 py-2">
        Page {pagination.current} of {pagination.total}
      </span>
      
      <button
        className="btn btn-sm"
        onClick={() => handlePageClick(pagination.current + 1)}
        disabled={!pagination.hasMore || isLoading}
      >
        Next
      </button>
    </div>
  );
}
