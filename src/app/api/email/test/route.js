/**
 * Email Testing API Endpoint
 * 
 * This endpoint allows you to test email templates in development.
 * Send a POST request with the email type to test.
 * 
 * DEVELOPMENT ONLY - All emails go to EMAIL_TEST_RECIPIENT
 * 
 * Usage:
 * POST /api/email/test
 * Body: { "type": "confirmation" | "processing" | "shipped" | "delivered" | "cancelled" }
 * 
 * Example:
 * curl -X POST http://localhost:3000/api/email/test -H "Content-Type: application/json" -d '{"type":"confirmation"}'
 */

import { 
  sendOrderConfirmation, 
  sendOrderProcessing, 
  sendOrderShipped, 
  sendOrderDelivered, 
  sendOrderCancelled 
} from '@/lib/email';

/**
 * Mock order data for testing email templates
 * This represents a typical order with all the fields the templates need
 */
const mockOrder = {
  _id: '507f1f77bcf86cd799439011',
  createdAt: new Date(),
  updatedAt: new Date(),
  status: 'processing',
  
  // Items with populated product data
  items: [
    {
      productId: {
        _id: '507f1f77bcf86cd799439012',
        name: 'Premium Wireless Headphones',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
        price: 149.99
      },
      quantity: 1,
      price: 149.99
    },
    {
      productId: {
        _id: '507f1f77bcf86cd799439013',
        name: 'Smart Watch Series 5',
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
        price: 299.99
      },
      quantity: 2,
      price: 299.99
    }
  ],
  
  // Pricing
  subtotal: 749.97,
  tax: 67.50,
  shipping: 12.00,
  total: 829.47,
  
  // Shipping info
  shippingAddress: {
    street: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'United States'
  },
  
  // Shipping tracking (for shipped/delivered emails)
  carrier: 'UPS',
  trackingNumber: 'UPS1234567890',
  trackingUrl: 'https://www.ups.com/track?tracknum=UPS1234567890',
  estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  
  // User info
  userId: {
    _id: '507f1f77bcf86cd799439014',
    name: 'John Doe',
    email: process.env.EMAIL_TEST_RECIPIENT || 'test@example.com'
  }
};

export async function POST(request) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return Response.json(
        { error: 'This endpoint is only available in development mode' },
        { status: 403 }
      );
    }

    // Check if required environment variables are set
    if (!process.env.RESEND_API_KEY) {
      return Response.json(
        { error: 'RESEND_API_KEY not configured in .env.local' },
        { status: 500 }
      );
    }

    if (!process.env.EMAIL_TEST_RECIPIENT) {
      return Response.json(
        { error: 'EMAIL_TEST_RECIPIENT not configured in .env.local' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { type } = body;

    const customerEmail = mockOrder.userId.email;

    console.log(`\n🧪 Testing ${type} email...`);
    console.log(`📧 Sending to: ${process.env.EMAIL_TEST_RECIPIENT}`);

    // Send the appropriate email based on type
    switch (type) {
      case 'confirmation':
        await sendOrderConfirmation(mockOrder, customerEmail);
        break;
      
      case 'processing':
        await sendOrderProcessing(mockOrder, customerEmail);
        break;
      
      case 'shipped':
        await sendOrderShipped(mockOrder, customerEmail);
        break;
      
      case 'delivered':
        await sendOrderDelivered(mockOrder, customerEmail);
        break;
      
      case 'cancelled':
        await sendOrderCancelled(mockOrder, customerEmail);
        break;
      
      default:
        return Response.json(
          { 
            error: 'Invalid email type. Use: confirmation, processing, shipped, delivered, or cancelled' 
          },
          { status: 400 }
        );
    }

    return Response.json({
      success: true,
      message: `Test ${type} email sent successfully`,
      recipient: process.env.EMAIL_TEST_RECIPIENT,
      orderData: {
        orderId: mockOrder._id,
        total: mockOrder.total,
        items: mockOrder.items.length
      }
    });

  } catch (error) {
    console.error('❌ Error testing email:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to see available test options
 */
export async function GET() {
  return Response.json({
    message: 'Email Testing Endpoint',
    usage: 'POST /api/email/test with JSON body',
    availableTypes: [
      'confirmation',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    ],
    example: {
      method: 'POST',
      body: { type: 'confirmation' }
    },
    note: 'All emails will be sent to EMAIL_TEST_RECIPIENT configured in .env.local'
  });
}
