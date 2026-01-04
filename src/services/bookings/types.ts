import { Timestamp, serverTimestamp } from 'firebase/firestore';
import type { ServiceType, BookingStatus, Address, PaymentMethod, PaymentStatus } from '@/types';

/**
 * Firestore document types (with Timestamp instead of Date)
 */
export interface FirestoreBookingDocument {
  id: string;
  clientId: string;
  clientName?: string;
  sitterId?: string | null;
  serviceType: ServiceType;
  status: BookingStatus;
  scheduledDate: Timestamp;
  scheduledTime?: string;
  timeZoneIdentifier?: string;
  duration: number;
  pets?: string[];
  address?: Address | null;
  specialInstructions?: string | null;
  price: number | string;
  paymentMethod?: PaymentMethod | null;
  paymentStatus?: PaymentStatus | null;
  paymentCollectedBy?: string | null;
  paymentReceivedAt?: Date | null;
  skipPaymentValidation?: boolean;
  createdBy?: string;
  createdByRole?: 'admin' | 'petOwner' | 'system';
  adminCreated?: boolean;
  createdVia?: 'web-admin' | 'ios-app' | 'api' | 'webhook';
  lastModifiedBy?: string | null;
  modificationReason?: string | null;
  approvedAt?: ReturnType<typeof serverTimestamp>;
  createdAt: ReturnType<typeof serverTimestamp>;
  updatedAt: ReturnType<typeof serverTimestamp>;
  recurringSeriesId?: string | null;
  visitNumber?: number | null;
  isRecurring?: boolean;
}

export interface FirestoreRecurringSeriesDocument {
  id: string;
  clientId: string;
  serviceType: ServiceType;
  numberOfVisits: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  preferredTime: string;
  preferredDays?: number[];
  basePrice: number;
  totalPrice: number;
  pets: string[];
  specialInstructions?: string;
  address?: Address | null;
  status: string;
  createdAt: ReturnType<typeof serverTimestamp>;
  assignedSitterId?: string | null;
  preferredSitterId?: string | null;
  completedVisits: number;
  canceledVisits: number;
  upcomingVisits: number;
  duration: number;
  createdBy?: string;
  createdByRole?: 'admin' | 'petOwner' | 'system';
  adminCreated?: boolean;
  createdVia?: 'web-admin' | 'ios-app' | 'api' | 'webhook';
  lastModifiedBy?: string | null;
  modificationReason?: string | null;
  paymentMethod?: PaymentMethod;
}


