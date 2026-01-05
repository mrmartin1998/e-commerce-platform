import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { User } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';

// Add this new function to verify authentication without requiring it
export async function verifyAuth(request) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : null;
    
    // Check for token in cookie as fallback
    const cookies = request.cookies;
    const cookieToken = cookies.get('token')?.value;
    
    // Use either token source
    const authToken = token || cookieToken;

    if (!authToken) {
      return null;
    }

    // Verify token
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    
    // Connect to database
    await connectDB();
    
    // Get user from database
    const user = await User.findById(decoded.userId).lean();
    
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export function requireAuth(handler) {
  return async (request, context) => {
    try {
      // Extract token from Authorization header
      const authHeader = request.headers.get('Authorization');
      const token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : null;
      
      // Check for token in cookie as fallback
      const cookies = request.cookies;
      const cookieToken = cookies.get('token')?.value;
      
      // Use either token source
      const authToken = token || cookieToken;

      if (!authToken) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Verify token
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
      
      // Connect to database
      await connectDB();
      
      // Get user from database
      const user = await User.findById(decoded.userId).lean();
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        );
      }

      // Add user to request
      request.user = user;
      
      // Continue to handler
      return handler(request, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}