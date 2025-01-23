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

    // Get all orders first (similar to orders API)
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Calculate overview metrics
    const salesOverview = [{
      _id: null,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, order) => sum + (order.total || 0), 0) / orders.length 
        : 0,
      totalProducts: orders.reduce((sum, order) => sum + (order.items?.length || 0), 0)
    }];

    // Group orders by date for trends
    const salesByDate = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = { sales: 0, orders: 0 };
      }
      salesByDate[date].sales += order.total || 0;
      salesByDate[date].orders += 1;
    });

    const salesTrends = Object.entries(salesByDate)
      .map(([date, data]) => ({
        _id: date,
        sales: data.sales,
        orders: data.orders
      }))
      .sort((a, b) => b._id.localeCompare(a._id));

    // Group by category
    const categoryPerformance = [];
    const categoryMap = new Map();

    orders.forEach(order => {
      order.items?.forEach(item => {
        const category = item.productId?.category || 'Uncategorized';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { orders: 0, revenue: 0 });
        }
        const categoryData = categoryMap.get(category);
        categoryData.orders += 1;
        categoryData.revenue += (item.price * item.quantity) || 0;
      });
    });

    categoryMap.forEach((data, category) => {
      categoryPerformance.push({
        _id: category,
        ...data
      });
    });

    // Calculate top products
    const productMap = new Map();
    orders.forEach(order => {
      order.items?.forEach(item => {
        const productId = item.productId?._id?.toString();
        if (!productId) return;
        
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            _id: productId,
            name: item.productId?.name || 'Unknown Product',
            totalSold: 0,
            revenue: 0
          });
        }
        const productData = productMap.get(productId);
        productData.totalSold += item.quantity || 0;
        productData.revenue += (item.price * item.quantity) || 0;
      });
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    return NextResponse.json({
      overview: salesOverview[0],
      trends: salesTrends,
      categories: categoryPerformance,
      topProducts
    });

  } catch (error) {
    console.error('Sales analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales analytics' },
      { status: 500 }
    );
  }
}); 