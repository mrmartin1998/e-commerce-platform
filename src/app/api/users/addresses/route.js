import mongoose from 'mongoose';
import { User } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/users/addresses
export const GET = requireAuth(async function(request) {
  try {
    await connectDB();
    
    const user = await User
      .findById(request.user._id)
      .select('addresses');

    return Response.json({ addresses: user?.addresses || [] });

  } catch (error) {
    console.error('Addresses fetch error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/users/addresses
export const POST = requireAuth(async function(request) {
  try {
    await connectDB();
    
    const address = await request.json();
    
    // Basic validation
    if (!address.street || !address.city || !address.country) {
      return Response.json(
        { error: 'Street, city, and country are required' },
        { status: 400 }
      );
    }

    const user = await User.findById(request.user._id);
    
    // Add new address with generated ID
    const newAddress = {
      _id: new mongoose.Types.ObjectId(),
      ...address,
      isDefault: user.addresses.length === 0
    };
    
    user.addresses.push(newAddress);
    await user.save();

    return Response.json({ address: newAddress }, { status: 201 });

  } catch (error) {
    console.error('Address creation error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 