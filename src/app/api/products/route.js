import { NextResponse } from 'next/server';
import { Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import { verifyAuth } from '@/lib/middleware/auth';

export async function GET(request) {
  try {
    await connectDB();
    
    // Check if user is admin using existing auth
    const user = await verifyAuth(request);
    const isAdmin = user?.isAdmin || user?.role === 'admin';
    
    // Query based on user role
    const query = isAdmin ? {} : { status: 'published' };
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .select('-__v');
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export const POST = requireAdmin(async function(request) {
  try {
    await connectDB();
    
    const productData = await request.json();
    
    // Basic validation
    if (!productData.name || !productData.price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }

    const product = await Product.create({
      ...productData,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return NextResponse.json({ product }, { status: 201 });

  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});