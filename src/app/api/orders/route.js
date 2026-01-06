import { Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';
import { NextResponse } from 'next/server';

// GET /api/orders - Get user's orders
export const GET = requireAuth(async function getHandler(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Use aggregation for single query with count
    const [result] = await Order.aggregate([
      { $match: { userId: request.user._id } },
      {
        $facet: {
          orders: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'products',
                localField: 'items.productId',
                foreignField: '_id',
                as: 'populatedProducts'
              }
            }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ]);

    const orders = result.orders || [];
    const total = result.totalCount[0]?.count || 0;

    return NextResponse.json({
      orders,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore: skip + orders.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 