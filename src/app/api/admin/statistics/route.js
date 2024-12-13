import { Order, Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAdmin } from '@/lib/middleware/adminAuth';

export const GET = requireAdmin(async function(request) {
  try {
    await connectDB();
    
    const [
      salesByCategory,
      topProducts,
      orderStatusStats,
      revenueByMonth
    ] = await Promise.all([
      // Sales by category
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$product.category',
            total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            count: { $sum: '$items.quantity' }
          }
        }
      ]),
      
      // Top selling products
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' }
      ]),
      
      // Order status statistics
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            total: { $sum: '$total' }
          }
        }
      ]),
      
      // Monthly revenue
      Order.aggregate([
        {
          $match: {
            status: 'delivered',
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    return Response.json({
      salesByCategory,
      topProducts,
      orderStatusStats,
      revenueByMonth
    });

  } catch (error) {
    console.error('Statistics fetch error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 