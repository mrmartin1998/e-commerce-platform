import { User } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';
import { NextResponse } from 'next/server';

// GET /api/users/profile
export const GET = requireAuth(async function(request) {
  try {
    // Use the user object from auth middleware
    return NextResponse.json({ user: request.user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT /api/users/profile
export const PUT = requireAuth(async function(request) {
  try {
    await connectDB();
    
    const updates = await request.json();
    
    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates.refreshToken;

    const user = await User.findByIdAndUpdate(
      request.user._id,
      { ...updates, updatedAt: Date.now() },
      { new: true }
    ).select('-password -refreshToken');

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 