import { User } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/users/profile
export const GET = requireAuth(async function(request) {
  try {
    await connectDB();
    
    const user = await User
      .findById(request.user._id)
      .select('-password -refreshToken');

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json({ user });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return Response.json(
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

    return Response.json({ user });

  } catch (error) {
    console.error('Profile update error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 