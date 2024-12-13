import { Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/orders - Get user's orders
async function getHandler(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    const skip = (page - 1) * limit;
    
    const orders = await Order
      .find({ userId: request.user._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('items.productId', 'name images');

    const total = await Order.countDocuments({ userId: request.user._id });

    return Response.json({
      orders,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore: skip + orders.length < total
      }
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler); 