import { User } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';
import { isValidObjectId } from 'mongoose';

// PUT /api/users/addresses/[id]
export const PUT = requireAuth(async function(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    if (!isValidObjectId(id)) {
      return Response.json(
        { error: 'Invalid address ID' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    const user = await User.findById(request.user._id);
    
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === id
    );

    if (addressIndex === -1) {
      return Response.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    // Update address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      ...updates
    };

    await user.save();
    return Response.json({ address: user.addresses[addressIndex] });

  } catch (error) {
    console.error('Address update error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/users/addresses/[id]
export const DELETE = requireAuth(async function(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    if (!isValidObjectId(id)) {
      return Response.json(
        { error: 'Invalid address ID' },
        { status: 400 }
      );
    }

    const user = await User.findById(request.user._id);
    
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === id
    );

    if (addressIndex === -1) {
      return Response.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    // Remove address
    user.addresses.splice(addressIndex, 1);
    
    // If deleted address was default and other addresses exist, make first one default
    if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return Response.json({ message: 'Address deleted successfully' });

  } catch (error) {
    console.error('Address deletion error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 