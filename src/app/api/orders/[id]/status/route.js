import { Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import { isValidObjectId } from 'mongoose';

export const PUT = requireAdmin(async function(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    if (!isValidObjectId(id)) {
      return Response.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const { status } = await request.json();
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return Response.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { 
        status,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!order) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return Response.json({ order });

  } catch (error) {
    console.error('Order status update error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 