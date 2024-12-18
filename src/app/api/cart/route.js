import { NextResponse } from 'next/server';
import { Cart, Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/cart - Get user's cart
export const GET = requireAuth(async function(request) {
  try {
    await connectDB();
    
    // Get user's cart with populated product details
    const cart = await Cart.findOne({ userId: request.user._id })
      .populate('items.productId', 'name image');

    if (!cart) {
      return NextResponse.json({ items: [], subtotal: 0 });
    }

    // Format response to match frontend expectations
    const items = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.price,
      name: item.productId.name,
      image: item.productId.image
    }));

    return NextResponse.json({
      items,
      subtotal: cart.subtotal
    });

  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/cart/add - Add item to cart
async function postHandler(request) {
  try {
    await connectDB();
    
    const { productId, quantity = 1 } = await request.json();

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

    // Find or create cart
    let cart = await Cart.findOne({ userId: request.user._id });
    
    if (!cart) {
      cart = new Cart({ 
        userId: request.user._id,
        items: []
      });
    }

    // Check if product already in cart
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
    
    return NextResponse.json(cart);

  } catch (error) {
    console.error('Cart add error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(postHandler); 