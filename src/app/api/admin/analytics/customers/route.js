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

    // Overview metrics using aggregation
    const [overviewResult] = await User.aggregate([
      { $match: { role: 'user' } },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalCustomers: { $sum: 1 },
                newCustomersThisMonth: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ['$createdAt', startDate] },
                          { $lte: ['$createdAt', endDate] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ]);

    // Active customers and average orders per customer
    const [orderStats] = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          activeCustomers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          totalOrders: 1,
          activeCustomersCount: { $size: '$activeCustomers' }
        }
      }
    ]);

    const overview = {
      totalCustomers: overviewResult.overview[0]?.totalCustomers || 0,
      activeCustomers: orderStats?.activeCustomersCount || 0,
      averageOrdersPerCustomer: overviewResult.overview[0]?.totalCustomers 
        ? (orderStats?.totalOrders || 0) / overviewResult.overview[0].totalCustomers 
        : 0,
      newCustomersThisMonth: overviewResult.overview[0]?.newCustomersThisMonth || 0
    };

    // Customer growth trends using aggregation
    const trends = await User.aggregate([
      { $match: { role: 'user' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      {
        $group: {
          _id: null,
          dates: {
            $push: {
              date: '$_id',
              newCustomers: '$newCustomers'
            }
          }
        }
      }
    ]);

    // Calculate cumulative totals
    let runningTotal = 0;
    const trendsWithTotal = (trends[0]?.dates || []).map(item => {
      runningTotal += item.newCustomers;
      return {
        _id: item.date,
        newCustomers: item.newCustomers,
        totalCustomers: runningTotal
      };
    });

    // Geographic distribution using aggregation
    const geoDistribution = await User.aggregate([
      { $match: { role: 'user' } },
      {
        $project: {
          country: {
            $ifNull: [
              { $arrayElemAt: ['$addresses.country', 0] },
              'Unknown'
            ]
          }
        }
      },
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          country: '$_id',
          count: 1
        }
      }
    ]);

    // Purchase frequency analysis using aggregation
    const purchaseFrequencyData = await Order.aggregate([
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          frequencies: {
            $push: {
              userId: '$_id',
              count: '$orderCount'
            }
          }
        }
      }
    ]);

    const frequencyDistribution = {
      oneTime: 0,
      repeated: 0,
      frequent: 0
    };

    (purchaseFrequencyData[0]?.frequencies || []).forEach(({ count }) => {
      if (count === 1) frequencyDistribution.oneTime++;
      else if (count <= 3) frequencyDistribution.repeated++;
      else frequencyDistribution.frequent++;
    });

    return NextResponse.json({
      overview,
      trends: trendsWithTotal,
      geoDistribution,
      purchaseFrequency: frequencyDistribution
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch customer analytics' },
      { status: 500 }
    );
  }
}); 