import { Cart, Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';

export const PUT = requireAuth(async function(request) {
  try {
    await connectDB();
    
    const { productId, quantity } = await request.json();
    
    if (quantity < 0) {
      return Response.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      );
    }

    // Verify product stock
    const product = await Product.findOne({ 
      _id: productId,
      status: 'published',
      stock: { $gte: quantity }
    });

    if (!product) {
      return Response.json(
        { error: 'Product not available in requested quantity' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId: request.user._id });
    if (!cart) {
      return Response.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return Response.json(
        { error: 'Item not in cart' },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].price = product.price;
    }

    await cart.save();
    return Response.json(cart);

  } catch (error) {
    console.error('Cart update error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 