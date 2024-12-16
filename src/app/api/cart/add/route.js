import { NextResponse } from 'next/server';
import { mockProducts } from '@/app/api/products/route';
import { requireAuth } from '@/lib/middleware/auth';

export const POST = requireAuth(async function(request) {
  try {
    const { productId, quantity = 1 } = await request.json();

    // Find product in mock data
    const product = mockProducts.find(p => p._id === productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not available' },
        { status: 400 }
      );
    }

    // For mock data, we'll just return a success response
    // In a real app, this would save to MongoDB
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
    console.error('Cart add error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 