import { NextResponse } from 'next/server';
import { Product, Category } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requirePermission } from '@/lib/middleware/roleAuth';
import { logBulkActivity } from '@/lib/utils/activityLogger';

/**
 * POST /api/admin/products/bulk-update-category
 * Bulk update product category
 * 
 * Request Body:
 * {
 *   productIds: ['id1', 'id2', 'id3'],
 *   category: 'electronics'
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   count: 3,
 *   message: "3 products moved to Electronics"
 * }
 */
export const POST = requirePermission('bulk_update', 'Product')(async function(request) {
  try {
    await connectDB();
    
    const { productIds, category } = await request.json();
    
    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    // Verify category exists and is active
    const categoryDoc = await Category.findOne({ 
      slug: category,
      isActive: true 
    });
    
    if (!categoryDoc) {
      return NextResponse.json(
        { error: 'Invalid or inactive category' },
        { status: 400 }
      );
    }

    // Perform bulk update
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { category } }
    );

    // Log activity
    await logBulkActivity({
      userId: request.user._id,
      action: 'BULK_UPDATE',
      resource: 'Product',
      resourceIds: productIds,
      details: { 
        count: result.modifiedCount,
        field: 'category',
        newValue: categoryDoc.name
      },
      request
    });

    return NextResponse.json({
      success: true,
      count: result.modifiedCount,
      message: `${result.modifiedCount} product${result.modifiedCount !== 1 ? 's' : ''} moved to ${categoryDoc.name}`
    });

  } catch (error) {
    console.error('Bulk category update error:', error);
    return NextResponse.json(
      { error: 'Failed to update product category' },
      { status: 500 }
    );
  }
});
