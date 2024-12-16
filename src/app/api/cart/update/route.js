import { NextResponse } from 'next/server';
import { mockProducts } from '@/app/api/products/route';
import { requireAuth } from '@/lib/middleware/auth';

export const PUT = requireAuth(async function(request) {
  try {
    const { productId, quantity } = await request.json();

    // Find product in mock data
    const product = mockProducts.find(p => p._id === productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not available' },
        { status: 400 }
      );
    }

    // Return mock response with updated quantity
    return NextResponse.json({
      items: [{
        productId,
        quantity,
        price: product.price,
        name: product.name,
        image: product.image
      }]
    });

  } catch (error) {
    console.error('Cart update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 