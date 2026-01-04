import { db, auth, functions } from '@/config/firebase.config';
import { 
  doc, 
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { verifyAdminRole } from '../bookings/utils';

/**
 * Service for handling booking date operations
 */
export class BookingDateService {
  private readonly collectionName = 'serviceBookings';

  /**
   * Update scheduled date for a booking
   * Admin-only operation with audit trail
   */
  async updateScheduledDate(bookingId: string, newDate: Date, reason?: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Admin not authenticated');
      }

      // Verify admin role
      await verifyAdminRole(currentUser.uid);

      // Verify booking exists
      const bookingDoc = await getDoc(doc(db, this.collectionName, bookingId));
      if (!bookingDoc.exists()) {
        throw new Error(`Booking ${bookingId} not found`);
      }

      // Validate the new date
      if (!(newDate instanceof Date) || isNaN(newDate.getTime())) {
        throw new Error('Invalid date provided');
      }

      // Convert Date to Firestore Timestamp
      const scheduledTimestamp = Timestamp.fromDate(newDate);
      
      // Extract time string from newDate (format: "H:MM AM/PM")
      const hours = newDate.getHours();
      const minutes = newDate.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

      // Prepare updates with audit trail
      const updates: Record<string, unknown> = {
        scheduledDate: scheduledTimestamp,
        scheduledTime: timeStr, // Also update scheduledTime field
        updatedAt: serverTimestamp(),
        lastModifiedBy: currentUser.uid,
      };

      // Add modification reason if provided
      if (reason) {
        updates.modificationReason = reason;
      }

      // Update the booking
      const docRef = doc(db, this.collectionName, bookingId);
      await updateDoc(docRef, updates);

      console.log(`✅ Updated scheduled date for booking ${bookingId} to ${newDate.toISOString()}`);
    } catch (error) {
      console.error('Error updating scheduled date:', error);
      throw error;
    }
  }

  /**
   * Fix visit for a specific booking
   */
  async fixVisitForBooking(bookingId: string): Promise<void> {
    try {
      const callable = httpsCallable<{ bookingId: string }, { success: boolean }>(
        functions,
        'fixSpecificVisit'
      );
      const result = await callable({ bookingId });
      if (!result.data?.success) {
        throw new Error('Failed to fix visit for booking');
      }
      console.log(`✅ Fixed visit for booking ${bookingId}`);
    } catch (error) {
      console.error('Error fixing visit for booking:', error);
      throw error;
    }
  }

  /**
   * Fix visit dates for all bookings
   */
  async fixVisitDates(): Promise<{
    success: boolean;
    totalVisits: number;
    fixed: number;
    errors: number;
    [key: string]: unknown;
  }> {
    try {
      const callable = httpsCallable<
        void,
        {
          success: boolean;
          totalVisits: number;
          fixed: number;
          errors: number;
          [key: string]: unknown;
        }
      >(functions, 'fixVisitDates');
      const result = await callable();
      const data = result.data ?? {};
      return {
        ...data,
        success: Boolean(data.success),
        totalVisits: Number(data.totalVisits ?? 0),
        fixed: Number(data.fixed ?? 0),
        errors: Number(data.errors ?? 0),
      };
    } catch (error) {
      console.error('Error fixing visit dates:', error);
      throw error;
    }
  }
}

export const bookingDateService = new BookingDateService();

