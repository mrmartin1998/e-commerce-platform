import { Order, Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import mongoose from 'mongoose';

let stripeClient;
function getStripeClient() {
  if (stripeClient) return stripeClient;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('Stripe secret key missing for payment verification');
    return null;
  }
  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

export const GET = requireAuth(async function getHandler(request) {
  try {
    await connectDB();
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processor not configured' },
        { status: 503 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items']
    });

    // Get product IDs from metadata
    const productIds = JSON.parse(session.metadata.productIds || '[]');
    if (!productIds.length || productIds.some(id => !id)) {
      console.error('Invalid product IDs in metadata:', session.metadata.productIds);
      return NextResponse.json(
        { error: 'Invalid product IDs in checkout session' },
        { status: 400 }
      );
    }

    // Create order items array, excluding shipping
    const orderItems = session.line_items.data
      .filter(item => !item.description?.toLowerCase().includes('shipping'))
      .map((item, index) => {
        const productId = productIds[index];
        if (!productId) {
          throw new Error(`Missing product ID for item ${index}`);
        }
        return {
          productId,
          quantity: item.quantity,
          price: item.amount_total / 100,
          name: item.description || `Product ${index + 1}`
        };
      });

    if (!orderItems.length) {
      return NextResponse.json(
        { error: 'No valid items found in checkout session' },
        { status: 400 }
      );
    }

    // Start a MongoDB transaction
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
      // Update product stock and create order atomically
      await Promise.all(
        orderItems.map(async (item) => {
          const result = await Product.findOneAndUpdate(
            {
              _id: item.productId,
              stock: { $gte: item.quantity }
            },
            {
              $inc: { stock: -item.quantity },
              $set: {
                status: await Product.findOne({ _id: item.productId }).then(product => 
                  (product.stock - item.quantity) <= 0 ? 'outOfStock' : 'published'
                )
              }
            },
            { session: mongoSession, new: true }
          );

          if (!result) {
            throw new Error(`Failed to update stock for product ${item.productId}`);
          }
        })
      );

      // Create order
      const order = await Order.create([{
        userId: request.user._id,
        items: orderItems,
        subtotal: session.amount_subtotal / 100,
        tax: (session.amount_total - session.amount_subtotal) / 100,
        total: session.amount_total / 100,
        paymentStatus: session.payment_status,
        paymentIntentId: session.payment_intent,
        shippingAddress: JSON.parse(session.metadata.shippingAddress),
        paidAt: new Date()
      }], { session: mongoSession });

      // Commit transaction
      await mongoSession.commitTransaction();
      return NextResponse.json(order[0]);

    } catch (error) {
      // If anything fails, rollback the transaction
      await mongoSession.abortTransaction();
      throw error;
    } finally {
      mongoSession.endSession();
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
});