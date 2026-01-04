/**
 * Payment and Invoice Helpers
 * 
 * Utility functions for formatting and displaying payment method, payment status,
 * and invoice information in booking details.
 * 
 * Decision: Extracted into separate utility file to keep components under 400 lines
 * and enable reuse across legacy and refactored components.
 */

import type { PaymentMethod, PaymentStatus } from '@/types';
import { CreditCardOutlined, DollarOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import React from 'react';

/**
 * Format payment method for display
 * Maps internal payment method values to user-friendly labels
 */
export const formatPaymentMethod = (method: PaymentMethod | null | undefined): string => {
  if (!method) return 'Not specified';
  
  const methodMap: Record<PaymentMethod, string> = {
    square: 'Card (Square)',
    apple_pay: 'Apple Pay',
    cash: 'Cash',
    check: 'Check',
    invoice: 'Invoice',
    comp: 'Complimentary',
  };
  
  return methodMap[method] || method;
};

/**
 * Get payment method icon component
 * Returns appropriate icon component for each payment method
 */
export const getPaymentMethodIcon = (method: PaymentMethod | null | undefined): React.ComponentType | null => {
  if (!method) return null;
  
  switch (method) {
    case 'square':
    case 'apple_pay':
      return CreditCardOutlined;
    case 'cash':
      return DollarOutlined;
    case 'check':
    case 'invoice':
      return FileTextOutlined;
    case 'comp':
      return CheckCircleOutlined;
    default:
      return null;
  }
};

/**
 * Get payment method color for Tag component
 */
export const getPaymentMethodColor = (method: PaymentMethod | null | undefined): string => {
  if (!method) return 'default';
  
  const colorMap: Record<PaymentMethod, string> = {
    square: 'blue',
    apple_pay: 'purple',
    cash: 'green',
    check: 'orange',
    invoice: 'cyan',
    comp: 'gold',
  };
  
  return colorMap[method] || 'default';
};

/**
 * Format payment status for display
 */
export const formatPaymentStatus = (status: PaymentStatus | null | undefined): string => {
  if (!status) return 'Not specified';
  
  const statusMap: Record<PaymentStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    declined: 'Declined',
    failed: 'Failed',
    cancelled: 'Cancelled',
    waived: 'Waived',
  };
  
  return statusMap[status] || status;
};

/**
 * Get payment status color for Tag component
 */
export const getPaymentStatusColor = (status: PaymentStatus | null | undefined): string => {
  if (!status) return 'default';
  
  const colorMap: Record<PaymentStatus, string> = {
    pending: 'orange',
    confirmed: 'green',
    declined: 'red',
    failed: 'red',
    cancelled: 'default',
    waived: 'gold',
  };
  
  return colorMap[status] || 'default';
};

/**
 * Invoice information interface
 * Represents invoice data from Square integration
 */
export interface InvoiceInfo {
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  invoiceUrl?: string | null;
  orderId?: string | null;
  paymentId?: string | null;
  customerId?: string | null;
}

/**
 * Check if booking has invoice information
 * Returns true if any invoice-related fields are present
 */
export const hasInvoiceInfo = (booking: { 
  paymentTransactionId?: string | null;
  squareInvoiceId?: string | null;
  squareInvoiceNumber?: string | null;
  squareInvoiceUrl?: string | null;
  [key: string]: any;
}): boolean => {
  return !!(
    booking.paymentTransactionId ||
    booking.squareInvoiceId ||
    booking.squareInvoiceNumber ||
    booking.squareInvoiceUrl
  );
};

/**
 * Extract invoice information from booking
 * Handles both existing paymentTransactionId and Square invoice fields
 */
export const getInvoiceInfo = (booking: { 
  paymentTransactionId?: string | null;
  squareInvoiceId?: string | null;
  squareInvoiceNumber?: string | null;
  squareInvoiceUrl?: string | null;
  squareOrderId?: string | null;
  squarePaymentId?: string | null;
  squareCustomerId?: string | null;
  [key: string]: any;
}): InvoiceInfo => {
  return {
    invoiceId: booking.squareInvoiceId || null,
    invoiceNumber: booking.squareInvoiceNumber || null,
    invoiceUrl: booking.squareInvoiceUrl || null,
    orderId: booking.squareOrderId || null,
    paymentId: booking.paymentTransactionId || booking.squarePaymentId || null,
    customerId: booking.squareCustomerId || null,
  };
};

