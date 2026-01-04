/**
 * Bookings Feature Types
 * 
 * Type definitions specific to the bookings feature.
 * Extracted from main types file for better organization and feature-based architecture.
 * 
 * Base types (Booking, BookingFilters, etc.) are re-exported from @/types for consistency.
 * Feature-specific types are defined here.
 */

import type { 
  Booking, 
  BookingFilters, 
  BookingStatus, 
  ServiceType,
  Address,
  PaymentStatus as BasePaymentStatus,
  PaymentMethod as BasePaymentMethod,
} from '@/types';

// Re-export base types for convenience
export type { 
  Booking, 
  BookingFilters, 
  BookingStatus,
  ServiceType,
  Address,
};

// Re-export payment types (these are used across features but commonly used in bookings)
export type PaymentMethod = BasePaymentMethod;
export type PaymentStatus = BasePaymentStatus;

/**
 * Booking view modes for the admin interface
 */
export type BookingViewMode = 'table' | 'calendar' | 'list';

/**
 * Recurring frequency options for recurring bookings
 */
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly';

/**
 * Admin booking creation payload
 * Used when admins create bookings on behalf of clients
 */
export interface AdminBookingCreate {
  clientId: string;
  clientName: string; // Client's display name for the booking
  sitterId?: string | null;
  serviceType: ServiceType;
  scheduledDate: Date;
  duration: number;
  pets: string[];
  specialInstructions?: string;
  address?: Address;
  price: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  adminNotes?: string;
}

/**
 * Recurring booking series
 * Represents a series of recurring bookings
 */
export interface RecurringSeries {
  id: string;
  clientId: string;
  serviceType: ServiceType;
  numberOfVisits: number;
  frequency: RecurringFrequency;
  startDate: Date;
  preferredTime: string;
  preferredDays?: number[];
  basePrice: number;
  totalPrice: number;
  pets: string[];
  specialInstructions?: string;
  status: string;
  createdAt: Date;
  assignedSitterId?: string | null;
  preferredSitterId?: string | null;
  completedVisits: number;
  canceledVisits: number;
  upcomingVisits: number;
  duration: number;
}

/**
 * Admin recurring booking creation payload
 * Used when admins create recurring booking series
 */
/**
 * Per-day schedule configuration for weekly recurring bookings
 */
export interface DayScheduleConfig {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  enabled: boolean;
  numberOfVisits: number; // 1 or 2
  visitTimes: string[]; // Array of times in "HH:mm" or "h:mm A" format
}

export interface AdminRecurringBookingCreate {
  clientId: string;
  sitterId?: string | null;
  serviceType: ServiceType;
  numberOfVisits: number;
  frequency: RecurringFrequency;
  startDate: Date;
  preferredTime: string;
  preferredDays?: number[];
  visitsPerDay?: number; // Number of visits per day (for weekly/monthly) - DEPRECATED: use daySchedules
  daySchedules?: DayScheduleConfig[]; // Per-day configuration for weekly bookings
  duration: number;
  basePrice: number;
  pets: string[];
  specialInstructions?: string;
  address?: Address;
  paymentMethod: PaymentMethod;
  adminNotes?: string;
}

/**
 * Extended booking with computed properties
 * Used for display purposes in the UI
 */
export interface BookingWithDetails extends Booking {
  clientName?: string;
  sitterName?: string;
  petNames?: string[];
  formattedPrice?: string;
}

