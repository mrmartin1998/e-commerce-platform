import { NextResponse } from 'next/server';
import { Wishlist } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';

// DELETE /api/wishlist/clear - Clear all items from wishlist
export const DELETE = requireAuth(async function(request) {
  try {
    await connectDB();
    
    // Clear all items from user's wishlist
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: request.user._id },
      { $set: { items: [] } },
      { new: true }
    );

    if (!wishlist) {
      // Create empty wishlist if it doesn't exist
      const newWishlist = new Wishlist({
        userId: request.user._id,
        items: []
      });
      await newWishlist.save();
    }

    return NextResponse.json({
      items: [],
      count: 0,
      message: 'Wishlist cleared'
    });

  } catch (error) {
    console.error('Wishlist clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear wishlist' },
      { status: 500 }
    );
  }
});
