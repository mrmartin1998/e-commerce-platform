import { NextResponse } from 'next/server';
import { Product, Cart } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';

export const PUT = requireAuth(async function(request) {
  try {
    await connectDB();
    const { productId, quantity } = await request.json();

    // Validate product
    const product = await Product.findOne({ 
      _id: productId,
      status: 'published',
      stock: { $gte: quantity }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not available' },
        { status: 400 }
      );
    }

    // Update cart
    const cart = await Cart.findOneAndUpdate(
      { 
        userId: request.user._id,
        'items.productId': productId 
      },
      { 
        $set: { 
          'items.$.quantity': quantity,
          'items.$.price': product.price
        }
      },
      { new: true }
    ).populate({
      path: 'items.productId',
      select: 'name images price'
    });

    if (!cart) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Format response
    const items = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.price,
      name: item.productId.name,
      image: item.productId?.images?.[0]?.url || null
    }));

    return NextResponse.json({ items });

  } catch (error) {
    console.error('Cart update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 