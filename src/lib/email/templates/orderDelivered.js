/**
 * Order Delivered Email Template
 * 
 * Sent when admin updates order status to 'delivered'.
 * Confirms delivery and encourages product reviews.
 * 
 * @param {Object} order - Order object
 * @returns {string} HTML email content
 */

import { baseTemplate } from './baseTemplate.js';

export function orderDeliveredTemplate(order) {
  const content = `
    <!-- Icon -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%;">
        <span style="font-size: 32px; line-height: 64px;">🎉</span>
      </div>
    </div>

    <!-- Main Heading -->
    <h2 style="margin: 0 0 8px; color: #111827; font-size: 24px; font-weight: 700; text-align: center;">
      Your Order Has Been Delivered!
    </h2>
    <p style="margin: 0 0 32px; color: #6b7280; font-size: 16px; text-align: center; line-height: 24px;">
      We hope you love your new items! Your order has been successfully delivered.
    </p>

    <!-- Order Info Box -->
    <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 8px; padding: 24px; margin-bottom: 32px; text-align: center;">
      <p style="margin: 0 0 8px; color: #065f46; font-size: 14px; font-weight: 600;">
        Order Number
      </p>
      <p style="margin: 0 0 16px; color: #064e3b; font-size: 20px; font-weight: 700;">
        #${order._id}
      </p>
      <div style="display: inline-block; padding: 8px 20px; background-color: #10b981; color: white; border-radius: 20px; font-size: 14px; font-weight: 600;">
        ✓ Delivered
      </div>
    </div>

    <!-- Thank You Message -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h3 style="margin: 0 0 12px; color: #111827; font-size: 20px; font-weight: 600;">
        Thank You for Shopping With Us!
      </h3>
      <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 24px;">
        We truly appreciate your business and hope you enjoy your purchase.
      </p>
    </div>

    <!-- Review Request Box -->
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; padding: 24px; margin-bottom: 32px; text-align: center;">
      <h4 style="margin: 0 0 12px; color: #92400e; font-size: 18px; font-weight: 600;">
        ⭐ How Was Your Experience?
      </h4>
      <p style="margin: 0 0 20px; color: #78350f; font-size: 14px; line-height: 22px;">
        Your feedback helps us improve and helps other customers make informed decisions.
      </p>
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders" style="display: inline-block; padding: 14px 32px; background-color: #f59e0b; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
        Write a Review
      </a>
    </div>

    <!-- Next Steps -->
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
      <h4 style="margin: 0 0 16px; color: #111827; font-size: 16px; font-weight: 600;">
        What's Next?
      </h4>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td width="30" style="vertical-align: top; padding-top: 2px;">
            <span style="color: #10b981; font-size: 18px;">✓</span>
          </td>
          <td style="padding-bottom: 12px;">
            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 20px;">
              <strong>Check your items</strong> - Make sure everything arrived in perfect condition
            </p>
          </td>
        </tr>
        <tr>
          <td width="30" style="vertical-align: top; padding-top: 2px;">
            <span style="color: #10b981; font-size: 18px;">✓</span>
          </td>
          <td style="padding-bottom: 12px;">
            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 20px;">
              <strong>Need help?</strong> - Contact us within 30 days for returns or exchanges
            </p>
          </td>
        </tr>
        <tr>
          <td width="30" style="vertical-align: top; padding-top: 2px;">
            <span style="color: #10b981; font-size: 18px;">✓</span>
          </td>
          <td>
            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 20px;">
              <strong>Share the love</strong> - Leave a review to help others discover great products
            </p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Social Proof / Satisfaction -->
    <div style="text-align: center; margin-bottom: 32px;">
      <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">
        Join thousands of happy customers
      </p>
      <div style="color: #fbbf24; font-size: 24px;">
        ★★★★★
      </div>
      <p style="margin: 8px 0 0; color: #6b7280; font-size: 13px; font-style: italic;">
        "Excellent service and fast delivery!"
      </p>
    </div>

    <!-- View Order Button -->
    <div style="text-align: center; margin-top: 32px;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders/${order._id}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
        View Order Details
      </a>
    </div>
  `;

  return baseTemplate(
    content,
    `Your order #${order._id} has been delivered! Share your experience.`
  );
}
