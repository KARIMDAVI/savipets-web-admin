/**
 * Hook for exporting bookings to CSV
 */

import { message } from 'antd';
import dayjs from 'dayjs';
import type { Booking } from '../types/bookings.types';
import { formatCurrency } from '@/shared/utils/formatters';
import { getServiceTypeDisplayName } from '../utils/bookingHelpers';

interface UseBookingExportOptions {
  bookings: Booking[];
  getUserName: (userId: string) => string;
}

/**
 * Hook that provides export functionality for bookings
 */
export const useBookingExport = ({ bookings, getUserName }: UseBookingExportOptions) => {
  const exportBookings = () => {
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

  return { exportBookings };
};

