/**
 * useBookingActions Hook
 * 
 * Custom hook for booking mutations (assign, approve, reject, create, etc.).
 * Extracted from Bookings.tsx for reusability and testability.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import { useBookingStore } from '../stores/useBookingStore';
import { message } from 'antd';
import type { 
  Booking, 
  AdminBookingCreate, 
  AdminRecurringBookingCreate 
} from '../types/bookings.types';

/**
 * Hook for booking actions (mutations)
 * 
 * @returns Object with action handlers and loading states
 */
export const useBookingActions = () => {
  const queryClient = useQueryClient();
  const {
    setAssignModalVisible,
    setDetailDrawerVisible,
    setCreateBookingModalVisible,
    setSelectedBooking,
    resetCreateBookingForm,
  } = useBookingStore();

  // Assign sitter mutation (individual assignment)
  const assignSitterMutation = useMutation({
    mutationFn: ({ bookingId, sitterId }: { bookingId: string; sitterId: string | null }) =>
      bookingService.assignSitter(bookingId, sitterId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setAssignModalVisible(false);
      message.success(variables.sitterId ? 'Sitter assigned successfully' : 'Sitter removed successfully');
    },
    onError: () => {
      message.error('Failed to assign sitter');
    },
  });

  // Bulk assign sitter to series mutation
  const bulkAssignSitterToSeriesMutation = useMutation({
    mutationFn: ({ seriesId, sitterId }: { seriesId: string; sitterId: string | null }) =>
      bookingService.bulkAssignSitterToSeries(seriesId, sitterId),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      message.success(`Sitter assigned to ${count} bookings in series`);
    },
    onError: () => {
      message.error('Failed to bulk assign sitter to series');
    },
  });

  // Assign multiple sitters to series bookings mutation
  const assignSittersToSeriesMutation = useMutation({
    mutationFn: (assignments: Array<{ bookingId: string; sitterId: string | null }>) =>
      bookingService.assignSittersToSeriesBookings(assignments),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      message.success(`Assigned sitters to ${count} bookings`);
    },
    onError: () => {
      message.error('Failed to assign sitters to series bookings');
    },
  });

  // Approve booking mutation
  const approveBookingMutation = useMutation({
    mutationFn: (bookingId: string) =>
      bookingService.updateBookingStatus(bookingId, 'approved'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      message.success('Booking approved successfully');
    },
    onError: () => {
      message.error('Failed to approve booking');
    },
  });

  // Reject booking mutation
  const rejectBookingMutation = useMutation({
    mutationFn: (bookingId: string) =>
      bookingService.updateBookingStatus(bookingId, 'rejected'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      message.success('Booking rejected successfully');
    },
    onError: () => {
      message.error('Failed to reject booking');
    },
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: string) =>
      bookingService.updateBookingStatus(bookingId, 'cancelled'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      message.success('Booking cancelled successfully');
    },
    onError: () => {
      message.error('Failed to cancel booking');
    },
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (bookingData: AdminBookingCreate) =>
      bookingService.createAdminBooking(bookingData),
    onSuccess: (bookingId: string) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setCreateBookingModalVisible(false);
      resetCreateBookingForm();
      message.success(`Booking created successfully! ID: ${bookingId.slice(-8)}`);
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to create booking');
    },
  });

  // Create recurring booking mutation
  const createRecurringBookingMutation = useMutation({
    mutationFn: (bookingData: AdminRecurringBookingCreate) =>
      bookingService.createAdminRecurringBooking(bookingData),
    onSuccess: (seriesId: string, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setCreateBookingModalVisible(false);
      resetCreateBookingForm();
      message.success(
        `Recurring booking created successfully! ${variables.numberOfVisits} visits scheduled. Series ID: ${seriesId.slice(-8)}`
      );
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to create recurring booking');
    },
  });

  // View booking (loads booking and opens drawer)
  // Fix visit mutation - updates visit document with sitterId and correct times
  const fixVisitMutation = useMutation({
    mutationFn: (bookingId: string) =>
      bookingService.fixVisitForBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      message.success('Visit fixed successfully - should appear on sitter schedule now');
    },
    onError: (error: any) => {
      message.error(`Failed to fix visit: ${error.message || 'Unknown error'}`);
    },
  });

  // Update scheduled date mutation
  const updateScheduledDateMutation = useMutation({
    mutationFn: ({ bookingId, newDate, reason }: { bookingId: string; newDate: Date; reason?: string }) =>
      bookingService.updateScheduledDate(bookingId, newDate, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      message.success('Scheduled date updated successfully');
    },
    onError: (error: any) => {
      message.error(`Failed to update scheduled date: ${error.message || 'Unknown error'}`);
    },
  });

  const viewBookingMutation = useMutation({
    mutationFn: (bookingId: string) => bookingService.getBookingById(bookingId),
    onSuccess: (booking: Booking | null) => {
      if (booking) {
        setSelectedBooking(booking);
        setDetailDrawerVisible(true);
      } else {
        message.error('Booking not found');
      }
    },
    onError: () => {
      message.error('Failed to load booking details');
    },
  });

  return {
    // Action handlers
    handleAssignSitter: (bookingId: string, sitterId: string) =>
      assignSitterMutation.mutate({ bookingId, sitterId }),
    handleUnassignSitter: (bookingId: string) =>
      assignSitterMutation.mutate({ bookingId, sitterId: null }),
    handleBulkAssignSitterToSeries: (seriesId: string, sitterId: string | null) =>
      bulkAssignSitterToSeriesMutation.mutate({ seriesId, sitterId }),
    handleAssignSittersToSeries: (assignments: Array<{ bookingId: string; sitterId: string | null }>) =>
      assignSittersToSeriesMutation.mutate(assignments),
    handleApproveBooking: (bookingId: string) =>
      approveBookingMutation.mutate(bookingId),
    handleRejectBooking: (bookingId: string) =>
      rejectBookingMutation.mutate(bookingId),
    handleCancelBooking: (bookingId: string) =>
      cancelBookingMutation.mutate(bookingId),
    handleCreateBooking: (bookingData: AdminBookingCreate) =>
      createBookingMutation.mutate(bookingData),
    handleCreateRecurringBooking: (bookingData: AdminRecurringBookingCreate) =>
      createRecurringBookingMutation.mutate(bookingData),
    handleViewBooking: (bookingId: string) =>
      viewBookingMutation.mutate(bookingId),
    handleFixVisit: (bookingId: string) =>
      fixVisitMutation.mutate(bookingId),
    handleUpdateScheduledDate: async (bookingId: string, newDate: Date, reason?: string) =>
      updateScheduledDateMutation.mutateAsync({ bookingId, newDate, reason }),

    // Loading states
    isAssigning: assignSitterMutation.isPending,
    isBulkAssigning: bulkAssignSitterToSeriesMutation.isPending,
    isAssigningMultiple: assignSittersToSeriesMutation.isPending,
    isApproving: approveBookingMutation.isPending,
    isRejecting: rejectBookingMutation.isPending,
    isCancelling: cancelBookingMutation.isPending,
    isCreating: createBookingMutation.isPending,
    isCreatingRecurring: createRecurringBookingMutation.isPending,
    isViewing: viewBookingMutation.isPending,
    isFixingVisit: fixVisitMutation.isPending,
    isUpdatingScheduledDate: updateScheduledDateMutation.isPending,
  };
};

