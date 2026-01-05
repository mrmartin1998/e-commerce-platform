import { NextResponse } from 'next/server';
import { Category, Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import mongoose from 'mongoose';

// GET /api/admin/categories/[id] - Get single category
export const GET = requireAdmin(async function(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const category = await Category.findById(id)
      .populate('parentCategory', 'name slug')
      .populate('createdBy', 'name email');

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Get product count
    const productCount = await Product.countDocuments({ 
      category: category.slug 
    });

    // Get child categories
    const childCategories = await Category.find({ 
      parentCategory: category._id 
    }).select('name slug isActive');

    return NextResponse.json({
      category: {
        ...category.toObject(),
        metadata: {
          ...category.metadata,
          productCount
        }
      },
      childCategories
    });

  } catch (error) {
    console.error('Category fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
});

// PUT /api/admin/categories/[id] - Update category
export const PUT = requireAdmin(async function(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const updateData = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // If updating name, check for duplicates
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name slug');

    return NextResponse.json({
      category: updatedCategory.toObject(),
      message: 'Category updated successfully'
    });

  } catch (error) {
    console.error('Category update error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Category name or slug already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
});

// DELETE /api/admin/categories/[id] - Delete category
export const DELETE = requireAdmin(async function(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ 
      category: category.slug 
    });
    
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${productCount} products. Please move products to another category first.` },
        { status: 400 }
      );
    }

    // Check if category has child categories
    const childCount = await Category.countDocuments({ 
      parentCategory: id 
    });
    
    if (childCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${childCount} subcategories. Please delete or move subcategories first.` },
        { status: 400 }
      );
    }

    // Delete category
    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Category deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
});
