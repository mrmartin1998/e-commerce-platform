import { NextResponse } from 'next/server';
import { Wishlist } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';

// DELETE /api/wishlist/remove - Remove product from wishlist
export const DELETE = requireAuth(async function(request) {
  try {
    await connectDB();
    
    const { productId } = await request.json();
    
    // Find wishlist and pull the item with matching productId
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: request.user._id },
      { $pull: { items: { productId } } },
      { new: true }
    ).populate({
      path: 'items.productId',
      select: 'name price images stock status category averageRating reviewCount'
    });

    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    // Format response
    const items = wishlist.items
      .filter(item => item.productId !== null)
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
      count: items.length,
      message: 'Product removed from wishlist'
    });

  } catch (error) {
    console.error('Wishlist remove error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
});
