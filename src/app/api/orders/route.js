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

    console.log('Searching for orders with:', {
      userId: request.user._id,
      skip,
      limit
    });

    const orders = await Order.find({ userId: request.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.productId');

    const total = await Order.countDocuments({ userId: request.user._id });

    console.log('Found orders:', orders);
    console.log('Total count:', total);

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