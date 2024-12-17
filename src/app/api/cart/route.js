import { NextResponse } from 'next/server';
import { mockProducts } from '@/app/api/products/route';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/cart - Get user's cart
export const GET = requireAuth(async function(request) {
  try {
    // For testing, return a cart with a mock product
    const mockCartItem = {
      productId: mockProducts[0]._id,
      quantity: 2,
      price: mockProducts[0].price,
      name: mockProducts[0].name,
      image: mockProducts[0].image
    };

    return NextResponse.json({
      items: [mockCartItem],
      subtotal: mockCartItem.price * mockCartItem.quantity
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