import { Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';

export const GET = requireAuth(async function(request) {
  try {
    await connectDB();
    
    const orders = await Order
      .find({ 
        userId: request.user._id,
        status: { $in: ['delivered', 'cancelled'] }
      })
      .sort('-createdAt')
      .populate('items.productId', 'name images');

    return Response.json({ orders });

  } catch (error) {
    console.error('Order history fetch error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 