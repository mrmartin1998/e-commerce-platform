/**
 * UPDATE REVIEW API
 * 
 * This endpoint allows users to edit their own reviews.
 * 
 * IMPORTANT SECURITY:
 * - Users can ONLY edit their OWN reviews
 * - Admins can edit any review (handled separately in admin routes)
 * 
 * WHY THIS EXISTS:
 * - Users change their mind about ratings
 * - Users want to fix typos or add details
 * - Better UX than forcing delete + recreate
 * 
 * USAGE:
 * PUT /api/reviews/[reviewId]
 * Body: { rating: 4, comment: "Updated review text" }
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Review, Product } from '@/lib/models';
import { verifyAuth } from '@/lib/middleware/auth';

/**
 * PUT /api/reviews/[id]
 * Update an existing review (user's own review only)
 */
export async function PUT(request, { params }) {
  try {
    // STEP 1: Verify user is authenticated
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    // STEP 2: Get review ID from URL params
    const { id } = params;

    // STEP 3: Parse request body
    const body = await request.json();
    const { rating, comment } = body;

    // STEP 4: Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // STEP 5: Find the review
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // STEP 6: SECURITY CHECK - Verify user owns this review
    // This prevents users from editing other people's reviews!
    if (review.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'You can only edit your own reviews' },
        { status: 403 } // 403 = Forbidden
      );
    }

    // STEP 7: Update review fields
    // Only update fields that are provided
    if (rating) {
      review.rating = rating;
    }
    if (typeof comment !== 'undefined') {
      review.comment = comment;
    }

    // STEP 8: Save updated review
    await review.save();

    // STEP 9: Recalculate product's average rating
    // Since rating might have changed, we need to update product stats
    const stats = await Review.calculateAverageRating(review.product);
    await Product.findByIdAndUpdate(review.product, {
      averageRating: stats.averageRating,
      reviewCount: stats.reviewCount
    });

    // STEP 10: Return updated review with populated data
    const updatedReview = await Review.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('product', 'name price');

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id]
 * Allow users to delete their own reviews
 * 
 * NOTE: This is different from admin deletion
 * - Users can delete ONLY their own reviews
 * - Admin deletion is in /api/admin/reviews/[id]
 */
export async function DELETE(request, { params }) {
  try {
    // STEP 1: Verify user is authenticated
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    // STEP 2: Get review ID from URL
    const { id } = params;

    // STEP 3: Find the review
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // STEP 4: SECURITY CHECK - Verify user owns this review
    if (review.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    // STEP 5: Store productId before deleting
    const productId = review.product;

    // STEP 6: Delete the review
    await Review.findByIdAndDelete(id);

    // STEP 7: Update product's rating after deletion
    const stats = await Review.calculateAverageRating(productId);
    await Product.findByIdAndUpdate(productId, {
      averageRating: stats.averageRating,
      reviewCount: stats.reviewCount
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
