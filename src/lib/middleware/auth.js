import jwt from 'jsonwebtoken';
import { User, TokenBlacklist } from '@/lib/models';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';

export async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.replace('Bearer ', '').trim();
    
    // Check if token is valid (not empty, null, or too short)
    if (!token || token === 'null' || token === 'undefined' || token.length < 10) {
      return null;
    }

    await connectDB(); // Single connection point

    // Check if token is blacklisted
    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    // Silently handle auth errors - don't log for invalid/missing tokens
    return null;
  }
}

export async function requireAuth(request) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  return user;
}