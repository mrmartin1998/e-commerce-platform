import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';

export const GET = requireAuth(async function(request) {
  try {
    await connectDB();
    
    // Get pagination parameters from query
    const searchParams = new URL(request.url).searchParams;
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;
    
    // Find orders with populated user data
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Order.countDocuments();
    
    return NextResponse.json({
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to get orders' },
      { status: 500 }
    );
  }
}); 