/**
 * Order Shipped Email Template
 * 
 * Sent when admin updates order status to 'shipped'.
 * Includes tracking information and estimated delivery date.
 * 
 * @param {Object} order - Order object with tracking info
 * @returns {string} HTML email content
 */

import { baseTemplate } from './baseTemplate.js';

export function orderShippedTemplate(order) {
  const estimatedDelivery = order.estimatedDelivery 
    ? new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'To be determined';

  const content = `
    <!-- Icon -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 50%;">
        <span style="font-size: 32px; line-height: 64px;">🚚</span>
      </div>
    </div>

    <!-- Main Heading -->
    <h2 style="margin: 0 0 8px; color: #111827; font-size: 24px; font-weight: 700; text-align: center;">
      Your Order Has Shipped!
    </h2>
    <p style="margin: 0 0 32px; color: #6b7280; font-size: 16px; text-align: center; line-height: 24px;">
      Your package is on its way! Track your shipment to see real-time updates.
    </p>

    <!-- Shipping Info Box -->
    <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; padding: 24px; margin-bottom: 32px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${order.carrier ? `
        <tr>
          <td style="padding-bottom: 12px;">
            <span style="color: #1e40af; font-size: 14px; font-weight: 600;">Carrier</span><br>
            <span style="color: #1e3a8a; font-size: 16px; font-weight: 700;">${order.carrier}</span>
          </td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding-bottom: 12px;">
            <span style="color: #1e40af; font-size: 14px; font-weight: 600;">Order Number</span><br>
            <span style="color: #1e3a8a; font-size: 16px;">#${order._id}</span>
          </td>
        </tr>
        <tr>
          <td>
            <span style="color: #1e40af; font-size: 14px; font-weight: 600;">Estimated Delivery</span><br>
            <span style="color: #1e3a8a; font-size: 16px;">${estimatedDelivery}</span>
          </td>
        </tr>
      </table>
    </div>

    ${order.trackingUrl ? `
    <!-- Tracking Button -->
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${order.trackingUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
        📦 Track Your Package
      </a>
      <p style="margin: 12px 0 0; color: #6b7280; font-size: 13px;">
        Click the button above to see real-time tracking updates
      </p>
    </div>
    ` : ''}

    <!-- Shipping Address -->
    <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">
      Shipping To
    </h3>
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
      <p style="margin: 0 0 4px; color: #111827; font-weight: 600; font-size: 15px;">
        ${order.shippingAddress?.fullName || 'N/A'}
      </p>
      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px;">
        ${order.shippingAddress?.street || ''}<br>
        ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.postalCode || ''}<br>
        ${order.shippingAddress?.country || ''}
      </p>
    </div>

    <!-- Tips Box -->
    <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
      <h4 style="margin: 0 0 12px; color: #92400e; font-size: 15px; font-weight: 600;">
        📌 Delivery Tips
      </h4>
      <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 22px;">
        <li>Make sure someone is available to receive the package</li>
        <li>Check your tracking number regularly for updates</li>
        <li>Contact the carrier if you have delivery questions</li>
      </ul>
    </div>

    <!-- View Order Button -->
    <div style="text-align: center; margin-top: 32px;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders/${order._id}" style="display: inline-block; padding: 14px 32px; background-color: #ffffff; color: #667eea; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; border: 2px solid #667eea;">
        View Order Details
      </a>
    </div>
  `;

  return baseTemplate(
    content,
    `Your order #${order._id} has shipped! Track your package now.`
  );
}
