import { NextResponse } from 'next/server';
import { User } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { requireRole } from '@/lib/middleware/roleAuth';
import { canManageUserRole, ROLES } from '@/lib/permissions/adminPermissions';
import { logRoleChange } from '@/lib/utils/activityLogger';
import mongoose from 'mongoose';

/**
 * USER ROLE MANAGEMENT API
 * =========================
 * 
 * This endpoint allows Super Admins to manage user roles.
 * 
 * SECURITY:
 * - Only Super Admin can access
 * - Cannot change your own role (prevents self-demotion)
 * - Cannot demote the last Super Admin
 * - All role changes are logged to activity log
 * 
 * PATCH /api/admin/users/[id]
 * Update a user's role
 */

// GET single user details (Super Admin only)
export const GET = requireRole(['super_admin'])(async function(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    const user = await User.findById(id)
      .select('-password')
      .lean();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
});

// PATCH - Update user role (Super Admin only)
export const PATCH = requireRole(['super_admin'])(async function(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const { role, reason } = await request.json();
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    // Validate role
    const validRoles = Object.values(ROLES);
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Find target user
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if admin can manage this user's role
    if (!canManageUserRole(request.user, targetUser)) {
      return NextResponse.json(
        { error: 'Cannot modify your own role or insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Special check: Prevent demoting the last Super Admin
    if (targetUser.role === ROLES.SUPER_ADMIN && role !== ROLES.SUPER_ADMIN) {
      // Count Super Admins
      const superAdminCount = await User.countDocuments({ role: ROLES.SUPER_ADMIN });
      
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the last Super Admin. Assign another Super Admin first.' },
          { status: 400 }
        );
      }
    }
    
    // Store old role for logging
    const oldRole = targetUser.role;
    
    // Update user role
    targetUser.role = role;
    targetUser.roleAssignedBy = request.user._id;
    targetUser.roleAssignedAt = new Date();
    
    // Update isAdmin flag for backward compatibility
    targetUser.isAdmin = [ROLES.VIEWER, ROLES.EDITOR, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(role);
    
    await targetUser.save();
    
    // Log the role change
    await logRoleChange({
      adminUserId: request.user._id,
      targetUserId: targetUser._id,
      oldRole,
      newRole: role,
      reason,
      request
    });
    
    // Return updated user (without password)
    const updatedUser = await User.findById(id).select('-password').lean();
    
    return NextResponse.json({
      success: true,
      message: `User role updated from ${oldRole} to ${role}`,
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
});

// DELETE - Deactivate user (Super Admin only)
export const DELETE = requireRole(['super_admin'])(async function(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    // Find target user
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Cannot delete yourself
    if (targetUser._id.toString() === request.user._id.toString()) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    // Cannot delete the last Super Admin
    if (targetUser.role === ROLES.SUPER_ADMIN) {
      const superAdminCount = await User.countDocuments({ role: ROLES.SUPER_ADMIN });
      
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last Super Admin' },
          { status: 400 }
        );
      }
    }
    
    // Delete user
    await User.findByIdAndDelete(id);
    
    // Log the deletion
    const { logActivity } = require('@/lib/utils/activityLogger');
    await logActivity({
      userId: request.user._id,
      action: 'DELETE',
      resource: 'User',
      resourceId: id,
      details: {
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role
      },
      request
    });
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
});
