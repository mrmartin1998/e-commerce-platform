import { Product, Order } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import { NextResponse } from 'next/server';

export const GET = requireAdmin(async function(request) {
  try {
    await connectDB();
    
    // Get all products and orders
    const products = await Product.find().sort({ createdAt: -1 });
    const orders = await Order.find()
      .populate('items.productId')
      .sort({ createdAt: -1 });

    // Calculate overview metrics using custom thresholds
    const overview = {
      totalProducts: products.length,
      lowStockItems: products.filter(p => p.stock <= (p.lowStockThreshold || 10)).length,
      outOfStockItems: products.filter(p => p.stock === 0).length,
      totalStockValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
    };

    // Calculate stock levels by category using custom thresholds
    const categoryStock = {};
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!categoryStock[category]) {
        categoryStock[category] = {
          totalItems: 0,
          lowStock: 0,
          stockValue: 0
        };
      }
      categoryStock[category].totalItems += 1;
      categoryStock[category].stockValue += product.price * product.stock;
      // Use custom threshold for each product
      if (product.stock <= (product.lowStockThreshold || 10)) {
        categoryStock[category].lowStock += 1;
      }
    });

    // Calculate product performance
    const productPerformance = products.map(product => {
      const sales = orders.reduce((total, order) => {
        const item = order.items.find(i => i.productId?._id.toString() === product._id.toString());
        return total + (item?.quantity || 0);
      }, 0);

      return {
        _id: product._id,
        name: product.name,
        stock: product.stock,
        sales,
        turnoverRate: sales / (product.stock + sales) // Simple turnover calculation
      };
    }).sort((a, b) => b.turnoverRate - a.turnoverRate);

    return NextResponse.json({
      overview,
      categoryAnalytics: Object.entries(categoryStock).map(([category, data]) => ({
        category,
        ...data
      })),
      lowStockProducts: products
        .filter(p => p.stock <= (p.lowStockThreshold || 10)) // Use custom threshold
        .map(p => ({
          _id: p._id,
          name: p.name,
          stock: p.stock,
          threshold: p.lowStockThreshold || 10, // Include threshold in response
          category: p.category
        })),
      productPerformance: productPerformance.slice(0, 10) // Top 10 products
    });

  } catch (error) {
    console.error('Inventory analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory analytics' },
      { status: 500 }
    );
  }
});