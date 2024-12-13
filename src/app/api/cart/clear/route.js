import { Cart } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';

export const DELETE = requireAuth(async function(request) {
  try {
    await connectDB();
    
    const cart = await Cart.findOne({ userId: request.user._id });
    if (!cart) {
      return Response.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    cart.items = [];
    await cart.save();

    return Response.json({ message: 'Cart cleared successfully' });

  } catch (error) {
    console.error('Cart clear error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 