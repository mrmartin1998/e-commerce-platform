import { Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAdmin } from '@/lib/middleware/adminAuth';

export const GET = requireAdmin(async function(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .populate('items.productId', 'name price'),
      Order.countDocuments(query)
    ]);

    return Response.json({
      orders,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore: skip + orders.length < total
      }
    });

  } catch (error) {
    console.error('Admin orders fetch error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 