/**
 * Order Cancelled Email Template
 * 
 * Sent when admin updates order status to 'cancelled'.
 * Informs customer of cancellation and refund process.
 * 
 * @param {Object} order - Order object
 * @returns {string} HTML email content
 */

import { baseTemplate } from './baseTemplate.js';

export function orderCancelledTemplate(order) {
  const content = `
    <!-- Icon -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 50%;">
        <span style="font-size: 32px; line-height: 64px; color: white;">✕</span>
      </div>
    </div>

    <!-- Main Heading -->
    <h2 style="margin: 0 0 8px; color: #111827; font-size: 24px; font-weight: 700; text-align: center;">
      Order Cancelled
    </h2>
    <p style="margin: 0 0 32px; color: #6b7280; font-size: 16px; text-align: center; line-height: 24px;">
      Your order has been cancelled. We're processing your refund.
    </p>

    <!-- Order Info Box -->
    <div style="background-color: #fee2e2; border: 2px solid #ef4444; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding-bottom: 12px;">
            <span style="color: #991b1b; font-size: 14px; font-weight: 600;">Order Number</span><br>
            <span style="color: #7f1d1d; font-size: 16px; font-weight: 700;">#${order._id}</span>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom: 12px;">
            <span style="color: #991b1b; font-size: 14px; font-weight: 600;">Status</span><br>
            <span style="color: #7f1d1d; font-size: 16px;">Cancelled</span>
          </td>
        </tr>
        <tr>
          <td>
            <span style="color: #991b1b; font-size: 14px; font-weight: 600;">Refund Amount</span><br>
            <span style="color: #7f1d1d; font-size: 18px; font-weight: 700;">$${order.total.toFixed(2)}</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Refund Information -->
    <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">
      💳 Refund Information
    </h3>
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
      <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 24px;">
        Your refund is being processed and will be returned to your original payment method.
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td width="30" style="vertical-align: top; padding-top: 2px;">
            <span style="color: #3b82f6; font-size: 18px;">→</span>
          </td>
          <td style="padding-bottom: 12px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px;">
              <strong style="color: #374151;">Processing Time:</strong> 3-5 business days
            </p>
          </td>
        </tr>
        <tr>
          <td width="30" style="vertical-align: top; padding-top: 2px;">
            <span style="color: #3b82f6; font-size: 18px;">→</span>
          </td>
          <td style="padding-bottom: 12px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px;">
              <strong style="color: #374151;">Bank Processing:</strong> Additional 5-10 business days (varies by bank)
            </p>
          </td>
        </tr>
        <tr>
          <td width="30" style="vertical-align: top; padding-top: 2px;">
            <span style="color: #3b82f6; font-size: 18px;">→</span>
          </td>
          <td>
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px;">
              <strong style="color: #374151;">Notification:</strong> You'll receive a confirmation email once the refund is issued
            </p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Why Was This Cancelled -->
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; padding: 24px; margin-bottom: 32px;">
      <h4 style="margin: 0 0 12px; color: #92400e; font-size: 16px; font-weight: 600;">
        ℹ️ Common Reasons for Cancellation
      </h4>
      <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 22px;">
        <li>Item out of stock</li>
        <li>Unable to verify payment</li>
        <li>Shipping address issues</li>
        <li>Customer request</li>
      </ul>
    </div>

    <!-- We're Sorry -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h3 style="margin: 0 0 12px; color: #111827; font-size: 20px; font-weight: 600;">
        We're Sorry for the Inconvenience
      </h3>
      <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 24px;">
        If you have any questions about this cancellation or your refund,<br>
        please don't hesitate to reach out to our support team.
      </p>
    </div>

    <!-- Actions -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
      <tr>
        <td style="text-align: center; padding: 0 8px;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/products" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
            Continue Shopping
          </a>
        </td>
        <td style="text-align: center; padding: 0 8px;">
          <a href="mailto:support@ecommerce.com" style="display: inline-block; padding: 14px 28px; background-color: #ffffff; color: #667eea; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; border: 2px solid #667eea;">
            Contact Support
          </a>
        </td>
      </tr>
    </table>

    <!-- Order Summary -->
    <div style="background-color: #f9fafb; border-top: 2px solid #e5e7eb; padding: 20px; margin: 0 -40px -40px; border-radius: 0 0 8px 8px;">
      <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">
        For reference, your cancelled order total was <strong style="color: #374151;">$${order.total.toFixed(2)}</strong>
      </p>
    </div>
  `;

  return baseTemplate(
    content,
    `Order #${order._id} has been cancelled - Refund processing`
  );
}
