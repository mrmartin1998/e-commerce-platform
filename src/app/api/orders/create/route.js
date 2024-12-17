import { Order, Cart, Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';
import { NextResponse } from 'next/server';

export const POST = requireAuth(async function(request) {
  try {
    await connectDB();
    
    const { shippingAddress } = await request.json();
    
    // Get user's cart
    const cart = await Cart.findOne({ userId: request.user._id });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Verify all products are available
    for (const item of cart.items) {
      const product = await Product.findOne({
        _id: item.productId,
        status: 'published',
        stock: { $gte: item.quantity }
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not available in requested quantity` },
          { status: 400 }
        );
      }
    }

    // Create order
    const order = await Order.create({
      userId: request.user._id,
      items: cart.items,
      shippingAddress,
      subtotal: cart.subtotal
    });

    // Clear cart
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