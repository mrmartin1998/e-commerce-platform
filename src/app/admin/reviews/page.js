/**
 * ADMIN REVIEW MODERATION PAGE
 * 
 * This page allows administrators to:
 * - View all product reviews (approved and pending)
 * - Approve or reject reviews
 * - Delete inappropriate reviews
 * - Filter by approval status
 * - View review details with product and user info
 * 
 * EDUCATIONAL NOTE:
 * This is a client component ('use client') because it needs:
 * - State management for reviews, filters, pagination
 * - User interactions (approve/reject buttons)
 * - Real-time updates after actions
 */

'use client';

import { useEffect, useState } from 'react';
import StarRating from '@/components/products/StarRating';
import Image from 'next/image';

export default function AdminReviewsPage() {
  // STATE MANAGEMENT
  // Think of state as the page's memory - it remembers data between re-renders
  const [reviews, setReviews] = useState([]); // Array of all reviews
  const [loading, setLoading] = useState(true); // Is data being fetched?
  const [error, setError] = useState(null); // Any error message
  const [filter, setFilter] = useState('all'); // 'all', 'true' (approved), 'false' (pending)
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [pagination, setPagination] = useState(null); // Pagination metadata
  const [actionLoading, setActionLoading] = useState(null); // Which review is being actioned (ID)

  /**
   * Fetch reviews from API
   * This runs when the page loads or when filters/page changes
   */
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Build URL with query parameters
      // Example: /api/admin/reviews?page=1&limit=10&approved=all
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        approved: filter
      });

      const response = await fetch(`/api/admin/reviews?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }

      setReviews(data.reviews);
      setPagination(data.pagination);

    } catch (err) {
      console.error('Fetch reviews error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * useEffect Hook - The Automatic Worker
   * 
   * Think of useEffect like an automatic worker that says:
   * "Whenever these things change [filter, currentPage], I'll run this function"
   * 
   * Dependencies array [filter, currentPage]:
   * - When filter changes (user clicks All/Approved/Pending)
   * - When currentPage changes (user clicks page 2, 3, etc.)
   * - The function runs automatically!
   */
  useEffect(() => {
    fetchReviews();
  }, [filter, currentPage]); // Re-fetch when filter or page changes

  /**
   * Approve or Reject a Review
   * 
   * @param {string} reviewId - The review's database ID
   * @param {boolean} isApproved - true to approve, false to reject
   */
  const handleApprovalChange = async (reviewId, isApproved) => {
    try {
      setActionLoading(reviewId); // Show loading spinner on this review

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isApproved })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update review');
      }

      // Success! Re-fetch reviews to show updated status
      await fetchReviews();

      alert(`Review ${isApproved ? 'approved' : 'rejected'} successfully`);

    } catch (err) {
      console.error('Approval change error:', err);
      alert(err.message);
    } finally {
      setActionLoading(null); // Stop loading spinner
    }
  };

  /**
   * Delete a Review Permanently
   * 
   * @param {string} reviewId - The review to delete
   */
  const handleDelete = async (reviewId) => {
    // Ask for confirmation - deleting is permanent!
    if (!confirm('Are you sure you want to delete this review? This cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(reviewId);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete review');
      }

      // Success! Re-fetch to update the list
      await fetchReviews();

      alert('Review deleted successfully');

    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Format date to readable string
   * Example: 2026-01-10T12:30:00Z → January 10, 2026
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // LOADING STATE
  // Show spinner while fetching data
  if (loading && reviews.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  // ERROR STATE
  // Show error message with retry button
  if (error && reviews.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
        <button 
          className="btn btn-primary mt-4" 
          onClick={() => fetchReviews()}
        >
          Retry
        </button>
      </div>
    );
  }

  // MAIN CONTENT
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Review Moderation</h1>
        <div className="text-sm text-base-content/70">
          {pagination && `${pagination.totalReviews} total reviews`}
        </div>
      </div>

      {/* Filter Tabs */}
      {/* Buttons to filter by approval status */}
      <div className="tabs tabs-boxed mb-6">
        <button 
          className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
          onClick={() => {
            setFilter('all');
            setCurrentPage(1); // Reset to page 1 when changing filter
          }}
        >
          All Reviews
        </button>
        <button 
          className={`tab ${filter === 'true' ? 'tab-active' : ''}`}
          onClick={() => {
            setFilter('true');
            setCurrentPage(1);
          }}
        >
          Approved
        </button>
        <button 
          className={`tab ${filter === 'false' ? 'tab-active' : ''}`}
          onClick={() => {
            setFilter('false');
            setCurrentPage(1);
          }}
        >
          Pending
        </button>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        // EMPTY STATE - No reviews match the filter
        <div className="text-center py-12">
          <p className="text-lg text-base-content/70">
            No {filter === 'true' ? 'approved' : filter === 'false' ? 'pending' : ''} reviews found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div 
              key={review._id} 
              className="card bg-base-100 shadow-lg border border-base-300"
            >
              <div className="card-body">
                {/* Review Header - Product and User Info */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Product Image */}
                  {review.product?.images?.[0]?.url && (
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={review.product.images[0].url}
                        alt={review.product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}

                  {/* Product and User Details */}
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg">
                      {review.product?.name || 'Unknown Product'}
                    </h3>
                    <div className="text-sm text-base-content/70">
                      By: {review.user?.firstName} {review.user?.lastName} ({review.user?.email})
                    </div>
                    <div className="text-xs text-base-content/50">
                      {formatDate(review.createdAt)}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {review.isApproved ? (
                      <div className="badge badge-success">Approved</div>
                    ) : (
                      <div className="badge badge-warning">Pending</div>
                    )}
                    {review.isVerifiedPurchase && (
                      <div className="badge badge-info ml-2">Verified Purchase</div>
                    )}
                  </div>
                </div>

                {/* Star Rating */}
                <div className="mb-3">
                  <StarRating rating={review.rating} readOnly size="sm" />
                </div>

                {/* Review Comment */}
                <p className="text-base-content/80 mb-4">
                  {review.comment}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                  {/* Approve/Reject Buttons */}
                  {!review.isApproved && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleApprovalChange(review._id, true)}
                      disabled={actionLoading === review._id}
                    >
                      {actionLoading === review._id ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        '✓ Approve'
                      )}
                    </button>
                  )}
                  
                  {review.isApproved && (
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleApprovalChange(review._id, false)}
                      disabled={actionLoading === review._id}
                    >
                      {actionLoading === review._id ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        '✗ Reject'
                      )}
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    className="btn btn-error btn-sm"
                    onClick={() => handleDelete(review._id)}
                    disabled={actionLoading === review._id}
                  >
                    {actionLoading === review._id ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      '🗑 Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {/* Previous Button */}
          <button
            className="btn btn-outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={!pagination.hasPrevPage || loading}
          >
            ← Previous
          </button>

          {/* Page Numbers */}
          <div className="flex gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setCurrentPage(page)}
                disabled={loading}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            className="btn btn-outline"
            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
            disabled={!pagination.hasNextPage || loading}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
