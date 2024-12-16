import { NextResponse } from 'next/server';

// Export the mock data
export const mockProducts = [
  {
    _id: '1',
    name: 'Product 1',
    description: 'This is a description for product 1',
    price: 99.99,
    image: '/images/placeholder.png'
  },
  {
    _id: '2',
    name: 'Product 2', 
    description: 'This is a description for product 2',
    price: 149.99,
    image: '/images/placeholder.png'
  },
  {
    _id: '3',
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 199.99,
    image: '/images/placeholder.png'
  },
  {
    _id: '4', 
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with health tracking capabilities',
    price: 299.99,
    image: '/images/placeholder.png'
  },
  {
    _id: '5',
    name: 'Laptop Backpack',
    description: 'Durable laptop backpack with multiple compartments',
    price: 79.99,
    image: '/images/placeholder.png'
  },
  {
    _id: '6',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe',
    price: 129.99,
    image: '/images/placeholder.png'
  }
];

export async function GET() {
  try {
    // Later we'll fetch from MongoDB
    return NextResponse.json({ products: mockProducts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
/*
export const POST = requireAdmin(async function(request) {
  try {
    await connectDB();
    
    const productData = await request.json();
    
    // Basic validation
    if (!productData.name || !productData.price || !productData.category) {
      return Response.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const product = await Product.create({
      ...productData,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return Response.json({ product }, { status: 201 });

  } catch (error) {
    console.error('Product creation error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

*/