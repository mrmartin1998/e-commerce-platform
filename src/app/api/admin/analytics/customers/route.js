import { User, Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import { NextResponse } from 'next/server';

export const GET = requireAdmin(async function(request) {
  try {
    await connectDB();
    
    // Get date range from query params (default to last 30 days)
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate'))
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate'))
      : new Date();

    // Get all users and their orders
    const users = await User.find({ role: 'user' });
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Calculate overview metrics
    const overview = {
      totalCustomers: users.length,
      activeCustomers: new Set(orders.map(order => order.userId?._id?.toString())).size,
      averageOrdersPerCustomer: orders.length / users.length || 0,
      newCustomersThisMonth: users.filter(user => 
        user.createdAt >= startDate && user.createdAt <= endDate
      ).length
    };

    // Calculate customer growth trends
    const customersByDate = {};
    users.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0];
      if (!customersByDate[date]) {
        customersByDate[date] = { new: 0, total: 0 };
      }
      customersByDate[date].new += 1;
    });

    // Calculate cumulative totals
    let runningTotal = 0;
    const trends = Object.entries(customersByDate)
      .map(([date, data]) => {
        runningTotal += data.new;
        return {
          _id: date,
          newCustomers: data.new,
          totalCustomers: runningTotal
        };
      })
      .sort((a, b) => b._id.localeCompare(a._id));

    // Geographic distribution
    const geoDistribution = {};
    users.forEach(user => {
      const country = user.addresses?.[0]?.country || 'Unknown';
      geoDistribution[country] = (geoDistribution[country] || 0) + 1;
    });

    // Purchase frequency analysis
    const purchaseFrequency = {};
    orders.forEach(order => {
      const userId = order.userId?._id?.toString();
      if (!userId) return;
      purchaseFrequency[userId] = (purchaseFrequency[userId] || 0) + 1;
    });

    const frequencyDistribution = {
      oneTime: 0,
      repeated: 0,
      frequent: 0
    };

    Object.values(purchaseFrequency).forEach(count => {
      if (count === 1) frequencyDistribution.oneTime++;
      else if (count <= 3) frequencyDistribution.repeated++;
      else frequencyDistribution.frequent++;
    });

    return NextResponse.json({
      overview,
      trends,
      geoDistribution: Object.entries(geoDistribution).map(([country, count]) => ({
        country,
        count
      })),
      purchaseFrequency: frequencyDistribution
    });

  } catch (error) {
    console.error('Customer analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer analytics' },
      { status: 500 }
    );
  }
}); 