import { NextResponse } from 'next/server';
import { Product, Cart } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';

export const POST = requireAuth(async function(request) {
  try {
    await connectDB();
    const { productId, quantity = 1 } = await request.json();

    // Find product and validate
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

    // Find or create cart
    let cart = await Cart.findOne({ userId: request.user._id });
    if (!cart) {
      cart = new Cart({ 
        userId: request.user._id,
        items: []
      });
    }

    // Update cart items
    const existingItem = cart.items.find(
      item => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = product.price;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price
      });
    }

    await cart.save();

    // Format response
    const items = cart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      name: product.name,
      image: product.images?.[0]?.url || null
    }));

    return NextResponse.json({ items });

  } catch (error) {
    console.error('Cart add error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 