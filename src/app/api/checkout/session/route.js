import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const POST = requireAuth(async function(request) {
  try {
    const { items, shipping } = await request.json();

    // Create line items for Stripe
    const lineItems = items.map(item => {
      // Create a product object without images if the image URL is relative
      const productData = {
        name: item.name,
      };

      // Only add images if we have a valid absolute URL
      if (item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'))) {
        productData.images = [item.image];
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: productData,
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Add shipping as a line item
    if (shipping) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: shipping * 100,
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      metadata: {
        userId: request.user._id.toString(),
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}); 