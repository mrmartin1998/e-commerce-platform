import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';

// GET single order
export const GET = requireAuth(async function getHandler(request, context) {
  try {
    await connectDB();
    
    // Fix Next.js 15 params.await requirement
    const params = await context.params;
    const orderId = params.orderId;
    
    const order = await Order.findById(orderId)
      .populate('userId', 'name email')
      .populate('items.productId', 'name price images')
      .populate('statusHistory.updatedBy', 'name email');
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to get order' },
      { status: 500 }
    );
  }
});

// PATCH update order status
export const PATCH = requireAuth(async function patchHandler(request, context) {
  try {
    await connectDB();
    
    // Fix Next.js 15 params.await requirement
    const params = await context.params;
    const orderId = params.orderId;
    const body = await request.json();
    const { status, trackingUrl, carrier, estimatedDelivery, note } = body;

    // Validate status is provided
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Find the order first (not using findByIdAndUpdate because we need the instance methods)
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Validate status transitions
    // This prevents invalid backward transitions and ensures logical order flow
    const currentStatus = order.status;
    const statusOrder = { pending: 0, processing: 1, shipped: 2, delivered: 3, cancelled: 99 };
    
    // Delivered and cancelled orders cannot be changed
    if (currentStatus === 'delivered') {
      return NextResponse.json(
        { error: 'Cannot change status of delivered orders' },
        { status: 400 }
      );
    }
    
    if (currentStatus === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot change status of cancelled orders' },
        { status: 400 }
      );
    }

    // Prevent backward transitions (except to cancelled, which is always allowed)
    if (status !== 'cancelled' && statusOrder[status] < statusOrder[currentStatus]) {
      return NextResponse.json(
        { error: `Cannot move status backward from ${currentStatus} to ${status}` },
        { status: 400 }
      );
    }

    // Get admin user from request (set by requireAuth middleware)
    const adminUserId = request.user?.userId;

    // Use the helper method to update status and log history
    // This ensures statusHistory is always kept in sync with status changes
    order.addStatusChange(status, adminUserId, note || `Status updated to ${status}`);

    // Update tracking information if provided
    // These fields are optional and only updated when shipping the order
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;
    if (carrier !== undefined) order.carrier = carrier;
    if (estimatedDelivery !== undefined) order.estimatedDelivery = estimatedDelivery;

    // Save the order (this will trigger the updatedAt timestamp)
    await order.save();

    // Populate related data for the response
    // This gives the admin full context about the order and its history
    await order.populate([
      { path: 'userId', select: 'name email' },
      { path: 'items.productId', select: 'name price images' },
      { path: 'statusHistory.updatedBy', select: 'name email' }
    ]);

    return NextResponse.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}); 