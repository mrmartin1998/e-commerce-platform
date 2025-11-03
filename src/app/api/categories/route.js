import { NextResponse } from 'next/server';
import { Category, Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';

// GET /api/categories - Public endpoint for active categories
export async function GET(request) {
  try {
    await connectDB();
    
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name slug')
      .sort({ sortOrder: 1, name: 1 });

    // Add product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          category: category.slug,
          status: 'published' // Only count published products for public API
        });
        
        return {
          ...category.toObject(),
          metadata: {
            ...category.metadata,
            productCount
          }
        };
      })
    );

    return NextResponse.json({ 
      categories: categoriesWithCount,
      total: categoriesWithCount.length 
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
