import { NextResponse } from 'next/server';
import { Wishlist, Cart, Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';

// POST /api/wishlist/move-to-cart - Move product from wishlist to cart
export const POST = requireAuth(async function(request) {
  try {
    await connectDB();
    
    const { productId } = await request.json();

    // Validate product exists and is available
    const product = await Product.findOne({ 
      _id: productId,
      status: 'published',
      stock: { $gte: 1 }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not available' },
        { status: 400 }
      );
    }

    // Remove from wishlist
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

    // Add to cart
    let cart = await Cart.findOne({ userId: request.user._id });
    
    if (!cart) {
      cart = new Cart({ 
        userId: request.user._id,
        items: []
      });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(
      item => item.productId.toString() === productId
    );

    if (existingItem) {
      // Increment quantity if already in cart
      existingItem.quantity += 1;
      existingItem.price = product.price;
    } else {
      // Add new item to cart
      cart.items.push({
        productId,
        quantity: 1,
        price: product.price
      });
    }

    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: 'items.productId',
      select: 'name images price'
    });

    // Format wishlist response
    const wishlistItems = wishlist.items
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

    // Format cart response
    const cartItems = cart.items.map(item => ({
      productId: item.productId?._id || item.productId,
      quantity: item.quantity,
      price: item.price,
      name: item.productId?.name || 'Product Not Found',
      image: item.productId?.images?.[0]?.url || null
    }));

    return NextResponse.json({
      wishlist: {
        items: wishlistItems,
        count: wishlistItems.length
      },
      cart: {
        items: cartItems,
        count: cartItems.length
      },
      message: 'Product moved to cart'
    });

  } catch (error) {
    console.error('Move to cart error:', error);
    return NextResponse.json(
      { error: 'Failed to move product to cart' },
      { status: 500 }
    );
  }
});
