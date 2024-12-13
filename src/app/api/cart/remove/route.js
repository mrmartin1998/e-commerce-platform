import { Cart } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';

export const DELETE = requireAuth(async function(request) {
  try {
    await connectDB();
    
    const { productId } = await request.json();
    
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

    cart.items.splice(itemIndex, 1);
    await cart.save();

    return Response.json(cart);

  } catch (error) {
    console.error('Cart remove error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 