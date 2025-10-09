import { NextResponse } from 'next/server';
import { Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';

export async function GET() {
  try {
    await connectDB();
    
    const categories = await Product.distinct('category', { status: 'published' });
    
    return NextResponse.json({
      categories: categories.filter(cat => cat && cat.trim() !== '')
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
