import { Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const GET = requireAuth(async function getHandler(request) {
  try {
    await connectDB();
    
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

    console.log('Session:', JSON.stringify({
      id: session.id,
      metadata: session.metadata,
      line_items: session.line_items.data
    }, null, 2));

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
        // Get productId from the metadata array instead of line item
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

    // Validate we have items
    if (!orderItems.length) {
      return NextResponse.json(
        { error: 'No valid items found in checkout session' },
        { status: 400 }
      );
    }

    const order = await Order.create({
      userId: request.user._id,
      items: orderItems,
      subtotal: session.amount_subtotal / 100,
      tax: (session.amount_total - session.amount_subtotal) / 100,
      total: session.amount_total / 100,
      paymentStatus: session.payment_status,
      paymentIntentId: session.payment_intent,
      paidAt: new Date()
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}); 