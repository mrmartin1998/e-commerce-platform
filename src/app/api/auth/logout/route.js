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
      return Response.json(
        { error: 'No token provided' },
        { status: 400 }
      );
    }

    // Decode token to get expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add token to blacklist
    await TokenBlacklist.create({
      token,
      expiresAt: new Date(decoded.exp * 1000) // Convert Unix timestamp to Date
    });

    return Response.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handler); 