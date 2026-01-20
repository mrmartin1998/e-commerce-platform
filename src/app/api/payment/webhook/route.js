import { Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import Stripe from 'stripe';
import { sendOrderConfirmation } from '@/lib/email';

let stripeClient;
function getStripeClient() {
  if (stripeClient) return stripeClient;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('Stripe secret key missing for webhook handler');
    return null;
  }
  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

export async function POST(request) {
  try {
    const stripe = getStripeClient();
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripe || !endpointSecret) {
      console.error('Stripe webhook configuration missing');
      return Response.json(
        { error: 'Payment webhook not configured' },
        { status: 503 }
      );
    }
    const payload = await request.text();
    const sig = request.headers.get('stripe-signature');

    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    await connectDB();

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const order = await Order.findOne({
          paymentIntentId: paymentIntent.id
        }).populate('userId').populate('items.productId');

        if (order) {
          order.paymentStatus = 'paid';
          order.status = 'processing';
          order.paidAt = new Date();
          await order.save();

          // Send order confirmation email
          try {
            if (order.userId && order.userId.email) {
              console.log(`📧 Sending order confirmation email for order #${order._id}`);
              await sendOrderConfirmation(order, order.userId.email);
            } else {
              console.warn(`⚠️  Cannot send email - user email not found for order #${order._id}`);
            }
          } catch (emailError) {
            // Log error but don't fail the webhook
            console.error('❌ Failed to send order confirmation email:', emailError.message);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedOrder = await Order.findOne({
          paymentIntentId: failedPayment.id
        });

        if (failedOrder) {
          failedOrder.paymentStatus = 'failed';
          await failedOrder.save();
        }
        break;
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Disable body parsing, need raw body for webhook
export const config = {
  api: {
    bodyParser: false,
  },
};