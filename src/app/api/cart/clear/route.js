import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';

export const DELETE = requireAuth(async function(request) {
  try {
    // For mock data, just return empty items array
    return NextResponse.json({
      items: []
    });

  } catch (error) {
    console.error('Cart clear error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 