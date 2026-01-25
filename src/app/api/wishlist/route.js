import { NextResponse } from 'next/server';
import { Wishlist, Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/wishlist - Get user's wishlist
export const GET = requireAuth(async function(request) {
  try {
    await connectDB();
    
    // Find wishlist and populate product details
    const wishlist = await Wishlist.findOne({ userId: request.user._id })
      .populate({
        path: 'items.productId',
        select: 'name price images stock status category averageRating reviewCount'
      })
      .lean();

    if (!wishlist) {
      // If no wishlist exists, return empty wishlist
      return NextResponse.json({
        items: [],
        count: 0
      });
    }

    // Format response to match frontend expectations
    // Filter out products that are null (deleted) and mark unavailable ones
    const items = wishlist.items
      .filter(item => item.productId !== null) // Remove deleted products
      .map(item => {
        const product = item.productId;
        const isAvailable = product.status === 'published' && product.stock > 0;
        
        return {
          productId: product._id,
          addedAt: item.addedAt,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url || null,
          stock: product.stock,
          status: product.status,
          category: product.category,
          averageRating: product.averageRating || 0,
          reviewCount: product.reviewCount || 0,
          isAvailable
        };
      });

    return NextResponse.json({
      items,
      count: items.length
    });

  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
});
