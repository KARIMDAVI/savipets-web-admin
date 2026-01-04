/**
 * Booking Handlers Hook
 * 
 * Custom hook for handling booking-related actions (create, approve, reject, assign, etc.).
 */

import { useCallback, useState } from 'react';
import { message } from 'antd';
import { bookingService } from '@/services/booking.service';
import { userService } from '@/services/user.service';
import { db } from '@/config/firebase.config';
import { getDoc, doc } from 'firebase/firestore';
import dayjs from 'dayjs';
import type { Booking, DayScheduleConfig } from '@/types';

interface UseBookingHandlersProps {
  refetch: () => void;
  onBookingCreated?: () => void;
}

export const useBookingHandlers = ({ refetch, onBookingCreated }: UseBookingHandlersProps) => {
  const [loading, setLoading] = useState(false);
  const [assigningSitter, setAssigningSitter] = useState(false);

  const handleApproveBooking = useCallback(async (bookingId: string) => {
    try {
      await bookingService.updateBookingStatus(bookingId, 'approved');
      message.success('Booking approved successfully');
      refetch();
    } catch (error) {
      message.error('Failed to approve booking');
    }
  }, [refetch]);

  const handleRejectBooking = useCallback(async (bookingId: string) => {
    try {
      await bookingService.updateBookingStatus(bookingId, 'rejected');
      message.success('Booking rejected successfully');
      refetch();
    } catch (error) {
      message.error('Failed to reject booking');
    }
  }, [refetch]);

  const handleAssignSitter = useCallback(async (bookingId: string, sitterId: string) => {
    try {
      setAssigningSitter(true);
      await bookingService.assignSitter(bookingId, sitterId);
      message.success('Sitter assigned successfully');
      refetch();
      return true;
    } catch (error) {
      message.error('Failed to assign sitter');
      return false;
    } finally {
      setAssigningSitter(false);
    }
  }, [refetch]);

  const handleUnassignSitter = useCallback(async (bookingId: string) => {
    try {
      setAssigningSitter(true);
      await bookingService.unassignSitter(bookingId);
      message.success('Sitter removed successfully');
      refetch();
    } catch (error) {
      message.error('Failed to unassign sitter');
    } finally {
      setAssigningSitter(false);
    }
  }, [refetch]);

  const handleUpdateScheduledDate = useCallback(async (bookingId: string, newDate: Date) => {
    try {
      setLoading(true);
      await bookingService.updateScheduledDate(bookingId, newDate);
      message.success('Scheduled date updated successfully');
      refetch();
    } catch (error: any) {
      message.error(error.message || 'Failed to update scheduled date');
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  const handleCreateBooking = useCallback(async (values: any) => {
    try {
      setLoading(true);
      
      const isRecurringBooking = values.isRecurring === 'recurring' || values.isRecurring === true;
      const finalPrice = values.paymentMethod === 'comp' ? 0 : (values.price || 0);
      
      if (isRecurringBooking) {
        const recurringData: any = {
          clientId: values.clientId,
          sitterId: values.sitterId || null,
          serviceType: values.serviceType,
          numberOfVisits: values.numberOfVisits || 5,
          frequency: values.frequency || 'weekly',
          startDate: values.scheduledDate.toDate(),
          preferredTime: values.scheduledDate.format('h:mm A'),
          duration: values.duration,
          basePrice: finalPrice,
          pets: values.pets || [],
          specialInstructions: values.specialInstructions || '',
          address: values.address || null,
          paymentMethod: values.paymentMethod,
          adminNotes: values.adminNotes || '',
        };
        
        if (values.frequency === 'weekly') {
          if (values.daySchedules && Array.isArray(values.daySchedules) && values.daySchedules.length > 0) {
            const enabledDays = values.daySchedules.filter((day: DayScheduleConfig) => day.enabled && day.visitTimes && day.visitTimes.length > 0);
            
            if (enabledDays.length > 0) {
              recurringData.daySchedules = values.daySchedules;
              recurringData.preferredDays = enabledDays.map((day: DayScheduleConfig) => day.dayOfWeek);
            } else {
              recurringData.preferredDays = values.preferredDays || [];
              recurringData.visitsPerDay = values.visitsPerDay || 1;
              
              if (!recurringData.preferredDays || recurringData.preferredDays.length === 0) {
                message.error('Please configure at least one day for weekly bookings (either using day schedule or preferred days)');
                setLoading(false);
                return;
              }
            }
          } else {
            recurringData.preferredDays = values.preferredDays || [];
            recurringData.visitsPerDay = values.visitsPerDay || 1;
            
            if (values.frequency === 'weekly' && (!recurringData.preferredDays || recurringData.preferredDays.length === 0)) {
              message.error('Please select at least one day of the week for weekly bookings');
              setLoading(false);
              return;
            }
          }
        } else {
          recurringData.preferredDays = values.preferredDays || [];
          recurringData.visitsPerDay = values.visitsPerDay || 1;
        }
        
        const seriesId = await bookingService.createAdminRecurringBooking(recurringData);
        message.success(`Recurring booking created successfully! ${values.numberOfVisits} visits scheduled. Series ID: ${seriesId.slice(-8)}`);
        onBookingCreated?.();
        refetch();
      } else {
        const clientDoc = await getDoc(doc(db, 'users', values.clientId));
        const clientData = clientDoc.data();
        const clientName = `${clientData?.firstName || ''} ${clientData?.lastName || ''}`.trim() || 'Unknown Client';
        
        const bookingData = {
          clientId: values.clientId,
          clientName: clientName,
          sitterId: values.sitterId || null,
          serviceType: values.serviceType,
          scheduledDate: values.scheduledDate.toDate(),
          duration: values.duration,
          pets: values.pets || [],
          specialInstructions: values.specialInstructions || '',
          address: values.address || null,
          price: finalPrice,
          paymentMethod: values.paymentMethod,
          adminNotes: values.adminNotes || '',
        };
        
        const bookingId = await bookingService.createAdminBooking(bookingData);
        message.success(`Booking created successfully! ID: ${bookingId.slice(-8)}`);
        onBookingCreated?.();
        refetch();
      }
      
    } catch (error: any) {
      message.error(error.message || 'Failed to create booking');
      console.error('Booking creation error:', error);
    } finally {
      setLoading(false);
    }
  }, [refetch, onBookingCreated]);

  return {
    loading,
    assigningSitter,
    handleApproveBooking,
    handleRejectBooking,
    handleAssignSitter,
    handleUnassignSitter,
    handleUpdateScheduledDate,
    handleCreateBooking,
  };
};


