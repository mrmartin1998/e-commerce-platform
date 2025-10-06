import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import Stripe from 'stripe';

let stripeClient;
function getStripeClient() {
  if (stripeClient) return stripeClient;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('Stripe secret key missing for checkout session creation');
    return null;
  }
  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

export const POST = requireAuth(async function(request) {
  try {
    await connectDB();
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processor not configured' },
        { status: 503 }
      );
    }
    const { items, shipping, shippingAddress } = await request.json();

    // Validate stock for all items
    const stockValidation = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findOne({
          _id: item.productId,
          status: 'published',
          stock: { $gte: item.quantity }
        });
        return { product, requestedQty: item.quantity };
      })
    );

    // Check if any products are out of stock
    const outOfStock = stockValidation.find(
      ({ product, requestedQty }) => !product || product.stock < requestedQty
    );

    if (outOfStock) {
      return NextResponse.json(
        { error: 'Some items are out of stock' },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Create line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          metadata: {
            productId: item.productId
          }
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

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
        productIds: JSON.stringify(items.map(item => item.productId)),
        shippingAddress: JSON.stringify(shippingAddress)
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