import { NextResponse } from 'next/server';
import { Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';

export async function GET(request) {
  try {
    await connectDB();
    
    // Get distinct categories from products
    const categories = await Product.distinct('category', { 
      status: 'published',
      category: { $ne: null, $ne: '' }
    });
    
    return NextResponse.json({ 
      categories: categories.filter(Boolean).sort()
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
