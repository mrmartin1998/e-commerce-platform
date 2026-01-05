import { NextResponse } from 'next/server';
import { requireAuth } from './auth';

export function requireAdmin(handler) {
  return requireAuth(async (request, context) => {
    // User is already authenticated at this point
    if (!request.user.isAdmin && request.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    
    // Continue to handler
    return handler(request, context);
  });
}