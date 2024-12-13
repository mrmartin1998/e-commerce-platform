import { Order, User, Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAdmin } from '@/lib/middleware/adminAuth';

export const GET = requireAdmin(async function(request) {
  try {
    await connectDB();
    
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      recentOrders,
      salesData
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments({ status: 'published' }),
      Order.find()
        .sort('-createdAt')
        .limit(5)
        .populate('userId', 'name email'),
      Order.aggregate([
        {
          $match: {
            status: 'delivered',
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            sales: { $sum: "$total" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    return Response.json({
      metrics: {
        totalOrders,
        totalUsers,
        totalProducts,
      },
      recentOrders,
      salesData
    });

  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 