import { requireAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/db/mongoose';
import bcrypt from 'bcryptjs';
import { User } from '@/lib/models';

async function handler(request) {
  if (request.method !== 'PUT') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    await connectDB();
    const { currentPassword, newPassword } = await request.json();

    // Basic validation
    if (!currentPassword || !newPassword) {
      return Response.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Get full user data including password
    const user = await User.findById(request.user._id);

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return Response.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(request.user._id, {
      password: hashedPassword,
      updatedAt: Date.now()
    });

    return Response.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(handler); 