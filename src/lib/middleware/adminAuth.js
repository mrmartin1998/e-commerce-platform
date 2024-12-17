import { NextResponse } from 'next/server';
import { requireAuth } from './auth';

export function requireAdmin(handler) {
  return requireAuth(async (request) => {
    console.log('Checking admin status:', request.user);
    
    if (!request.user.isAdmin && request.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    return handler(request);
  });
} 