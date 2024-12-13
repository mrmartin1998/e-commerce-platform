import { Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const POST = requireAuth(async function(request) {
  try {
    await connectDB();
    
    const { orderId } = await request.json();
    
    const order = await Order
      .findOne({ 
        _id: orderId,
        userId: request.user._id,
        status: 'pending',
        paymentStatus: 'pending'
      })
      .populate('items.productId');

    if (!order) {
      return Response.json(
        { error: 'Order not found or already paid' },
        { status: 404 }
      );
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: request.user._id.toString()
      }
    });

    // Update order with payment intent
    order.paymentIntentId = paymentIntent.id;
    await order.save();

    return Response.json({
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 