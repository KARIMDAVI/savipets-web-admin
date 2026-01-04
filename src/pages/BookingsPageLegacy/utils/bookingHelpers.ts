/**
 * Booking Helper Functions
 * 
 * Utility functions for booking-related operations.
 */

import dayjs from 'dayjs';
import { message } from 'antd';
import type { Booking, BookingStatus, ServiceType } from '@/types';
import { formatCurrency } from '@/shared/utils/formatters';
import { getStatusColor, getServiceTypeDisplayName } from '@/features/bookings/utils/bookingHelpers';

/**
 * Export bookings to CSV
 */
export const exportBookingsToCSV = (
  bookings: Booking[],
  getUserName: (userId: string | null | undefined) => string
): void => {
  const csvContent = [
    ['Booking ID', 'Service', 'Client', 'Sitter', 'Pets', 'Scheduled Date', 'Duration', 'Price', 'Status'],
    ...bookings.map(booking => [
      booking.id.slice(-8),
      getServiceTypeDisplayName(booking.serviceType),
      getUserName(booking.clientId),
      booking.sitterId ? getUserName(booking.sitterId) : 'Unassigned',
      booking.pets && booking.pets.length > 0 ? booking.pets.join('; ') : 'None',
      dayjs(booking.scheduledDate).format('MMM DD, YYYY h:mm A'),
      `${booking.duration} min`,
      formatCurrency(booking.price),
      booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bookings-${dayjs().format('YYYY-MM-DD')}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  message.success('Bookings exported successfully');
};


