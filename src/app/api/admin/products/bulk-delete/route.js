import { NextResponse } from 'next/server';
import { Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAdmin } from '@/lib/middleware/adminAuth';

/**
 * POST /api/admin/products/bulk-delete
 * Bulk delete multiple products
 * 
 * Request Body:
 * {
 *   productIds: ['id1', 'id2', 'id3']
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   count: 3,
 *   message: "3 products deleted successfully"
 * }
 */
export const POST = requireAdmin(async function(request) {
  try {
    await connectDB();
    
    const { productIds } = await request.json();
    
    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      );
    }

    // Perform bulk delete
    const result = await Product.deleteMany({
      _id: { $in: productIds }
    });

    return NextResponse.json({
      success: true,
      count: result.deletedCount,
      message: `${result.deletedCount} product${result.deletedCount !== 1 ? 's' : ''} deleted successfully`
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete products' },
      { status: 500 }
    );
  }
});
