import { NextResponse } from 'next/server';
import { Cart } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';

export const DELETE = requireAuth(async function(request) {
  try {
    await connectDB();
    
    const { productId } = await request.json();
    
    // Find cart and pull the item with matching productId
    const cart = await Cart.findOneAndUpdate(
      { userId: request.user._id },
      { $pull: { items: { productId } } },
      { new: true }
    ).populate('items.productId', 'name images price');

    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Format response
    const items = cart.items.map(item => ({
      productId: item.productId?._id || item.productId,
      quantity: item.quantity,
      price: item.price,
      name: item.productId?.name || 'Product Not Found',
      image: item.productId?.images?.[0] || null
    }));

    return NextResponse.json({ items });

  } catch (error) {
    console.error('Cart remove error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 