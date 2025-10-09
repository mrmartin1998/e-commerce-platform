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
        onClick={() => handlePageClick(pagination.current - 1)}
        disabled={pagination.current <= 1 || isLoading}
        className="btn btn-outline btn-sm"
      >
        Previous
      </button>
      
      <span className="text-sm">
        Page {pagination.current} of {pagination.total}
      </span>
      
      <button
        onClick={() => handlePageClick(pagination.current + 1)}
        disabled={pagination.current >= pagination.total || isLoading}
        className="btn btn-outline btn-sm"
      >
        Next
      </button>
    </div>
  );
}
