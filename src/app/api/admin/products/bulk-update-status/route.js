import { NextResponse } from 'next/server';
import { Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requirePermission } from '@/lib/middleware/roleAuth';
import { logBulkActivity } from '@/lib/utils/activityLogger';

/**
 * POST /api/admin/products/bulk-update-status
 * Bulk update product status (draft/published)
 * 
 * Request Body:
 * {
 *   productIds: ['id1', 'id2', 'id3'],
 *   status: 'published' | 'draft'
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   count: 3,
 *   message: "3 products updated to published"
 * }
 */
export const POST = requirePermission('bulk_update', 'Product')(async function(request) {
  try {
    await connectDB();
    
    const { productIds, status } = await request.json();
    
    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      );
    }

    if (!status || !['draft', 'published'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (draft or published) is required' },
        { status: 400 }
      );
    }

    // Perform bulk update
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { status } }
    );

    // Log activity
    await logBulkActivity({
      userId: request.user._id,
      action: 'BULK_UPDATE',
      resource: 'Product',
      resourceIds: productIds,
      details: { 
        count: result.modifiedCount,
        field: 'status',
        newValue: status
      },
      request
    });

    return NextResponse.json({
      success: true,
      count: result.modifiedCount,
      message: `${result.modifiedCount} product${result.modifiedCount !== 1 ? 's' : ''} updated to ${status}`
    });

  } catch (error) {
    console.error('Bulk status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update product status' },
      { status: 500 }
    );
  }
});
