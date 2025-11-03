import { NextResponse } from 'next/server';
import { Category, Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAdmin } from '@/lib/middleware/adminAuth';

// GET /api/admin/categories - List all categories
export const GET = requireAdmin(async function(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    const query = includeInactive ? {} : { isActive: true };
    
    const categories = await Category.find(query)
      .populate('parentCategory', 'name slug')
      .sort({ sortOrder: 1, name: 1 });

    // Add product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          category: category.slug,
          status: 'published'
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
});

// POST /api/admin/categories - Create new category
export const POST = requireAdmin(async function(request) {
  try {
    await connectDB();
    
    const categoryData = await request.json();
    
    // Validate required fields
    if (!categoryData.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Clean up parentCategory - convert empty string to null
    if (categoryData.parentCategory === '' || categoryData.parentCategory === undefined) {
      categoryData.parentCategory = null;
    }

    // Generate slug manually if needed (pre-save hook should handle this)
    if (!categoryData.slug) {
      categoryData.slug = categoryData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Check for duplicate name
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${categoryData.name}$`, 'i') }
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existingSlug = await Category.findOne({
      slug: categoryData.slug
    });
    
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Category with this URL name already exists' },
        { status: 400 }
      );
    }

    // Create category
    const category = await Category.create({
      ...categoryData,
      createdBy: request.user._id
    });

    // Populate parent category for response
    await category.populate('parentCategory', 'name slug');

    return NextResponse.json({ 
      category: category.toObject(),
      message: 'Category created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Category creation error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Category name or slug already exists' },
        { status: 400 }
      );
    }
    
    // Handle validation errors more specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: `Validation failed: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
});
