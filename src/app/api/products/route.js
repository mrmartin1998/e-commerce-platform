import { Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const sort = searchParams.get('sort') || '-createdAt';
    
    const skip = (page - 1) * limit;
    
    const products = await Product
      .find({ status: 'published' })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-ratings');

    const total = await Product.countDocuments({ status: 'published' });
    
    return Response.json({
      products,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore: skip + products.length < total
      }
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 