/**
 * Shared Constants
 * 
 * Common constants used across the application
 */

/**
 * Booking status values
 */
export const BOOKING_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  SCHEDULED: 'scheduled',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

/**
 * Service types
 */
export const SERVICE_TYPES = {
  WALKING: 'walking',
  SITTING: 'sitting',
  BOARDING: 'boarding',
  DAYCARE: 'daycare',
} as const;

/**
 * User roles
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  PET_OWNER: 'pet_owner',
  PET_SITTER: 'pet_sitter',
} as const;

/**
 * Payment methods
 */
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  SQUARE: 'square',
} as const;

/**
 * Recurring frequency options
 */
export const RECURRING_FREQUENCY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const;

/**
 * View modes for listings
 */
export const VIEW_MODES = {
  TABLE: 'table',
  CALENDAR: 'calendar',
  LIST: 'list',
} as const;

/**
 * Date format strings
 */
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  TIME: 'h:mm A',
  DATETIME: 'MMM DD, YYYY h:mm A',
  ISO: 'YYYY-MM-DD',
} as const;

