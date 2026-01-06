import { NextResponse } from 'next/server';
import { Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAdmin } from '@/lib/middleware/adminAuth';

export const DELETE = requireAdmin(async function(request, context) {
  try {
    await connectDB();
    const params = await context.params;
    const { id } = params;
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
});

export const GET = async function(request, context) {
  try {
    await connectDB();
    const params = await context.params;
    const { id } = params;
    
    const product = await Product.findById(id).lean(); // Add .lean() here too
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
};

export const PATCH = requireAdmin(async function(request, context) {
  try {
    await connectDB();
    const params = await context.params;
    const { id } = params;
    const updates = await request.json();
    
    const product = await Product.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
    
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
});