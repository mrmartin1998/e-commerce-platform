import { NextResponse } from 'next/server';
import { Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';
import { isValidObjectId } from 'mongoose';

export const GET = requireAuth(async function(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
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
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });

  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 