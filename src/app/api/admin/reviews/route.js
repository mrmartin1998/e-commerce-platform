/**
 * ADMIN REVIEW MANAGEMENT API
 * 
 * This API allows administrators to manage product reviews:
 * - GET: Fetch all reviews (with filters and pagination)
 * - Used by admin panel to moderate user-submitted reviews
 * 
 * EDUCATIONAL NOTE:
 * Unlike the public /api/reviews endpoint, this one:
 * - Requires admin authentication
 * - Returns ALL reviews (including non-approved ones)
 * - Provides more detailed information for moderation
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Review } from '@/lib/models';
import { verifyAdmin } from '@/lib/middleware/adminAuth';

/**
 * GET /api/admin/reviews
 * Fetch all reviews for admin moderation
 * 
 * Query Parameters:
 * - page: Page number (default 1)
 * - limit: Reviews per page (default 10)
 * - approved: Filter by approval status ('true', 'false', or 'all')
 * - productId: Filter by specific product
 * 
 * Why separate from /api/reviews?
 * - Different permissions (admin only)
 * - Different data (includes unapproved reviews)
 * - Different pagination (admins might want to see more at once)
 */
export async function GET(request) {
  try {
    // STEP 1: Verify admin authentication
    // Only admins can see all reviews (including pending/unapproved)
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.valid) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    await connectDB();

    // STEP 2: Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const approvedFilter = searchParams.get('approved') || 'all'; // 'true', 'false', or 'all'
    const productId = searchParams.get('productId');

    // STEP 3: Build filter query
    const filter = {};
    
    // Filter by approval status
    if (approvedFilter === 'true') {
      filter.isApproved = true;
    } else if (approvedFilter === 'false') {
      filter.isApproved = false;
    }
    // If 'all', don't add isApproved filter

    // Filter by product if specified
    if (productId) {
      filter.product = productId;
    }

    // STEP 4: Calculate pagination
    const skip = (page - 1) * limit;

    // STEP 5: Fetch reviews with user and product details
    // .populate() adds full user and product data instead of just IDs
    const reviews = await Review.find(filter)
      .populate('user', 'firstName lastName email') // Get user info
      .populate('product', 'name price images') // Get product info
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .lean(); // Convert to plain JavaScript objects for better performance

    // STEP 6: Get total count for pagination metadata
    const totalReviews = await Review.countDocuments(filter);
    const totalPages = Math.ceil(totalReviews / limit);

    // STEP 7: Return data with pagination info
    return NextResponse.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        reviewsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Admin reviews fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
