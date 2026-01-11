'use client';

import { useState, useEffect } from 'react';
import StarRating from './StarRating';

/**
 * ========================================
 * REVIEW LIST COMPONENT
 * ========================================
 * 
 * LEARNING POINTS:
 * ----------------
 * This component demonstrates:
 * 
 * 1. DATA FETCHING: Get data from API when component loads
 * 2. useEffect HOOK: Run code after component renders
 * 3. PAGINATION: Split large datasets into pages
 * 4. LOADING STATES: Show skeleton while loading
 * 5. ERROR HANDLING: Handle fetch failures gracefully
 * 6. DATE FORMATTING: Display dates in readable format
 * 7. CONDITIONAL RENDERING: Show different UI based on state
 * 
 * FLOW:
 * Component mounts → Fetch reviews → Display → User clicks page → Fetch again
 */

export default function ReviewList({ 
  productId,     // Which product's reviews to show
  refreshKey = 0 // Increment this to refresh reviews (e.g., after new review)
}) {
  
  /**
   * COMPONENT STATE
   * ---------------
   * All the data this component needs to track
   */
  const [reviews, setReviews] = useState([]);          // Array of review objects
  const [loading, setLoading] = useState(true);        // Is data loading?
  const [error, setError] = useState('');              // Error message if fetch fails
  const [currentPage, setCurrentPage] = useState(1);   // Which page user is on
  const [totalPages, setTotalPages] = useState(1);     // Total number of pages
  const [totalReviews, setTotalReviews] = useState(0); // Total review count

  const reviewsPerPage = 5; // How many reviews to show per page

  /**
   * FETCH REVIEWS FUNCTION
   * ----------------------
   * This is a REUSABLE function that fetches reviews from API
   * We'll call it from useEffect and when changing pages
   */
  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      setError('');

      /**
       * BUILD URL WITH QUERY PARAMETERS
       * --------------------------------
       * URLSearchParams helps build query strings safely
       * Example result: /api/reviews?productId=123&page=1&limit=5
       */
      const params = new URLSearchParams({
        productId,
        page: page.toString(),
        limit: reviewsPerPage.toString(),
        approved: 'true' // Only show approved reviews
      });

      /**
       * FETCH FROM API
       * --------------
       * GET request to retrieve reviews
       */
      const response = await fetch(`/api/reviews?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();

      // Update state with fetched data
      setReviews(data.reviews || []);
      setTotalPages(data.pagination?.total || 1);
      setTotalReviews(data.pagination?.totalReviews || 0);
      setCurrentPage(page);

    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
      setReviews([]);
    } finally {
      // Always runs, whether success or error
      setLoading(false);
    }
  };

  /**
   * useEffect HOOK
   * --------------
   * THE MOST IMPORTANT REACT HOOK!
   * 
   * Syntax: useEffect(() => {  code  }, [dependencies])
   * 
   * - Runs AFTER component renders
   * - Runs again when dependencies change
   * - Perfect for data fetching, subscriptions, etc.
   * 
   * DEPENDENCIES ARRAY [productId, refreshKey]:
   * - If productId changes → fetch new product's reviews
   * - If refreshKey changes → re-fetch (e.g., after new review submitted)
   * - Empty array [] → runs only once on mount
   * - No array → runs after EVERY render (usually wrong!)
   **/
  useEffect(() => {
    if (productId) {
      fetchReviews(1); // Fetch page 1 when component mounts or productId changes
    }
  }, [productId, refreshKey]); // Run when these values change

  /**
   * HANDLE PAGE CHANGE
   * ------------------
   * Called when user clicks pagination buttons
   */
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return; // Validate page number
    fetchReviews(newPage); // Fetch the new page
    
    // Scroll to top of reviews (better UX)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * FORMAT DATE
   * -----------
   * Convert ISO date string to readable format
   * Example: "2024-01-10T12:30:00Z" → "January 10, 2024"
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * LOADING SKELETON
   * ----------------
   * Show placeholder while data loads
   * Gives immediate visual feedback (better UX than blank screen)
   */
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card bg-base-200 shadow-sm animate-pulse">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-base-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-base-300 rounded w-1/4"></div>
                  <div className="h-4 bg-base-300 rounded w-1/3"></div>
                  <div className="h-20 bg-base-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /**
   * ERROR STATE
   * -----------
   * Show error message if fetch failed
   */
  if (error) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{error}</span>
        <button 
          className="btn btn-sm btn-ghost"
          onClick={() => fetchReviews(currentPage)}
        >
          Retry
        </button>
      </div>
    );
  }

  /**
   * EMPTY STATE
   * -----------
   * No reviews yet - encourage first review!
   */
  if (reviews.length === 0) {
    return (
      <div className="card bg-base-200">
        <div className="card-body text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
          <p className="text-base-content/60">
            Be the first to share your experience with this product!
          </p>
        </div>
      </div>
    );
  }

  /**
   * REVIEWS LIST
   * ------------
   * Main content - display all reviews
   */
  return (
    <div className="space-y-6">
      
      {/* HEADER WITH COUNT */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          Customer Reviews ({totalReviews.toLocaleString()})
        </h3>
      </div>

      {/* REVIEWS */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div 
            key={review._id} 
            className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="card-body">
              
              {/* REVIEW HEADER */}
              <div className="flex items-start justify-between gap-4 mb-3">
                
                {/* USER INFO */}
                <div className="flex items-center gap-3">
                  {/* Avatar (first letter of name) */}
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-12">
                      <span className="text-xl">
                        {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    {/* Name */}
                    <div className="font-semibold">
                      {review.user?.name || 'Anonymous'}
                    </div>
                    
                    {/* Verified Purchase Badge */}
                    {review.isVerifiedPurchase && (
                      <div className="badge badge-success badge-sm gap-1 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified Purchase
                      </div>
                    )}
                  </div>
                </div>

                {/* DATE */}
                <div className="text-sm text-base-content/60">
                  {formatDate(review.createdAt)}
                </div>
              </div>

              {/* STAR RATING */}
              <div className="mb-3">
                <StarRating 
                  rating={review.rating}
                  readOnly={true}
                  showNumber={false}
                  size="sm"
                />
              </div>

              {/* REVIEW COMMENT */}
              {review.comment && (
                <p className="text-base-content leading-relaxed">
                  {review.comment}
                </p>
              )}

              {/* HELPFUL SECTION (future feature) */}
              {review.helpfulCount > 0 && (
                <div className="text-sm text-base-content/60 mt-3">
                  👍 {review.helpfulCount} {review.helpfulCount === 1 ? 'person' : 'people'} found this helpful
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          
          {/* Previous Button */}
          <button
            className="btn btn-sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            « Previous
          </button>

          {/* Page Numbers */}
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            className="btn btn-sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next »
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * ========================================
 * COMPONENT DOCUMENTATION
 * ========================================
 * 
 * PROPS:
 * ------
 * @param {string} productId - ID of product to show reviews for (required)
 * @param {number} refreshKey - Increment to refresh reviews (optional)
 * 
 * USAGE EXAMPLE:
 * --------------
 * 
 * import ReviewList from '@/components/products/ReviewList';
 * 
 * export default function ProductPage({ product }) {
 *   const [refreshKey, setRefreshKey] = useState(0);
 * 
 *   const handleNewReview = () => {
 *     setRefreshKey(prev => prev + 1); // Trigger refresh
 *   };
 * 
 *   return (
 *     <div>
 *       <ReviewForm 
 *         productId={product._id}
 *         onReviewSubmitted={handleNewReview}
 *       />
 *       
 *       <ReviewList 
 *         productId={product._id}
 *         refreshKey={refreshKey}
 *       />
 *     </div>
 *   );
 * }
 * 
 * FEATURES:
 * ---------
 * ✅ Fetches reviews from API on mount
 * ✅ Pagination with page numbers
 * ✅ Loading skeleton for better UX
 * ✅ Error handling with retry button
 * ✅ Empty state when no reviews
 * ✅ Verified purchase badge
 * ✅ User avatar with first letter
 * ✅ Formatted dates (readable)
 * ✅ Star rating display
 * ✅ Refresh when new review added
 * ✅ Smooth scroll on page change
 * ✅ Responsive design
 */
