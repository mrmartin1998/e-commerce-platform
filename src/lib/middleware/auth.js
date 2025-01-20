import jwt from 'jsonwebtoken';
import { User, TokenBlacklist } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function verifyAuth(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }

    // Check if token is blacklisted
    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    // Keep only this critical error log
    console.error('Auth error:', error);
    return null;
  }
}

export function requireAuth(handler) {
  return async function (request, context) {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    request.user = user;
    return handler(request, context);
  };
} 