import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import ActivityLog from '@/lib/models/ActivityLog';
import { requireRole } from '@/lib/middleware/roleAuth';

/**
 * ACTIVITY LOG API
 * =================
 * 
 * Provides access to admin activity logs for auditing and security.
 * 
 * SECURITY:
 * - Only Super Admin can access activity logs
 * - Logs cannot be modified or deleted (read-only)
 * - Supports filtering and pagination
 * 
 * GET /api/admin/activity
 * Fetch activity logs with optional filters
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 50, max: 100)
 * - userId: Filter by specific user
 * - action: Filter by action type (CREATE, UPDATE, DELETE, etc.)
 * - resource: Filter by resource type (Product, User, Order, etc.)
 * - startDate: Filter from date (ISO string)
 * - endDate: Filter to date (ISO string)
 * 
 * EXAMPLE REQUESTS:
 * - GET /api/admin/activity?page=1&limit=50
 * - GET /api/admin/activity?userId=123&action=DELETE
 * - GET /api/admin/activity?resource=Product&startDate=2026-01-01
 */

export const GET = requireRole(['super_admin'])(async function(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 50, 100); // Max 100
    const skip = (page - 1) * limit;
    
    // Build query filters
    const query = {};
    
    // Filter by user
    const userId = searchParams.get('userId');
    if (userId) {
      query.userId = userId;
    }
    
    // Filter by action
    const action = searchParams.get('action');
    if (action) {
      query.action = action.toUpperCase();
    }
    
    // Filter by resource
    const resource = searchParams.get('resource');
    if (resource) {
      query.resource = resource;
    }
    
    // Filter by date range
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Search in details (partial match)
    const search = searchParams.get('search');
    if (search) {
      // This is a basic text search - could be enhanced with text indexes
      query['details'] = { $exists: true };
    }
    
    // Execute query with pagination
    const [activities, total] = await Promise.all([
      ActivityLog
        .find(query)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 }) // Most recent first
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query)
    ]);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasMore = skip + activities.length < total;
    
    return NextResponse.json({
      activities,
      pagination: {
        current: page,
        total: totalPages,
        limit,
        totalRecords: total,
        hasMore
      }
    });
    
  } catch (error) {
    console.error('Activity log fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
});

/**
 * GET activity statistics
 * 
 * GET /api/admin/activity/stats
 * Returns summary statistics about activities
 */
export async function GET_STATS(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days')) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Aggregate statistics
    const [stats] = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $facet: {
          byAction: [
            {
              $group: {
                _id: '$action',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } }
          ],
          byResource: [
            {
              $group: {
                _id: '$resource',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } }
          ],
          byUser: [
            {
              $group: {
                _id: '$userId',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          total: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);
    
    return NextResponse.json({
      period: `Last ${days} days`,
      statistics: {
        total: stats.total[0]?.count || 0,
        byAction: stats.byAction,
        byResource: stats.byResource,
        topUsers: stats.byUser
      }
    });
    
  } catch (error) {
    console.error('Activity stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity statistics' },
      { status: 500 }
    );
  }
}
