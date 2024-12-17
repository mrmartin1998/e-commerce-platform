import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { TokenBlacklist } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import jwt from 'jsonwebtoken';

async function handler(request) {
  try {
    await connectDB();
    
    // Get the token from the Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 400 }
      );
    }

    try {
      // Verify token is valid before blacklisting
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add token to blacklist with expiration
      await TokenBlacklist.create({
        token,
        expiresAt: new Date(decoded.exp * 1000), // Convert Unix timestamp to Date
        userId: decoded.userId // Store user ID for auditing
      });

      return NextResponse.json({ 
        message: 'Logged out successfully'
      });
      
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handler); 