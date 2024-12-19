import { Order, Cart } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';
import { NextResponse } from 'next/server';

export const POST = requireAuth(async function(request) {
  try {
    await connectDB();
    
    const { shippingAddress } = await request.json();
    
    // Validate shipping address
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.country) {
      return NextResponse.json(
        { error: 'Invalid shipping address' },
        { status: 400 }
      );
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId: request.user._id });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Create order with shipping address
    const order = await Order.create({
      userId: request.user._id,
      items: cart.items,
      shippingAddress,
      subtotal: cart.subtotal,
      shipping: 10, // Fixed shipping cost
      total: cart.subtotal + 10,
      status: 'pending'
    });

    // Clear cart after order creation
    await Cart.findByIdAndDelete(cart._id);

    return NextResponse.json({ order }, { status: 201 });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 