import { NextResponse } from 'next/server';
import { Review, Order, Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { verifyAuth } from '@/lib/middleware/auth';

/**
 * ========================================
 * POST /api/reviews - CREATE A NEW REVIEW
 * ========================================
 * 
 * LEARNING POINTS:
 * ----------------
 * 1. We protect this route with verifyAuth - only logged-in users can review
 * 2. We check if user actually purchased the product (verified purchase)
 * 3. We prevent duplicate reviews using try/catch (unique index on product+user)
 * 4. After creating a review, we recalculate the product's average rating
 * 
 * REQUEST BODY:
 * {
 *   "productId": "123abc...",
 *   "rating": 5,
 *   "comment": "Great product!"
 * }
 */
export async function POST(request) {
  try {
    // STEP 1: Verify user is authenticated
    // This middleware checks the JWT token and returns user info
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 } // 401 = Unauthorized
      );
    }

    // STEP 2: Connect to database
    await connectDB();

    // STEP 3: Parse request body (the review data from frontend)
    const { productId, rating, comment } = await request.json();

    // STEP 4: Validate required fields
    if (!productId || !rating) {
      return NextResponse.json(
        { error: 'Product ID and rating are required' },
        { status: 400 } // 400 = Bad Request (client error)
      );
    }

    // STEP 5: Validate rating is in correct range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // STEP 6: Check if user has purchased this product (VERIFIED PURCHASE)
    // 
    // WHY THIS MATTERS:
    // Verified purchases add credibility to reviews
    // Users trust reviews from actual buyers more than random reviews
    // 
    // HOW IT WORKS:
    // We search the Orders collection for:
    // 1. An order by this user (userId matches)
    // 2. That contains this product (items.productId matches)
    // 3. That was successfully completed (status is delivered/completed/paid)
    // 
    // If found → Review gets "Verified Purchase" badge ✓
    // If not found → Review is still valid, just not verified
    const hasPurchased = await Order.exists({
      userId: user._id,
      'items.productId': productId,
      status: { 
        $in: ['delivered', 'completed', 'paid'] // Order must be completed
      }
    });

    // STEP 7: Create the review
    // MongoDB will automatically prevent duplicates due to our unique index
    const review = await Review.create({
      user: user._id,
      product: productId,
      rating,
      comment: comment || '', // Optional comment
      isVerifiedPurchase: !!hasPurchased, // Convert to boolean
      isApproved: true // Auto-approve for now
    });

    // STEP 8: Populate user info for the response
    // This replaces the user ID with actual user data
    await review.populate('user', 'name email');

    // STEP 9: Recalculate product's average rating
    // We use our static method from the Review model
    const stats = await Review.calculateAverageRating(productId);
    
    // STEP 10: Update Product model with new rating statistics
    // This updates the denormalized data for fast display
    // Now product cards can show ratings without querying all reviews!
    await Product.findByIdAndUpdate(productId, {
      averageRating: stats.averageRating,
      reviewCount: stats.reviewCount
    });

    return NextResponse.json(
      { 
        success: true,
        review,
        message: 'Review submitted successfully',
        stats, // Include updated stats in response
        isVerifiedPurchase: !!hasPurchased // Let frontend know if verified
      },
      { status: 201 } // 201 = Created
    );

  } catch (error) {
    // Handle duplicate review error (unique index violation)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 409 } // 409 = Conflict
      );
    }

    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 } // 500 = Server Error
    );
  }
}

/**
 * ========================================
 * GET /api/reviews - GET ALL REVIEWS
 * ========================================
 * 
 * QUERY PARAMETERS:
 * - productId: Filter by product
 * - userId: Filter by user
 * - page: Pagination page number
 * - limit: Items per page
 * - approved: Filter by approval status (admin feature)
 * 
 * EXAMPLE:
 * GET /api/reviews?productId=123&page=1&limit=10
 */
export async function GET(request) {
  try {
    await connectDB();

    // Parse query parameters from URL
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const approvedOnly = searchParams.get('approved') !== 'false'; // Default true

    // Build query filters
    const filters = {};
    if (productId) filters.product = productId;
    if (userId) filters.user = userId;
    if (approvedOnly) filters.isApproved = true;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with population (getting related user data)
    const [reviews, total] = await Promise.all([
      Review.find(filters)
        .populate('user', 'name email') // Get user's name and email
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(limit)
        .lean(), // Convert to plain JavaScript objects (better performance)
      
      Review.countDocuments(filters) // Count total for pagination
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      reviews,
      pagination: {
        current: page,
        total: totalPages,
        hasMore: page < totalPages,
        totalReviews: total
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
