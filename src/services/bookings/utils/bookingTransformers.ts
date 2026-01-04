/**
 * Booking Transformers
 * 
 * Utility functions for transforming Firestore documents to Booking objects.
 */

import { Timestamp } from 'firebase/firestore';
import type { Booking } from '@/types';

/**
 * Transform Firestore document to Booking object
 */
export const docToBooking = (docId: string, data: any): Booking => {
  // Handle different date field formats
  let scheduledDate: Date;
  if (data.scheduledDate?.toDate) {
    scheduledDate = data.scheduledDate.toDate();
  } else if (data.scheduledDate instanceof Timestamp) {
    scheduledDate = data.scheduledDate.toDate();
  } else if (data.scheduledDate) {
    scheduledDate = new Date(data.scheduledDate);
  } else {
    console.warn('⚠️ No scheduledDate for booking:', docId);
    scheduledDate = new Date();
  }

  // Handle price field (could be string or number)
  let priceValue: number;
  if (typeof data.price === 'string') {
    priceValue = parseFloat(data.price) || 0;
  } else if (typeof data.price === 'number') {
    priceValue = data.price;
  } else {
    priceValue = 0;
    console.warn('⚠️ Invalid or missing price for booking:', docId);
  }

  return {
    id: docId,
    clientId: data.clientId || '',
    clientName: data.clientName,
    sitterId: data.sitterId || null,
    serviceType: data.serviceType || '',
    status: data.status || 'pending',
    scheduledDate: scheduledDate,
    duration: data.duration || 30,
    pets: data.pets || [],
    address: data.address || null,
    specialInstructions: data.specialInstructions || null,
    price: priceValue,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || data.createdAt?.toDate() || new Date(),
    visitNotes: data.visitNotes || null,
    visitPhotos: data.visitPhotos || null,
    checkInTime: data.checkInTime?.toDate() || null,
    checkOutTime: data.checkOutTime?.toDate() || null,
    routeData: data.routeData || null,
    
    // Enhanced audit trail (with fallbacks for old bookings)
    createdBy: data.createdBy || data.clientId,
    createdByRole: data.createdByRole || 'petOwner',
    adminCreated: data.adminCreated || false,
    createdVia: data.createdVia || 'ios-app',
    lastModifiedBy: data.lastModifiedBy || null,
    modificationReason: data.modificationReason || null,
    
    // Enhanced payment tracking
    paymentMethod: data.paymentMethod || null,
    paymentStatus: data.paymentStatus || null,
    paymentTransactionId: data.paymentTransactionId || null,
    paymentAmount: data.paymentAmount || null,
    paymentCollectedBy: data.paymentCollectedBy || null,
    paymentReceivedAt: data.paymentReceivedAt?.toDate() || null,
    skipPaymentValidation: data.skipPaymentValidation || false,
    
    // ✅ FIX: Recurring booking tracking
    recurringSeriesId: data.recurringSeriesId || null,
    visitNumber: data.visitNumber || null,
    isRecurring: data.isRecurring || false,
    
    // Square invoice integration fields
    squareInvoiceId: data.squareInvoiceId || null,
    squareOrderId: data.squareOrderId || null,
    squareCustomerId: data.squareCustomerId || null,
    squareInvoiceUrl: data.squareInvoiceUrl || null,
    squarePaymentId: data.squarePaymentId || null,
    squareInvoiceNumber: data.squareInvoiceNumber || null,
  };
};

