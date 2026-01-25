/**
 * ADMIN REVIEW MODERATION API
 * 
 * This API allows administrators to moderate individual reviews:
 * - PUT: Update review (approve/reject, edit)
 * - DELETE: Remove review entirely
 * 
 * EDUCATIONAL NOTE:
 * This is a dynamic route - [id] in the folder name means
 * the ID comes from the URL: /api/admin/reviews/abc123
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Review, Product } from '@/lib/models';
import { requireAdmin } from '@/lib/middleware/adminAuth';

/**
 * PUT /api/admin/reviews/[id]
 * Update a review (approve/reject or edit content)
 * 
 * Request Body:
 * - isApproved: true/false (approve or reject review)
 * - comment: (optional) Edit the review text
 * - rating: (optional) Edit the rating
 */
export const PUT = requireAdmin(async function putHandler(request, context) {
  try {
    await connectDB();

    // Get review ID from URL params (Next.js 15 requires await)
    const params = await context.params;
    const { id } = params;
    
    // STEP 3: Parse request body
    const body = await request.json();
    const { isApproved, comment, rating } = body;

    // STEP 4: Find the review
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // STEP 5: Update review fields
    // Only update fields that are provided
    if (typeof isApproved !== 'undefined') {
      review.isApproved = isApproved;
    }
    if (comment) {
      review.comment = comment;
    }
    if (rating) {
      // Validate rating is between 1-5
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'Rating must be between 1 and 5' },
          { status: 400 }
        );
      }
      review.rating = rating;
    }

    // STEP 6: Save updated review
    await review.save();

    // STEP 7: Recalculate product's average rating
    // When approval status changes, the average rating should update
    const stats = await Review.calculateAverageRating(review.product);
    await Product.findByIdAndUpdate(review.product, {
      averageRating: stats.averageRating,
      reviewCount: stats.reviewCount
    });

    // STEP 8: Return updated review with populated data
    const updatedReview = await Review.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('product', 'name price');

    return NextResponse.json({
      message: 'Review updated successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Review update error:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/admin/reviews/[id]
 * Permanently delete a review
 * 
 * Why DELETE?
 * - Spam reviews
 * - Offensive content
 * - Fake reviews
 * - Violates policies
 */
export const DELETE = requireAdmin(async function deleteHandler(request, context) {
  try {
    await connectDB();

    // Get review ID from URL (Next.js 15 requires await)
    const params = await context.params;
    const { id } = params;

    // STEP 3: Find and delete review
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    const productId = review.product;
    await Review.findByIdAndDelete(id);

    // STEP 4: Update product's rating after deletion
    // Recalculate average since a review was removed
    const stats = await Review.calculateAverageRating(productId);
    await Product.findByIdAndUpdate(productId, {
      averageRating: stats.averageRating,
      reviewCount: stats.reviewCount
    });

    return NextResponse.json({
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Review deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
});
