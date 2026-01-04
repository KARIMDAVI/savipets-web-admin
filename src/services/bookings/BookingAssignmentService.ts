import { db, auth } from '@/config/firebase.config';
import { 
  collection, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy,
  getDocs,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { getSitterName } from '../bookings/utils';

/**
 * Service for handling booking sitter assignments
 */
export class BookingAssignmentService {
  private readonly collectionName = 'serviceBookings';

  /**
   * Assign sitter to a single booking (individual assignment)
   * For recurring series, this only assigns to the specific booking
   */
  async assignSitter(bookingId: string, sitterId: string | null): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Admin not authenticated');
      }

      const sitterName = sitterId ? await getSitterName(sitterId) : null;

      const bookingDoc = await getDoc(doc(db, this.collectionName, bookingId));
      if (!bookingDoc.exists()) {
        throw new Error(`Booking ${bookingId} not found`);
      }
      
      const existingData = bookingDoc.data();
      
      const updates: Record<string, unknown> = {
        sitterId: sitterId ?? null,
        sitterName,
        updatedAt: serverTimestamp(),
        lastModifiedBy: currentUser.uid,
        ...(existingData?.createdAt ? {} : { createdAt: serverTimestamp() }),
        createdBy: existingData?.createdBy || currentUser.uid,
      };

      // Auto-approve pending or scheduled bookings when sitter is assigned
      // Following industry best practices: when sitter is assigned, booking becomes "approved"
      if (sitterId && (existingData?.status === 'pending' || existingData?.status === 'scheduled')) {
        updates.status = 'approved';
        updates.approvedAt = serverTimestamp();
      }

      const docRef = doc(db, this.collectionName, bookingId);
      await updateDoc(docRef, updates);
      
      if (sitterId) {
        console.log(`✅ Assigned sitter ${sitterId} to booking ${bookingId} (individual assignment)`);
      } else {
        console.log(`✅ Unassigned sitter from booking ${bookingId}`);
      }
    } catch (error) {
      console.error('Error assigning sitter:', error);
      throw error;
    }
  }

  /**
   * Bulk assign sitter to all bookings in a recurring series
   * Use this when admin wants to assign the same sitter to all visits
   * Updates bookings individually to ensure Cloud Functions trigger for each
   */
  async bulkAssignSitterToSeries(seriesId: string, sitterId: string | null): Promise<number> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Admin not authenticated');
      }

      const sitterName = sitterId ? await getSitterName(sitterId) : null;

      // Find all bookings in this series
      const seriesBookingsQuery = query(
        collection(db, this.collectionName),
        where('recurringSeriesId', '==', seriesId),
        orderBy('scheduledDate', 'asc')
      );
      
      const seriesBookingsSnapshot = await getDocs(seriesBookingsQuery);
      
      if (seriesBookingsSnapshot.empty) {
        console.log(`ℹ️ No bookings found in series ${seriesId}`);
        return 0;
      }
      
      console.log(`🔄 Bulk assigning sitter ${sitterId || 'null'} to ${seriesBookingsSnapshot.size} bookings in series ${seriesId}...`);
      
      // Update bookings individually to ensure Cloud Functions trigger for each
      // This ensures visits are created for all bookings
      let assignedCount = 0;
      
      for (const bookingDoc of seriesBookingsSnapshot.docs) {
        const bookingData = bookingDoc.data();
        const bookingRef = bookingDoc.ref;
        
        const seriesUpdates: Record<string, unknown> = {
          sitterId: sitterId ?? null,
          sitterName: sitterName,
          updatedAt: serverTimestamp(),
          lastModifiedBy: currentUser.uid,
        };
        
        // Auto-approve pending or scheduled bookings when sitter is assigned
        // Following industry best practices: when sitter is assigned, booking becomes "approved"
        if (sitterId && (bookingData?.status === 'pending' || bookingData?.status === 'scheduled')) {
          seriesUpdates.status = 'approved';
          seriesUpdates.approvedAt = serverTimestamp();
        }
        
        // Update individually to trigger Cloud Functions for each booking
        await updateDoc(bookingRef, seriesUpdates);
        assignedCount++;
        
        // Small delay to prevent overwhelming Firestore (optional, but safer)
        if (assignedCount % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log(`✅ Bulk assigned sitter ${sitterId || 'null'} to ${assignedCount} bookings in recurring series ${seriesId}`);
      console.log(`📋 Cloud Functions should create visits for all ${assignedCount} bookings`);
      
      return assignedCount;
    } catch (error) {
      console.error('Error bulk assigning sitter to series:', error);
      throw error;
    }
  }

  /**
   * Assign different sitters to specific bookings in a series
   * assignments: Array of { bookingId, sitterId } pairs
   * Updates bookings individually to ensure Cloud Functions trigger for each
   */
  async assignSittersToSeriesBookings(assignments: Array<{ bookingId: string; sitterId: string | null }>): Promise<number> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Admin not authenticated');
      }

      if (assignments.length === 0) {
        return 0;
      }

      // Get all sitter names in one batch
      const sitterIds = assignments.filter(a => a.sitterId).map(a => a.sitterId!);
      const uniqueSitterIds = [...new Set(sitterIds)];
      const sitterNamesMap = new Map<string, string>();
      
      for (const sitterId of uniqueSitterIds) {
        try {
          const sitterName = await getSitterName(sitterId);
          sitterNamesMap.set(sitterId, sitterName);
        } catch (error) {
          console.warn(`Could not fetch sitter name for ${sitterId}:`, error);
          sitterNamesMap.set(sitterId, 'Unknown Sitter');
        }
      }

      // Update bookings individually to ensure Cloud Functions trigger for each
      let assignedCount = 0;

      for (const assignment of assignments) {
        const { bookingId, sitterId } = assignment;
        const bookingRef = doc(db, this.collectionName, bookingId);
        
        // Verify booking exists
        const bookingDoc = await getDoc(bookingRef);
        if (!bookingDoc.exists()) {
          console.warn(`Booking ${bookingId} not found, skipping`);
          continue;
        }

        const bookingData = bookingDoc.data();
        const updates: Record<string, unknown> = {
          sitterId: sitterId ?? null,
          sitterName: sitterId ? sitterNamesMap.get(sitterId) : null,
          updatedAt: serverTimestamp(),
          lastModifiedBy: currentUser.uid,
        };

        // Auto-approve pending or scheduled bookings when sitter is assigned
        // Following industry best practices: when sitter is assigned, booking becomes "approved"
        if (sitterId && (bookingData?.status === 'pending' || bookingData?.status === 'scheduled')) {
          updates.status = 'approved';
          updates.approvedAt = serverTimestamp();
        }

        // Update individually to trigger Cloud Functions
        await updateDoc(bookingRef, updates);
        assignedCount++;
        
        // Small delay to prevent overwhelming Firestore
        if (assignedCount % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`✅ Assigned sitters to ${assignedCount} bookings in series`);
      console.log(`📋 Cloud Functions should create visits for all ${assignedCount} bookings`);
      
      return assignedCount;
    } catch (error) {
      console.error('Error assigning sitters to series bookings:', error);
      throw error;
    }
  }

  /**
   * Unassign sitter from a booking
   */
  async unassignSitter(bookingId: string): Promise<void> {
    await this.assignSitter(bookingId, null);
  }
}

export const bookingAssignmentService = new BookingAssignmentService();


