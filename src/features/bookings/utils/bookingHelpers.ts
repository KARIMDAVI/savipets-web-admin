/**
 * Booking Helper Functions
 * 
 * Utility functions for booking-related formatting and display logic.
 * Extracted from BookingsPageRefactored for reusability.
 */

import type { BookingStatus, ServiceType } from '../types/bookings.types';

/**
 * Get color for booking status tag
 */
export const getStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case 'pending':
      return 'orange';
    case 'approved':
      return 'blue';
    case 'scheduled':
      return 'cyan'; // Light blue to distinguish from approved
    case 'active':
      return 'green';
    case 'completed':
      return 'purple';
    case 'cancelled':
      return 'red';
    case 'rejected':
      return 'red';
    default:
      return 'default';
  }
};

/**
 * Get display name for service type
 */
export const getServiceTypeDisplayName = (serviceType: ServiceType): string => {
  switch (serviceType) {
    case 'dog-walking':
      return 'Dog Walking';
    case 'pet-sitting':
      return 'Pet Sitting';
    case 'overnight-care':
      return 'Overnight Care';
    case 'drop-in-visit':
      return 'Drop-in Visit';
    case 'transport':
      return 'Transport';
    default:
      return serviceType;
  }
};

