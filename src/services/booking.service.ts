import { db, auth, functions } from '@/config/firebase.config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  updateDoc,
  addDoc,
  setDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import type { Booking, BookingFilters, BookingStatus, AdminBookingCreate, PaymentStatus, AdminRecurringBookingCreate, RecurringBatch, RecurringBatchVisit, ServiceType, Address } from '@/types';
import {
  docToBooking,
  buildBookingQuery,
  applyPostQueryFilters,
  verifyAdminRole,
  verifyClient,
  getClientName,
  getSitterName,
  getRecurringDiscount,
  generateBookingDates,
  sendAdminBookingNotification,
} from './bookings/utils';
import { getAdminSettings } from './adminSettings.service';
import { generateAIRecommendations } from '@/features/ai-assignment/utils/aiAssignmentHelpers';
import { userService } from './user.service';
import { bookingAssignmentService } from './bookings/BookingAssignmentService';
import { recurringBatchService } from './bookings/RecurringBatchService';
import { adminBookingService } from './bookings/AdminBookingService';
import { bookingDateService } from './bookings/BookingDateService';

class BookingService {
  private readonly collectionName = 'serviceBookings';

  async getAllBookings(filters?: BookingFilters): Promise<Booking[]> {
    try {
      let q = query(collection(db, this.collectionName));
      console.log('🔍 Fetching bookings from collection:', this.collectionName);

      q = buildBookingQuery(q, filters);

      console.log('📤 Executing Firestore query...');
      const snapshot = await getDocs(q);
      console.log(`✅ Found ${snapshot.size} bookings`);
      
      const bookings: Booking[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Processing booking:', doc.id, data);
        bookings.push(docToBooking(doc.id, data));
      });

      console.log(`📊 Processed ${bookings.length} bookings`);

      return applyPostQueryFilters(bookings, filters);
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      console.error('Full error:', error);
      return [];
    }
  }

  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const docRef = doc(db, this.collectionName, bookingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docToBooking(docSnap.id, docSnap.data());
      }
      return null;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, bookingId);
      const bookingDoc = await getDoc(docRef);
      
      if (!bookingDoc.exists()) {
        throw new Error(`Booking ${bookingId} not found`);
      }
      
      const bookingData = bookingDoc.data();
      const recurringSeriesId = bookingData?.recurringSeriesId;
      const isRecurring = bookingData?.isRecurring === true;
      const hasSitter = !!bookingData?.sitterId;
      
      // ✅ BUSINESS RULE: Following industry best practices
      // "Scheduled" = approved but NO sitter assigned
      // "Approved" = approved WITH sitter assigned
      // If admin sets status to 'approved' but no sitter, automatically set to 'scheduled'
      let finalStatus = status;
      if (status === 'approved' && !hasSitter) {
        finalStatus = 'scheduled';
        console.log(`⚠️ Status set to 'scheduled' (approved but no sitter assigned) for booking ${bookingId}`);
      } else if (status === 'approved' && hasSitter) {
        finalStatus = 'approved';
      }
      
      // Update the current booking
      await updateDoc(docRef, {
        status: finalStatus,
        updatedAt: new Date(),
        ...(finalStatus === 'approved' && !bookingData?.approvedAt ? { approvedAt: serverTimestamp() } : {}),
      });
      
      // ✅ AUTO-ASSIGNMENT: Check if auto-assignment is enabled
      const adminSettings = await getAdminSettings();
      const shouldAutoAssign = adminSettings.autoAssignSittersOnApproval && (status === 'approved' || finalStatus === 'approved');
      
      // ✅ CRITICAL FIX: If this is a recurring series booking and status is 'approved' or 'scheduled',
      // approve ALL other pending bookings in the same series
      // If auto-assignment is ON, also assign sitters automatically
      if ((status === 'approved' || finalStatus === 'approved' || finalStatus === 'scheduled') && (recurringSeriesId || isRecurring)) {
        const seriesId = recurringSeriesId || bookingId; // Fallback to bookingId if no seriesId
        
        console.log(`🔄 Recurring series detected (seriesId: ${seriesId}). Approving all bookings in series...`);
        
        // Find all other bookings in this series that are still pending or scheduled
        const seriesBookingsQuery = query(
          collection(db, this.collectionName),
          where('recurringSeriesId', '==', seriesId),
          where('status', 'in', ['pending', 'scheduled'])
        );
        
        const seriesBookingsSnapshot = await getDocs(seriesBookingsQuery);
        const allSeriesBookings = [
          { id: bookingId, data: bookingData },
          ...seriesBookingsSnapshot.docs.map(d => ({ id: d.id, data: d.data() }))
        ];
        
        // If auto-assignment is enabled, get sitters and assign them
        let sitters: any[] = [];
        if (shouldAutoAssign) {
          try {
            sitters = await userService.getUsersByRole('petSitter');
            console.log(`🤖 Auto-assignment enabled. Found ${sitters.length} available sitters.`);
          } catch (error) {
            console.warn('Failed to fetch sitters for auto-assignment:', error);
          }
        }
        
        // Update all bookings in the series
        for (const booking of allSeriesBookings) {
          const bookingRef = doc(db, this.collectionName, booking.id);
          const bookingHasSitter = !!booking.data?.sitterId;
          
          // Set status based on sitter assignment: 'approved' if sitter exists, 'scheduled' if not
          const bookingStatus = bookingHasSitter ? 'approved' : 'scheduled';
          
          const updates: Record<string, unknown> = {
            status: bookingStatus,
            updatedAt: serverTimestamp(),
            approvedAt: serverTimestamp(),
          };
          
          // ✅ AUTO-ASSIGNMENT: If enabled, assign best sitter using AI recommendations
          if (shouldAutoAssign && sitters.length > 0 && !booking.data?.sitterId) {
            try {
              const bookingObj = docToBooking(booking.id, booking.data);
              const aiAssignment = await generateAIRecommendations(bookingObj, sitters);
              
              if (aiAssignment.recommendations.length > 0) {
                const bestSitter = aiAssignment.recommendations[0].sitter;
                const sitterName = `${bestSitter.firstName} ${bestSitter.lastName}`.trim() || 'Unknown Sitter';
                updates.sitterId = bestSitter.id;
                updates.sitterName = sitterName;
                console.log(`🤖 Auto-assigned sitter ${bestSitter.id} to booking ${booking.id} (score: ${aiAssignment.recommendations[0].score})`);
              } else {
                console.warn(`⚠️ No sitter recommendations found for booking ${booking.id}`);
              }
            } catch (error) {
              console.error(`Error auto-assigning sitter to booking ${booking.id}:`, error);
              // Continue without assignment if AI assignment fails
            }
          }
          
          // Update booking individually to trigger Cloud Functions
          await updateDoc(bookingRef, updates);
        }
        
        const otherBookingsCount = allSeriesBookings.length - 1;
        if (otherBookingsCount > 0) {
          if (shouldAutoAssign) {
            console.log(`✅ Approved and auto-assigned sitters to ${allSeriesBookings.length} bookings in recurring series ${seriesId}`);
          } else {
            console.log(`✅ Approved ${allSeriesBookings.length} bookings in recurring series ${seriesId} (sitters to be assigned manually)`);
          }
        }
      } else if (shouldAutoAssign && (status === 'approved' || finalStatus === 'approved') && !bookingData?.sitterId) {
        // ✅ AUTO-ASSIGNMENT: For single bookings, also auto-assign if enabled
        try {
          const sitters = await userService.getUsersByRole('petSitter');
          if (sitters.length > 0) {
            const bookingObj = docToBooking(bookingId, bookingData);
            const aiAssignment = await generateAIRecommendations(bookingObj, sitters);
            
            if (aiAssignment.recommendations.length > 0) {
              const bestSitter = aiAssignment.recommendations[0].sitter;
              const sitterName = `${bestSitter.firstName} ${bestSitter.lastName}`.trim() || 'Unknown Sitter';
              await updateDoc(docRef, {
                sitterId: bestSitter.id,
                sitterName: sitterName,
              });
              console.log(`🤖 Auto-assigned sitter ${bestSitter.id} to booking ${bookingId} (score: ${aiAssignment.recommendations[0].score})`);
            }
          }
        } catch (error) {
          console.error('Error auto-assigning sitter to single booking:', error);
          // Continue without assignment if AI assignment fails
        }
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  /// Assign sitter to a single booking (individual assignment)
  /// For recurring series, this only assigns to the specific booking
  async assignSitter(bookingId: string, sitterId: string | null): Promise<void> {
    return bookingAssignmentService.assignSitter(bookingId, sitterId);
  }

  /// Bulk assign sitter to all bookings in a recurring series
  /// Use this when admin wants to assign the same sitter to all visits
  /// Updates bookings individually to ensure Cloud Functions trigger for each
  async bulkAssignSitterToSeries(seriesId: string, sitterId: string | null): Promise<number> {
    return bookingAssignmentService.bulkAssignSitterToSeries(seriesId, sitterId);
  }

  /// Assign different sitters to specific bookings in a series
  /// assignments: Array of { bookingId, sitterId } pairs
  /// Updates bookings individually to ensure Cloud Functions trigger for each
  async assignSittersToSeriesBookings(assignments: Array<{ bookingId: string; sitterId: string | null }>): Promise<number> {
    return bookingAssignmentService.assignSittersToSeriesBookings(assignments);
  }

  async getRecurringBatches(status: string = 'scheduled'): Promise<RecurringBatch[]> {
    return recurringBatchService.getRecurringBatches(status);
  }

  async approveRecurringBatch(batchId: string): Promise<void> {
    return recurringBatchService.approveRecurringBatch(batchId);
  }

  async rejectRecurringBatch(batchId: string, reason: string): Promise<void> {
    return recurringBatchService.rejectRecurringBatch(batchId, reason);
  }

  async snoozeRecurringBatch(batchId: string, days: number): Promise<void> {
    return recurringBatchService.snoozeRecurringBatch(batchId, days);
  }

  async unassignSitter(bookingId: string): Promise<void> {
    return bookingAssignmentService.unassignSitter(bookingId);
  }

  /// Update scheduled date for a booking
  /// Admin-only operation with audit trail
  async updateScheduledDate(bookingId: string, newDate: Date, reason?: string): Promise<void> {
    return bookingDateService.updateScheduledDate(bookingId, newDate, reason);
  }

  /// Get all bookings in a recurring series
  async getSeriesBookings(seriesId: string): Promise<Booking[]> {
    try {
      const seriesBookingsQuery = query(
        collection(db, this.collectionName),
        where('recurringSeriesId', '==', seriesId),
        orderBy('scheduledDate', 'asc')
      );
      
      const snapshot = await getDocs(seriesBookingsQuery);
      const bookings: Booking[] = [];
      
      snapshot.forEach((doc) => {
        bookings.push(docToBooking(doc.id, doc.data()));
      });
      
      return bookings;
    } catch (error) {
      console.error('Error fetching series bookings:', error);
      throw error;
    }
  }

  async fixVisitForBooking(bookingId: string): Promise<void> {
    return bookingDateService.fixVisitForBooking(bookingId);
  }

  async fixVisitDates(): Promise<{
    success: boolean;
    totalVisits: number;
    fixed: number;
    errors: number;
    [key: string]: unknown;
  }> {
    return bookingDateService.fixVisitDates();
  }

  async createBooking(bookingData: Partial<Booking>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...bookingData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async createAdminBooking(bookingData: AdminBookingCreate): Promise<string> {
    return adminBookingService.createAdminBooking(bookingData);
  }

  async createAdminRecurringBooking(bookingData: AdminRecurringBookingCreate): Promise<string> {
    return adminBookingService.createAdminRecurringBooking(bookingData);
  }

  subscribeToBookings(callback: (bookings: Booking[]) => void): () => void {
    const q = query(
      collection(db, this.collectionName),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const bookings: Booking[] = [];
      snapshot.forEach((doc) => {
        bookings.push(docToBooking(doc.id, doc.data()));
      });
      callback(bookings);
    });
  }

  async getBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const bookings: Booking[] = [];

      snapshot.forEach((doc) => {
        bookings.push(docToBooking(doc.id, doc.data()));
      });

      return bookings;
    } catch (error) {
      console.error('Error fetching bookings by status:', error);
      throw error;
    }
  }

  async getActiveBookings(): Promise<Booking[]> {
    try {
      console.log('🔍 Fetching active bookings from collection:', this.collectionName);
      
      let q = query(
        collection(db, this.collectionName),
        where('status', 'in', ['active', 'approved']),
        orderBy('scheduledDate', 'asc')
      );

      const snapshot = await getDocs(q);
      console.log(`📊 Found ${snapshot.size} active/approved bookings`);
      
      if (snapshot.size === 0) {
        console.log('⚠️ No active bookings found. Checking approved bookings...');
        const approvedQuery = query(
          collection(db, this.collectionName),
          where('status', '==', 'approved')
        );
        const approvedSnapshot = await getDocs(approvedQuery);
        console.log(`📊 Found ${approvedSnapshot.size} approved bookings`);
        
        const pendingQuery = query(
          collection(db, this.collectionName),
          where('status', '==', 'pending')
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        console.log(`📊 Found ${pendingSnapshot.size} pending bookings that need approval`);
      }

      const bookings: Booking[] = [];

      snapshot.forEach((doc) => {
        bookings.push(docToBooking(doc.id, doc.data()));
      });

      return bookings;
    } catch (error) {
      console.error('Error fetching active bookings:', error);
      throw error;
    }
  }
}

export const bookingService = new BookingService();
