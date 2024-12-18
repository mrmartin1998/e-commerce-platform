import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';

// GET single order
export const GET = requireAuth(async function getHandler(request, context) {
  try {
    await connectDB();
    
    const orderId = context.params.orderId;
    
    const order = await Order.findById(orderId)
      .populate('userId', 'name email')
      .populate('items.productId', 'name price images');
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to get order' },
      { status: 500 }
    );
  }
});

// PATCH update order status
export const PATCH = requireAuth(async function patchHandler(request, context) {
  try {
    await connectDB();
    
    const orderId = context.params.orderId;
    const { status } = await request.json();
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('userId', 'name email');
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}); 