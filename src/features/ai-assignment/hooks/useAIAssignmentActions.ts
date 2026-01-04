/**
 * useAIAssignmentActions Hook
 * 
 * Hook for handling AI assignment mutations.
 */

import { message } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import { verifyAdminRole } from '@/services/bookings/utils';
import { auth } from '@/config/firebase.config';

interface UseAIAssignmentActionsCallbacks {
  onAssignSuccess?: () => void;
  onOverrideSuccess?: () => void;
}

export const useAIAssignmentActions = (
  callbacks?: UseAIAssignmentActionsCallbacks
) => {
  const queryClient = useQueryClient();
  
  const assignSitter = async (bookingId: string, sitterId: string): Promise<void> => {
    try {
      // ✅ SECURITY: Verify admin permissions
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      await verifyAdminRole(currentUser.uid);
      
      // ✅ CONFLICT DETECTION: Check if booking still needs assignment
      const booking = await bookingService.getBookingById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }
      if (booking.sitterId) {
        throw new Error('Booking already has a sitter assigned');
      }
      
      await bookingService.assignSitter(bookingId, sitterId);
      
      // ✅ Invalidate relevant queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['ai-assignment-bookings'] });
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      await queryClient.invalidateQueries({ queryKey: ['bookings', bookingId] });
      
      callbacks?.onAssignSuccess?.();
      message.success('Sitter assigned successfully');
    } catch (error: any) {
      if (error.message?.includes('not authenticated') || error.message?.includes('admin')) {
        message.error('Permission denied: Admin access required');
      } else if (error.message?.includes('already has a sitter')) {
        message.warning('Booking already assigned. Refreshing...');
        // Refresh to show current state
        await queryClient.invalidateQueries({ queryKey: ['ai-assignment-bookings'] });
      } else {
        message.error('Failed to assign sitter: ' + (error.message || 'Unknown error'));
      }
      throw error;
    }
  };
  
  const overrideAssignment = async (bookingId: string, sitterId: string): Promise<void> => {
    try {
      // ✅ SECURITY: Verify admin permissions
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      await verifyAdminRole(currentUser.uid);
      
      await bookingService.assignSitter(bookingId, sitterId);
      
      // ✅ Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['ai-assignment-bookings'] });
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      await queryClient.invalidateQueries({ queryKey: ['bookings', bookingId] });
      
      callbacks?.onOverrideSuccess?.();
      message.success('Assignment overridden successfully');
    } catch (error: any) {
      if (error.message?.includes('not authenticated') || error.message?.includes('admin')) {
        message.error('Permission denied: Admin access required');
      } else {
        message.error('Failed to override assignment: ' + (error.message || 'Unknown error'));
      }
      throw error;
    }
  };
  
  return {
    assignSitter,
    overrideAssignment,
  };
};

