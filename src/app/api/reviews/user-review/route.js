/**
 * USER REVIEW CHECK API
 * 
 * This endpoint checks if the current logged-in user has already reviewed a specific product.
 * 
 * WHY THIS EXISTS:
 * - Determine whether to show "Write Review" or "Edit Review" button
 * - Prevent duplicate review attempts
 * - Pre-fill form data when editing
 * 
 * USAGE:
 * GET /api/reviews/user-review?productId=abc123
 * 
 * RESPONSE:
 * {
 *   hasReview: true/false,
 *   review: {...} or null
 * }
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Review } from '@/lib/models';
import { verifyAuth } from '@/lib/middleware/auth';

export async function GET(request) {
  try {
    // STEP 1: Verify user is authenticated
    // Only logged-in users can check their reviews
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    // STEP 2: Get productId from query parameters
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // STEP 3: Check if user has a review for this product
    // Find review where:
    // - user matches logged-in user
    // - product matches requested product
    const review = await Review.findOne({
      user: user._id,
      product: productId
    }).lean(); // Convert to plain object

    // STEP 4: Return result
    return NextResponse.json({
      hasReview: !!review, // Convert to boolean
      review: review || null
    });

  } catch (error) {
    console.error('Error checking user review:', error);
    return NextResponse.json(
      { error: 'Failed to check review status' },
      { status: 500 }
    );
  }
}
