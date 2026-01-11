'use client';

import { useState, useEffect } from 'react';
import StarRating from './StarRating';

/**
 * ========================================
 * REVIEW FORM COMPONENT (CREATE & EDIT)
 * ========================================
 * 
 * LEARNING POINTS:
 * ----------------
 * This component demonstrates several key React concepts:
 * 
 * 1. CONTROLLED COMPONENTS: Form inputs controlled by React state
 * 2. FORM VALIDATION: Check data before sending to API
 * 3. ASYNC/AWAIT: Handle API calls with proper loading states
 * 4. ERROR HANDLING: Gracefully handle failures
 * 5. USER FEEDBACK: Show success/error messages
 * 6. COMPONENT COMPOSITION: Uses StarRating component we built
 * 7. DUAL MODE: Can create NEW reviews or EDIT existing ones
 * 
 * FLOW:
 * - CREATE MODE: User fills form → Validates → POST to API → Shows result → Clears form
 * - EDIT MODE: Form pre-filled → User changes → Validates → PUT to API → Shows result
 */

export default function ReviewForm({ 
  productId,        // Which product is being reviewed
  existingReview,   // If editing, the review data to pre-fill (optional)
  mode = 'create',  // 'create' or 'edit' mode
  onReviewSubmitted // Callback to parent when review is successful
}) {
  
  /**
   * FORM STATE
   * ----------
   * We use React state to track all form data
   * This makes the form a "controlled component"
   * 
   * NEW: Initialize with existing review data if in edit mode
   */
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  /**
   * useEffect Hook - Pre-fill Form in Edit Mode
   * -------------------------------------------
   * When existingReview prop changes, update the form
   * This ensures form stays in sync with passed data
   */
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 0);
      setComment(existingReview.comment || '');
    }
  }, [existingReview]);

  /**
   * VALIDATION FUNCTION
   * -------------------
   * Check if form data is valid before submitting
   * 
   * RULES:
   * - Rating must be selected (1-5)
   * - Comment is optional but has max length
   */
  const validateForm = () => {
    // Clear any previous errors
    setError('');

    // Check if rating is selected
    if (rating === 0) {
      setError('Please select a rating');
      return false;
    }

    // Check comment length (if provided)
    if (comment.length > 1000) {
      setError('Review must be 1000 characters or less');
      return false;
    }

    return true;
  };

  /**
   * HANDLE SUBMIT
   * -------------
   * This is where the magic happens!
   * 
   * NEW: Now handles BOTH create and edit modes
   * - CREATE: POST to /api/reviews
   * - EDIT: PUT to /api/reviews/[id]
   * 
   * STEPS:
   * 1. Prevent default form submission (page reload)
   * 2. Validate form data
   * 3. Show loading state
   * 4. Send data to appropriate API endpoint
   * 5. Handle response (success or error)
   * 6. Reset form (create) or keep data (edit)
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // IMPORTANT: Prevents page reload

    // Step 1: Validate
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    // Step 2: Set loading state
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      /**
       * GET AUTHENTICATION TOKEN
       * ------------------------
       * Retrieve JWT token from localStorage to authenticate the request
       */
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to submit a review');
      }

      /**
       * DETERMINE API ENDPOINT & METHOD
       * --------------------------------
       * CREATE MODE: POST /api/reviews
       * EDIT MODE: PUT /api/reviews/[reviewId]
       */
      const url = mode === 'edit' 
        ? `/api/reviews/${existingReview._id}`
        : '/api/reviews';
      
      const method = mode === 'edit' ? 'PUT' : 'POST';

      /**
       * FETCH API CALL
       * --------------
       * Sends data to backend API endpoint
       * IMPORTANT: Includes Authorization header with JWT token
       */
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Auth token for protected route
        },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim() // Remove extra whitespace
        })
      });

      /**
       * PARSE RESPONSE
       * --------------
       * Convert JSON response back to JavaScript object
       */
      const data = await response.json();

      /**
       * CHECK IF SUCCESSFUL
       * -------------------
       * HTTP status codes:
       * - 200-299: Success
       * - 400-499: Client errors (bad request, unauthorized, etc.)
       * - 500-599: Server errors
       */
      if (!response.ok) {
        // Server returned an error
        throw new Error(data.error || 'Failed to submit review');
      }

      // SUCCESS! 🎉
      setSuccess(true);
      
      // Only clear form in CREATE mode
      // In EDIT mode, keep the updated values
      if (mode === 'create') {
        setRating(0);
        setComment('');
      }

      // Notify parent component (if callback provided)
      if (onReviewSubmitted) {
        onReviewSubmitted(data.review);
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err) {
      // HANDLE ERRORS
      console.error('Error submitting review:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      // ALWAYS runs, whether success or error
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-200 shadow-lg">
      <div className="card-body">
        <h3 className="card-title text-lg">
          {mode === 'edit' ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* RATING SELECTOR */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Your Rating <span className="text-error">*</span>
              </span>
            </label>
            
            {/* Here we use our StarRating component! */}
            <StarRating 
              rating={rating}
              onRatingChange={setRating}
              size="lg"
              showNumber={false}
            />
            
            {/* Show selected rating in words */}
            {rating > 0 && (
              <span className="text-sm text-base-content/60 mt-2">
                {rating === 1 && '⭐ Poor'}
                {rating === 2 && '⭐⭐ Fair'}
                {rating === 3 && '⭐⭐⭐ Good'}
                {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
              </span>
            )}
          </div>

          {/* REVIEW TEXT */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Your Review</span>
              <span className="label-text-alt text-base-content/60">
                Optional
              </span>
            </label>
            
            <textarea
              className="textarea textarea-bordered h-32 resize-none"
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              disabled={isSubmitting}
            />
            
            {/* Character counter */}
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                {comment.length}/1000 characters
              </span>
            </label>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {success && (
            <div className="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {mode === 'edit' 
                  ? 'Review updated successfully!' 
                  : 'Review submitted successfully! Thank you for your feedback.'}
              </span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="card-actions justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  {mode === 'edit' ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                mode === 'edit' ? 'Update Review' : 'Submit Review'
              )}
            </button>
          </div>
        </form>

        {/* HELPER TEXT */}
        <div className="text-sm text-base-content/60 mt-2">
          <p>
            ℹ️ {mode === 'edit' 
              ? 'You can update your review at any time.' 
              : 'Only verified purchasers can submit reviews. Your review will appear after submission.'}
          </p>
        </div>
      </div>
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
 * @param {string} productId - ID of product being reviewed (required)
 * @param {object} existingReview - Review data for edit mode (optional)
 * @param {string} mode - 'create' or 'edit' (default: 'create')
 * @param {function} onReviewSubmitted - Callback after successful submission
 * 
 * USAGE EXAMPLES:
 * ---------------
 * 
 * // CREATE MODE - New review:
 * <ReviewForm 
 *   productId={product._id}
 *   mode="create"
 *   onReviewSubmitted={handleReviewAdded}
 * />
 * 
 * // EDIT MODE - Update existing review:
 * <ReviewForm 
 *   productId={product._id}
 *   existingReview={userReview}
 *   mode="edit"
 *   onReviewSubmitted={handleReviewUpdated}
 * />
 * 
 * FEATURES:
 * ---------
 * ✅ Star rating selection with visual feedback
 * ✅ Optional text review (1000 char max)
 * ✅ Form validation before submission
 * ✅ Loading state during API call
 * ✅ Error handling with user-friendly messages
 * ✅ Success feedback with auto-hide
 * ✅ Character counter
 * ✅ Disabled state while submitting
 * ✅ CREATE MODE: Clears form after successful submission
 * ✅ EDIT MODE: Keeps form data after update
 * ✅ Dynamic button text and messages based on mode
 */
