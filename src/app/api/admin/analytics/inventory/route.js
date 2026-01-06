import { Product, Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import { NextResponse } from 'next/server';

export const GET = requireAdmin(async function(request) {
  try {
    await connectDB();
    
    // Use aggregation to calculate overview metrics efficiently
    const [overviewResult] = await Product.aggregate([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                lowStockItems: {
                  $sum: {
                    $cond: [
                      { $lte: ['$stock', { $ifNull: ['$lowStockThreshold', 10] }] },
                      1,
                      0
                    ]
                  }
                },
                outOfStockItems: {
                  $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
                },
                totalStockValue: {
                  $sum: { $multiply: ['$price', '$stock'] }
                }
              }
            }
          ]
        }
      }
    ]);

    const overview = overviewResult.totals[0] || {
      totalProducts: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      totalStockValue: 0
    };
    delete overview._id;

    // Calculate stock levels by category using aggregation
    const categoryAnalytics = await Product.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$category', 'Uncategorized'] },
          totalItems: { $sum: 1 },
          lowStock: {
            $sum: {
              $cond: [
                { $lte: ['$stock', { $ifNull: ['$lowStockThreshold', 10] }] },
                1,
                0
              ]
            }
          },
          stockValue: {
            $sum: { $multiply: ['$price', '$stock'] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalItems: 1,
          lowStock: 1,
          stockValue: 1
        }
      },
      { $sort: { category: 1 } }
    ]);

    // Get low stock products using aggregation
    const lowStockProducts = await Product.aggregate([
      {
        $match: {
          $expr: {
            $lte: ['$stock', { $ifNull: ['$lowStockThreshold', 10] }]
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          stock: 1,
          threshold: { $ifNull: ['$lowStockThreshold', 10] },
          category: 1
        }
      },
      { $sort: { stock: 1 } }
    ]);

    // Calculate product performance with sales data using aggregation
    const productPerformance = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSales: { $sum: '$items.quantity' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: '$product._id',
          name: '$product.name',
          stock: '$product.stock',
          sales: '$totalSales',
          turnoverRate: {
            $cond: [
              { $eq: [{ $add: ['$product.stock', '$totalSales'] }, 0] },
              0,
              { $divide: ['$totalSales', { $add: ['$product.stock', '$totalSales'] }] }
            ]
          }
        }
      },
      { $sort: { turnoverRate: -1 } },
      { $limit: 10 }
    ]);

    return NextResponse.json({
      overview,
      categoryAnalytics,
      lowStockProducts,
      productPerformance
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch inventory analytics' },
      { status: 500 }
    );
  }
});