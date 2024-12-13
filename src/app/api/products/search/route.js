import { Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    if (!query) {
      return Response.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;
    
    const products = await Product
      .find(
        { 
          $text: { $search: query },
          status: 'published'
        },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ 
      $text: { $search: query },
      status: 'published'
    });

    return Response.json({
      products,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore: skip + products.length < total
      }
    });

  } catch (error) {
    console.error('Product search error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 