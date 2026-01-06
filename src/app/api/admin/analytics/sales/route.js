import { Order } from '@/lib/models';
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

    // Calculate overview metrics using aggregation
    const [overviewResult] = await Order.aggregate([
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$total' },
                totalOrders: { $sum: 1 },
                averageOrderValue: { $avg: '$total' },
                totalProducts: { $sum: { $size: '$items' } }
              }
            }
          ]
        }
      }
    ]);

    const overview = overviewResult.overview[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      totalProducts: 0
    };
    delete overview._id;

    // Get sales trends by date using aggregation
    const salesTrends = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          sales: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          _id: 1,
          sales: 1,
          orders: 1
        }
      }
    ]);

    // Get category performance using aggregation
    const categoryPerformance = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$product.category', 'Uncategorized'] },
          orders: { $sum: 1 },
          revenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] }
          }
        }
      },
      {
        $project: {
          _id: 1,
          orders: 1,
          revenue: 1
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Get top products using aggregation
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: { $ifNull: ['$product.name', 'Unknown Product'] } },
          totalSold: { $sum: '$items.quantity' },
          revenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] }
          }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 1,
          name: 1,
          totalSold: 1,
          revenue: 1
        }
      }
    ]);

    return NextResponse.json({
      overview,
      trends: salesTrends,
      categories: categoryPerformance,
      topProducts
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sales analytics' },
      { status: 500 }
    );
  }
}); 