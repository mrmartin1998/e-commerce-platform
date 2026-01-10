'use client';

import { useState } from 'react';

/**
 * ========================================
 * STAR RATING COMPONENT
 * ========================================
 * 
 * LEARNING POINTS:
 * ----------------
 * This is a REUSABLE component that works in TWO MODES:
 * 
 * 1. DISPLAY MODE (read-only): Shows existing rating (e.g., "4.5 stars")
 * 2. INPUT MODE (interactive): Lets users SELECT a rating (1-5 stars)
 * 
 * KEY CONCEPTS:
 * - Component Props: Parameters passed to customize behavior
 * - Conditional Rendering: Show different things based on props
 * - Event Handlers: Respond to user clicks/hovers
 * - State Management: Track temporary hover state
 * 
 * USAGE EXAMPLES:
 * 
 * // Display existing rating (read-only)
 * <StarRating rating={4.5} readOnly={true} />
 * 
 * // Interactive rating input
 * <StarRating 
 *   rating={currentRating} 
 *   onRatingChange={(newRating) => setRating(newRating)}
 * />
 */

export default function StarRating({ 
  rating = 0,           // Current rating value (0-5)
  onRatingChange,       // Function to call when user selects rating
  readOnly = false,     // If true, stars are just for display (not clickable)
  size = 'md',          // Size: 'sm', 'md', 'lg'
  showNumber = true,    // Show numeric rating next to stars
  count = 0             // Optional: number of reviews
}) {
  
  // STATE: Track which star is being hovered over
  // This gives visual feedback when user moves mouse over stars
  const [hoverRating, setHoverRating] = useState(0);

  /**
   * STAR SIZES
   * ----------
   * We use Tailwind CSS classes to make stars different sizes
   * This object maps size names to CSS classes
   */
  const sizeClasses = {
    sm: 'w-4 h-4',   // Small: 16px
    md: 'w-5 h-5',   // Medium: 20px  
    lg: 'w-6 h-6'    // Large: 24px
  };

  /**
   * HANDLE CLICK
   * ------------
   * When user clicks a star, we:
   * 1. Check if component is interactive (not readOnly)
   * 2. Call the parent component's function with new rating
   * 
   * The +1 is because array index starts at 0, but ratings start at 1
   */
  const handleClick = (index) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  /**
   * RENDER STARS
   * ------------
   * We create an array of 5 elements (one for each star)
   * Then map over it to render 5 star icons
   * 
   * Array(5).fill(0) creates: [0, 0, 0, 0, 0]
   * .map((_, index) => ...) loops with index: 0, 1, 2, 3, 4
   */
  const stars = Array(5).fill(0).map((_, index) => {
    // Determine what rating to display:
    // If hovering (and not read-only), show hover rating
    // Otherwise show actual rating
    const displayRating = !readOnly && hoverRating > 0 ? hoverRating : rating;
    
    /**
     * STAR FILL LOGIC
     * ---------------
     * We need to handle:
     * 1. Full stars (rating >= index + 1)
     * 2. Half stars (for decimals like 4.5)
     * 3. Empty stars (rating < index + 1)
     */
    
    // Is this star fully filled?
    const isFilled = displayRating >= index + 1;
    
    // Is this star half-filled? (for ratings like 3.5, 4.7, etc.)
    const isHalfFilled = !isFilled && displayRating > index && displayRating < index + 1;

    return (
      <button
        key={index}
        type="button"
        onClick={() => handleClick(index)}
        onMouseEnter={() => !readOnly && setHoverRating(index + 1)}
        onMouseLeave={() => !readOnly && setHoverRating(0)}
        disabled={readOnly}
        className={`
          ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
          transition-transform
          ${!readOnly && 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded'}
        `}
        aria-label={`Rate ${index + 1} stars`}
      >
        {/* SVG STAR ICON */}
        <svg
          className={`${sizeClasses[size]} transition-colors`}
          fill={isFilled || isHalfFilled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={isFilled || isHalfFilled ? 0 : 2}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* HALF STAR GRADIENT (for ratings like 3.5) */}
          {isHalfFilled && (
            <defs>
              <linearGradient id={`half-${index}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
          )}
          
          {/* STAR PATH (the actual star shape) */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isHalfFilled ? `url(#half-${index})` : undefined}
            className={`
              ${isFilled ? 'text-warning' : ''}
              ${isHalfFilled ? 'text-warning' : ''}
              ${!isFilled && !isHalfFilled ? 'text-base-300' : ''}
            `}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>
    );
  });

  return (
    <div className="flex items-center gap-2">
      {/* STARS CONTAINER */}
      <div className="flex items-center gap-1">
        {stars}
      </div>

      {/* NUMERIC RATING & COUNT */}
      {showNumber && (
        <div className="flex items-center gap-1 text-sm">
          {/* Show rating number (e.g., "4.5") */}
          <span className="font-semibold text-base-content">
            {rating > 0 ? rating.toFixed(1) : '0.0'}
          </span>
          
          {/* Show review count if provided (e.g., "(123)") */}
          {count > 0 && (
            <span className="text-base-content/60">
              ({count.toLocaleString()})
            </span>
          )}
        </div>
      )}

      {/* SCREEN READER TEXT (accessibility) */}
      <span className="sr-only">
        {rating.toFixed(1)} out of 5 stars
        {count > 0 && ` based on ${count} reviews`}
      </span>
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
 * @param {number} rating - Current rating value (0-5)
 * @param {function} onRatingChange - Callback when user selects rating
 * @param {boolean} readOnly - If true, stars are display-only
 * @param {string} size - Star size: 'sm', 'md', 'lg'
 * @param {boolean} showNumber - Show numeric rating
 * @param {number} count - Number of reviews (optional)
 * 
 * EXAMPLES:
 * ---------
 * 
 * // 1. Display product rating on card
 * <StarRating 
 *   rating={product.averageRating} 
 *   count={product.reviewCount}
 *   readOnly={true}
 * />
 * 
 * // 2. Let user select rating in review form
 * const [rating, setRating] = useState(0);
 * <StarRating 
 *   rating={rating}
 *   onRatingChange={setRating}
 * />
 * 
 * // 3. Small stars in list view
 * <StarRating 
 *   rating={4.5}
 *   size="sm"
 *   showNumber={false}
 *   readOnly={true}
 * />
 */
