/**
 * Order Processing Email Template
 * 
 * Sent when admin updates order status to 'processing'.
 * Informs customer their order is being prepared.
 * 
 * @param {Object} order - Order object
 * @returns {string} HTML email content
 */

import { baseTemplate } from './baseTemplate.js';

export function orderProcessingTemplate(order) {
  const content = `
    <!-- Icon -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%;">
        <span style="font-size: 32px; line-height: 64px;">📦</span>
      </div>
    </div>

    <!-- Main Heading -->
    <h2 style="margin: 0 0 8px; color: #111827; font-size: 24px; font-weight: 700; text-align: center;">
      We're Preparing Your Order
    </h2>
    <p style="margin: 0 0 32px; color: #6b7280; font-size: 16px; text-align: center; line-height: 24px;">
      Great news! We've started processing your order and getting it ready for shipment.
    </p>

    <!-- Order Info Box -->
    <div style="background-color: #fffbeb; border: 2px solid #fbbf24; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
      <p style="margin: 0 0 8px; color: #92400e; font-size: 14px;">
        <strong>Order Number:</strong> #${order._id}
      </p>
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>Status:</strong> Processing
      </p>
    </div>

    <!-- Timeline -->
    <h3 style="margin: 0 0 20px; color: #111827; font-size: 18px; font-weight: 600;">
      Order Timeline
    </h3>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
      <tr>
        <td width="40" style="vertical-align: top; padding-top: 4px;">
          <div style="width: 24px; height: 24px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 14px;">✓</span>
          </div>
        </td>
        <td style="padding-left: 16px; padding-bottom: 20px;">
          <p style="margin: 0 0 4px; color: #111827; font-weight: 600; font-size: 15px;">
            Order Placed
          </p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Your order has been confirmed
          </p>
        </td>
      </tr>
      <tr>
        <td width="40" style="vertical-align: top; padding-top: 4px;">
          <div style="width: 24px; height: 24px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 14px;">●</span>
          </div>
        </td>
        <td style="padding-left: 16px; padding-bottom: 20px;">
          <p style="margin: 0 0 4px; color: #111827; font-weight: 600; font-size: 15px;">
            Processing
          </p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            We're preparing your items
          </p>
        </td>
      </tr>
      <tr>
        <td width="40" style="vertical-align: top; padding-top: 4px;">
          <div style="width: 24px; height: 24px; background-color: #e5e7eb; border-radius: 50%;"></div>
        </td>
        <td style="padding-left: 16px; padding-bottom: 20px;">
          <p style="margin: 0 0 4px; color: #9ca3af; font-weight: 600; font-size: 15px;">
            Shipped
          </p>
          <p style="margin: 0; color: #9ca3af; font-size: 14px;">
            Coming soon
          </p>
        </td>
      </tr>
      <tr>
        <td width="40" style="vertical-align: top; padding-top: 4px;">
          <div style="width: 24px; height: 24px; background-color: #e5e7eb; border-radius: 50%;"></div>
        </td>
        <td style="padding-left: 16px;">
          <p style="margin: 0 0 4px; color: #9ca3af; font-weight: 600; font-size: 15px;">
            Delivered
          </p>
          <p style="margin: 0; color: #9ca3af; font-size: 14px;">
            Coming soon
          </p>
        </td>
      </tr>
    </table>

    <!-- Info Box -->
    <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 8px; padding: 24px; margin-bottom: 32px;">
      <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 20px;">
        💡 <strong>What's happening now?</strong><br>
        Our team is carefully picking and packing your items. You'll receive a shipping notification with tracking information as soon as your package leaves our warehouse.
      </p>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-top: 32px;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders/${order._id}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
        Track Order
      </a>
    </div>
  `;

  return baseTemplate(
    content,
    `Your order #${order._id} is being processed`
  );
}
