'use client';

import { useState } from 'react';
import StarRating from './StarRating';

/**
 * ========================================
 * REVIEW FORM COMPONENT
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
 * 
 * FLOW:
 * User fills form → Validates → Sends to API → Shows result → Clears form
 */

export default function ReviewForm({ 
  productId,        // Which product is being reviewed
  onReviewSubmitted // Callback to parent when review is successful
}) {
  
  /**
   * FORM STATE
   * ----------
   * We use React state to track all form data
   * This makes the form a "controlled component"
   */
  const [rating, setRating] = useState(0);           // Selected star rating
  const [comment, setComment] = useState('');        // Review text
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  const [error, setError] = useState('');            // Error message
  const [success, setSuccess] = useState(false);     // Success flag

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
   * STEPS:
   * 1. Prevent default form submission (page reload)
   * 2. Validate form data
   * 3. Show loading state
   * 4. Send data to API
   * 5. Handle response (success or error)
   * 6. Reset form or show error
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
       * FETCH API CALL
       * --------------
       * This sends data to our backend API endpoint
       * 
       * METHOD: POST (we're creating something new)
       * HEADERS: Tell server we're sending JSON
       * BODY: Convert JavaScript object to JSON string
       */
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      
      // Clear the form
      setRating(0);
      setComment('');

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
        <h3 className="card-title text-lg">Write a Review</h3>
        
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
              <span>Review submitted successfully! Thank you for your feedback.</span>
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
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>

        {/* HELPER TEXT */}
        <div className="text-sm text-base-content/60 mt-2">
          <p>
            ℹ️ Only verified purchasers can submit reviews. 
            Your review will appear after submission.
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
 * @param {function} onReviewSubmitted - Callback after successful submission
 * 
 * USAGE EXAMPLE:
 * --------------
 * 
 * // In a product page:
 * import ReviewForm from '@/components/products/ReviewForm';
 * 
 * export default function ProductPage({ product }) {
 *   const handleReviewAdded = (newReview) => {
 *     console.log('New review added:', newReview);
 *     // Refresh reviews list, update stats, etc.
 *   };
 * 
 *   return (
 *     <div>
 *       <ReviewForm 
 *         productId={product._id}
 *         onReviewSubmitted={handleReviewAdded}
 *       />
 *     </div>
 *   );
 * }
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
 * ✅ Clears form after successful submission
 */
