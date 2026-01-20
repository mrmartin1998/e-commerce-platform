/**
 * Email Service - Resend Integration
 * 
 * This service handles all email sending functionality using Resend.
 * It provides a clean abstraction for sending different types of order-related emails.
 * 
 * Features:
 * - Development mode: All emails go to test recipient (safe testing)
 * - Production mode: Emails go to actual customers
 * - Graceful error handling: Email failures don't block order processing
 * - Comprehensive logging for debugging
 * 
 * Environment Variables Required:
 * - RESEND_API_KEY: Your Resend API key
 * - EMAIL_FROM: Sender email address
 * - EMAIL_TEST_RECIPIENT: Test email for development
 * - NODE_ENV: 'development' or 'production'
 */

import { Resend } from 'resend';
import { orderConfirmationTemplate } from './templates/orderConfirmation.js';
import { orderProcessingTemplate } from './templates/orderProcessing.js';
import { orderShippedTemplate } from './templates/orderShipped.js';
import { orderDeliveredTemplate } from './templates/orderDelivered.js';
import { orderCancelledTemplate } from './templates/orderCancelled.js';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Check if we're in development mode
 * In development, all emails go to the test recipient instead of real customers
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Core email sending function
 * 
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} html - HTML content of the email
 * @returns {Promise<void>}
 * 
 * Error Handling:
 * - Logs errors but doesn't throw (graceful degradation)
 * - Email failures won't break order processing
 */
async function sendEmail(to, subject, html) {
  try {
    // In development, redirect all emails to test recipient
    const recipient = isDevelopment ? process.env.EMAIL_TEST_RECIPIENT : to;
    
    // Add [TEST] prefix in development for clarity
    const emailSubject = isDevelopment ? `[TEST] ${subject}` : subject;
    
    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: recipient,
      subject: emailSubject,
      html: html,
    });

    if (error) {
      console.error('❌ Email sending failed:', error);
      return;
    }

    // Log success with email ID for tracking
    console.log(`✅ Email sent successfully to ${recipient}`);
    console.log(`   Subject: ${emailSubject}`);
    console.log(`   Email ID: ${data?.id || 'N/A'}`);
    
  } catch (error) {
    // Catch any unexpected errors
    console.error('❌ Unexpected error sending email:', error.message);
    // Don't throw - we don't want email failures to break order processing
  }
}

/**
 * Send order confirmation email
 * Triggered after successful payment
 * 
 * @param {Object} order - Order object with populated items
 * @param {string} customerEmail - Customer's email address
 */
export async function sendOrderConfirmation(order, customerEmail) {
  console.log(`📧 Sending order confirmation email for order #${order._id}`);
  
  // Generate HTML using professional template
  const html = orderConfirmationTemplate(order);
  
  await sendEmail(
    customerEmail,
    `Order Confirmation #${order._id}`,
    html
  );
}

/**
 * Send order processing notification
 * Triggered when admin updates order status to 'processing'
 * 
 * @param {Object} order - Order object
 * @param {string} customerEmail - Customer's email address
 */
export async function sendOrderProcessing(order, customerEmail) {
  console.log(`📧 Sending order processing email for order #${order._id}`);
  
  // Generate HTML using professional template
  const html = orderProcessingTemplate(order);
  
  await sendEmail(
    customerEmail,
    `Your Order is Being Prepared #${order._id}`,
    html
  );
}

/**
 * Send shipping notification
 * Triggered when admin updates order status to 'shipped'
 * Includes tracking information
 * 
 * @param {Object} order - Order object with tracking info
 * @param {string} customerEmail - Customer's email address
 */
export async function sendOrderShipped(order, customerEmail) {
  console.log(`📧 Sending shipping notification for order #${order._id}`);
  
  // Generate HTML using professional template
  const html = orderShippedTemplate(order);
  
  await sendEmail(
    customerEmail,
    `Your Order Has Shipped #${order._id}`,
    html
  );
}

/**
 * Send delivery confirmation
 * Triggered when admin updates order status to 'delivered'
 * 
 * @param {Object} order - Order object
 * @param {string} customerEmail - Customer's email address
 */
export async function sendOrderDelivered(order, customerEmail) {
  console.log(`📧 Sending delivery confirmation for order #${order._id}`);
  
  // Generate HTML using professional template
  const html = orderDeliveredTemplate(order);
  
  await sendEmail(
    customerEmail,
    `Order Delivered #${order._id}`,
    html
  );
}

/**
 * Send cancellation notice
 * Triggered when admin updates order status to 'cancelled'
 * 
 * @param {Object} order - Order object
 * @param {string} customerEmail - Customer's email address
 */
export async function sendOrderCancelled(order, customerEmail) {
  console.log(`📧 Sending cancellation notice for order #${order._id}`);
  
  // Generate HTML using professional template
  const html = orderCancelledTemplate(order);
  
  await sendEmail(
    customerEmail,
    `Order Cancelled #${order._id}`,
    html
  );
}
