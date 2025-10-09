import { NextResponse } from 'next/server';
import { Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import { verifyAuth } from '@/lib/middleware/auth';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = 12;

    // Check if user is admin
    const user = await verifyAuth(request);
    const isAdmin = user?.isAdmin || user?.role === 'admin';
    
    // Build search criteria
    const criteria = isAdmin ? {} : { status: 'published' };
    
    // Add search query
    if (query) {
      criteria.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Add filters
    if (category) {
      criteria.category = category;
    }
    
    if (minPrice || maxPrice) {
      criteria.price = {};
      if (minPrice) criteria.price.$gte = parseFloat(minPrice);
      if (maxPrice) criteria.price.$lte = parseFloat(maxPrice);
    }
    
    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const products = await Product.find(criteria)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    const total = await Product.countDocuments(criteria);
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({ 
      products,
      pagination: {
        current: page,
        total: totalPages,
        hasMore: page < totalPages,
        totalProducts: total
      }
    });
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