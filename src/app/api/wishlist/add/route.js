import { NextResponse } from 'next/server';
import { Wishlist, Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';

// POST /api/wishlist/add - Add product to wishlist
export const POST = requireAuth(async function(request) {
  try {
    await connectDB();
    
    const { productId } = await request.json();

    // Validate product exists and is published
    const product = await Product.findOne({ 
      _id: productId,
      status: 'published'
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or not available' },
        { status: 404 }
      );
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ userId: request.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({ 
        userId: request.user._id,
        items: []
      });
    }

    // Check if product already in wishlist
    const existingItem = wishlist.items.find(
      item => item.productId.toString() === productId
    );

    if (existingItem) {
      return NextResponse.json(
        { error: 'Product already in wishlist' },
        { status: 400 }
      );
    }

    // Add product to wishlist
    wishlist.items.push({
      productId,
      addedAt: new Date()
    });

    await wishlist.save();

    // Populate and return updated wishlist
    await wishlist.populate({
      path: 'items.productId',
      select: 'name price images stock status category averageRating reviewCount'
    });

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
      message: 'Product added to wishlist'
    });

  } catch (error) {
    console.error('Wishlist add error:', error);
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
});
