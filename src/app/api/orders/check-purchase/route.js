/**
 * CHECK PURCHASE API
 * 
 * This endpoint checks if a user has purchased a specific product.
 * Used to verify users before allowing them to write reviews.
 * 
 * WHY THIS EXISTS:
 * - Only customers who bought a product should review it
 * - Prevents fake/spam reviews from non-customers
 * - Standard e-commerce best practice
 * 
 * USAGE:
 * GET /api/orders/check-purchase?productId=abc123
 * 
 * RESPONSE:
 * {
 *   hasPurchased: true/false
 * }
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Order } from '@/lib/models';
import { verifyAuth } from '@/lib/middleware/auth';

export async function GET(request) {
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

    // STEP 2: Get productId from query parameters
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // STEP 3: Check if user has purchased this product
    // Look for orders that:
    // 1. Belong to this user
    // 2. Contain this product
    // 3. Are completed/delivered (not pending or cancelled)
    const hasPurchased = await Order.exists({
      userId: user.userId,
      'items.productId': productId,
      status: { 
        $in: ['delivered', 'completed', 'paid'] 
      }
    });

    // STEP 4: Return result
    return NextResponse.json({
      hasPurchased: !!hasPurchased // Convert to boolean
    });

  } catch (error) {
    console.error('Error checking purchase:', error);
    return NextResponse.json(
      { error: 'Failed to check purchase status' },
      { status: 500 }
    );
  }
}
