import { requireAuth } from '@/lib/middleware/auth';

export const GET = requireAuth(async function(request) {
  try {
    return Response.json({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Payment config fetch error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 