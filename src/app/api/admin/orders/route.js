import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';

export const GET = requireAuth(async function(request) {
  try {
    await connectDB();
    
    // Get pagination parameters from query
    const searchParams = new URL(request.url).searchParams;
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;
    
    // Use aggregation for single query with count and population
    const [result] = await Order.aggregate([
      {
        $facet: {
          orders: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user'
              }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
              $addFields: {
                userId: {
                  _id: '$user._id',
                  name: '$user.name',
                  email: '$user.email'
                }
              }
            },
            { $project: { user: 0 } }
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
        total,
        pages: Math.ceil(total / limit),
        current: page
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to get orders' },
      { status: 500 }
    );
  }
}); 