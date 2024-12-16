import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';

export const DELETE = requireAuth(async function(request) {
  try {
    const { productId } = await request.json();
    
    // For mock data, just return empty items array
    return NextResponse.json({
      items: []
    });

  } catch (error) {
    console.error('Cart remove error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 