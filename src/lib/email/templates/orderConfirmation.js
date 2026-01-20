/**
 * Order Confirmation Email Template
 * 
 * Sent immediately after successful payment.
 * Shows complete order details, items, pricing, and shipping address.
 * 
 * @param {Object} order - Order object with populated items
 * @param {string} order._id - Order ID
 * @param {Array} order.items - Order items with productId populated
 * @param {number} order.subtotal - Subtotal amount
 * @param {number} order.tax - Tax amount
 * @param {number} order.shipping - Shipping amount
 * @param {number} order.total - Total amount
 * @param {Object} order.shippingAddress - Shipping address details
 * @param {Date} order.createdAt - Order creation date
 * @returns {string} HTML email content
 */

import { baseTemplate } from './baseTemplate.js';

export function orderConfirmationTemplate(order) {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Build items HTML
  const itemsHtml = order.items.map(item => {
    const productName = item.productId?.name || 'Product';
    const productImage = item.productId?.images?.[0]?.url || item.productId?.images?.[0] || '';
    const itemTotal = (item.price * item.quantity).toFixed(2);
    
    return `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td width="80" style="vertical-align: top;">
                ${productImage ? `
                  <img src="${productImage}" alt="${productName}" style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb;">
                ` : `
                  <div style="width: 64px; height: 64px; background-color: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">
                    No Image
                  </div>
                `}
              </td>
              <td style="padding-left: 16px; vertical-align: top;">
                <p style="margin: 0 0 4px; font-weight: 600; color: #111827; font-size: 15px;">
                  ${productName}
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Quantity: ${item.quantity} × $${item.price.toFixed(2)}
                </p>
              </td>
              <td style="text-align: right; vertical-align: top; white-space: nowrap;">
                <p style="margin: 0; font-weight: 600; color: #111827; font-size: 15px;">
                  $${itemTotal}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join('');

  const content = `
    <!-- Success Icon -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 32px;">✓</span>
      </div>
    </div>

    <!-- Main Heading -->
    <h2 style="margin: 0 0 8px; color: #111827; font-size: 24px; font-weight: 700; text-align: center;">
      Order Confirmed!
    </h2>
    <p style="margin: 0 0 32px; color: #6b7280; font-size: 16px; text-align: center; line-height: 24px;">
      Thank you for your order. We've received your payment and are preparing your items for shipment.
    </p>

    <!-- Order Details Box -->
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding-bottom: 8px;">
            <span style="color: #6b7280; font-size: 14px;">Order Number</span>
          </td>
          <td style="text-align: right; padding-bottom: 8px;">
            <strong style="color: #111827; font-size: 14px;">#${order._id}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom: 0;">
            <span style="color: #6b7280; font-size: 14px;">Order Date</span>
          </td>
          <td style="text-align: right; padding-bottom: 0;">
            <strong style="color: #111827; font-size: 14px;">${orderDate}</strong>
          </td>
        </tr>
      </table>
    </div>

    <!-- Order Items -->
    <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">
      Order Items
    </h3>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
      ${itemsHtml}
    </table>

    <!-- Order Summary -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
      <tr>
        <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">
          Subtotal
        </td>
        <td style="text-align: right; padding: 8px 0; color: #111827; font-size: 15px;">
          $${order.subtotal.toFixed(2)}
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">
          Tax
        </td>
        <td style="text-align: right; padding: 8px 0; color: #111827; font-size: 15px;">
          $${order.tax.toFixed(2)}
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280; font-size: 15px; border-bottom: 1px solid #e5e7eb;">
          Shipping
        </td>
        <td style="text-align: right; padding: 8px 0; color: #111827; font-size: 15px; border-bottom: 1px solid #e5e7eb;">
          $${order.shipping.toFixed(2)}
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0 0; color: #111827; font-size: 17px; font-weight: 700;">
          Total
        </td>
        <td style="text-align: right; padding: 12px 0 0; color: #111827; font-size: 17px; font-weight: 700;">
          $${order.total.toFixed(2)}
        </td>
      </tr>
    </table>

    <!-- Shipping Address -->
    <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">
      Shipping Address
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

    <!-- What's Next -->
    <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 8px; padding: 24px; margin-bottom: 32px;">
      <h3 style="margin: 0 0 12px; color: #1e40af; font-size: 16px; font-weight: 600;">
        📦 What's Next?
      </h3>
      <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 20px;">
        We're preparing your order for shipment. You'll receive another email with tracking information once your package ships.
      </p>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-top: 32px;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
        View Order Details
      </a>
    </div>
  `;

  return baseTemplate(
    content,
    `Order #${order._id} confirmed - Thank you for your purchase!`
  );
}
