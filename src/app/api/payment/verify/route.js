import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const GET = requireAuth(async function(request) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items']
    });
    
    // Verify that this session belongs to the current user
    if (session.metadata.userId !== request.user._id.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Return order details
    return NextResponse.json({
      orderId: session.id,
      total: session.amount_total / 100,
      items: session.line_items?.data.map(item => ({
        name: item.description,
        quantity: item.quantity,
        price: item.price.unit_amount / 100
      }))
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: 'Payment verification failed: Invalid session' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}); 