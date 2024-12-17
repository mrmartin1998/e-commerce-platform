import { NextResponse } from 'next/server';
import { requireAuth } from './auth';

export function requireAdmin(handler) {
  return requireAuth(async (request) => {
    if (!request.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    return handler(request);
  });
} 