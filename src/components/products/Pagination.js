"use client";

import { useRouter, useSearchParams } from 'next/navigation';

export default function Pagination({ pagination, onPageChange, isLoading }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!pagination || pagination.total <= 1) {
    return null;
  }

  const { current, total, hasMore, totalProducts } = pagination;

  const handlePageChange = (page) => {
    if (page === current || page < 1 || page > total || isLoading) return;

    // Update URL with new page
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    
    const newUrl = `?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
    
    // Trigger callback
    onPageChange(page);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Show 2 pages before and after current
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(total - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < total - 1) {
      rangeWithDots.push('...', total);
    } else if (total > 1) {
      rangeWithDots.push(total);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
      {/* Results info */}
      <div className="text-sm opacity-70">
        Showing page {current} of {total} ({totalProducts} total products)
      </div>

      {/* Pagination controls */}
      <div className="join">
        {/* Previous button */}
        <button
          className={`join-item btn btn-sm ${current === 1 ? 'btn-disabled' : ''}`}
          onClick={() => handlePageChange(current - 1)}
          disabled={current === 1 || isLoading}
          aria-label="Previous page"
        >
          «
        </button>

        {/* Page numbers */}
        {pageNumbers.map((pageNum, index) => (
          pageNum === '...' ? (
            <span key={`dots-${index}`} className="join-item btn btn-sm btn-disabled">
              ...
            </span>
          ) : (
            <button
              key={pageNum}
              className={`join-item btn btn-sm ${
                pageNum === current ? 'btn-active' : ''
              }`}
              onClick={() => handlePageChange(pageNum)}
              disabled={isLoading}
            >
              {pageNum}
            </button>
          )
        ))}

        {/* Next button */}
        <button
          className={`join-item btn btn-sm ${current === total ? 'btn-disabled' : ''}`}
          onClick={() => handlePageChange(current + 1)}
          disabled={current === total || isLoading}
          aria-label="Next page"
        >
          »
        </button>
      </div>
    </div>
  );
}
