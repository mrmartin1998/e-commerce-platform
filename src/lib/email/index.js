/**
 * Email Service Exports
 * 
 * Centralized exports for all email-related functionality.
 * Import from this file instead of individual modules for cleaner imports.
 * 
 * Usage:
 * import { sendOrderConfirmation, sendOrderShipped } from '@/lib/email';
 */

export {
  sendOrderConfirmation,
  sendOrderProcessing,
  sendOrderShipped,
  sendOrderDelivered,
  sendOrderCancelled,
} from './emailService.js';
