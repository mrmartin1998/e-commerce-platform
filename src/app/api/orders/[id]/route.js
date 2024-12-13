import { Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';
import { isValidObjectId } from 'mongoose';

export const GET = requireAuth(async function(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    if (!isValidObjectId(id)) {
      return Response.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const order = await Order
      .findOne({ 
        _id: id,
        userId: request.user._id
      })
      .populate('items.productId', 'name images price');

    if (!order) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return Response.json({ order });

  } catch (error) {
    console.error('Order fetch error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 