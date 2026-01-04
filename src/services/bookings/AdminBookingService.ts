import { db, auth } from '@/config/firebase.config';
import { 
  collection, 
  doc, 
  setDoc,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import type { 
  AdminBookingCreate, 
  AdminRecurringBookingCreate, 
  BookingStatus, 
  PaymentStatus, 
  ServiceType, 
  Address 
} from '@/types';
import {
  verifyAdminRole,
  verifyClient,
  getRecurringDiscount,
  generateBookingDates,
  sendAdminBookingNotification,
} from '../bookings/utils';
import type { FirestoreBookingDocument, FirestoreRecurringSeriesDocument } from './types';

/**
 * Service for admin booking creation operations
 */
export class AdminBookingService {
  private readonly collectionName = 'serviceBookings';

  /**
   * Create a single booking as an admin
   */
  async createAdminBooking(bookingData: AdminBookingCreate): Promise<string> {
    try {
      const currentAdmin = auth.currentUser;
      if (!currentAdmin) {
        throw new Error('Admin not authenticated');
      }

      await verifyAdminRole(currentAdmin.uid);
      const clientInfo = await verifyClient(bookingData.clientId);

      const bookingId = doc(collection(db, this.collectionName)).id;
      const bookingRef = doc(db, this.collectionName, bookingId);

      // Business rule: Status logic
      // - If payment is cash/check/comp → approved (auto-approved)
      //   - If sitter assigned → status = 'approved'
      //   - If NO sitter assigned → status = 'scheduled' (approved but waiting for sitter)
      // - Otherwise → status = 'pending' (needs admin approval)
      const hasSitter = !!bookingData.sitterId;
      const isAutoApproved = ['cash', 'check', 'comp'].includes(bookingData.paymentMethod);
      
      let initialStatus: BookingStatus = 'pending';
      let initialPaymentStatus: PaymentStatus = 'pending';

      if (isAutoApproved) {
        // Auto-approved: set to 'approved' if sitter assigned, 'scheduled' if not
        initialStatus = hasSitter ? 'approved' : 'scheduled';
        initialPaymentStatus = bookingData.paymentMethod === 'comp' ? 'waived' : 'confirmed';
      }

      const scheduledTimestamp = bookingData.scheduledDate instanceof Date
        ? Timestamp.fromDate(bookingData.scheduledDate)
        : bookingData.scheduledDate;
      
      const booking: FirestoreBookingDocument = {
        id: bookingId,
        clientId: bookingData.clientId,
        clientName: bookingData.clientName || clientInfo.name,
        sitterId: bookingData.sitterId || null,
        serviceType: bookingData.serviceType,
        status: initialStatus,
        ...(isAutoApproved && hasSitter ? { approvedAt: serverTimestamp() } : {}),
        scheduledDate: scheduledTimestamp,
        timeZoneIdentifier: Intl.DateTimeFormat().resolvedOptions().timeZone,
        duration: bookingData.duration,
        pets: bookingData.pets || [],
        specialInstructions: bookingData.specialInstructions || null,
        address: bookingData.address || null,
        price: bookingData.price,
        paymentMethod: bookingData.paymentMethod,
        paymentStatus: bookingData.paymentStatus || initialPaymentStatus,
        paymentCollectedBy: bookingData.paymentMethod === 'cash' ? currentAdmin.uid : null,
        paymentReceivedAt: bookingData.paymentMethod === 'cash' ? new Date() : null,
        skipPaymentValidation: ['cash', 'check', 'comp'].includes(bookingData.paymentMethod),

        createdBy: currentAdmin.uid,
        createdByRole: 'admin',
        adminCreated: true,
        createdVia: 'web-admin',
        lastModifiedBy: currentAdmin.uid,
        modificationReason: bookingData.adminNotes || 'Admin-initiated booking',

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(bookingRef, booking);
      await sendAdminBookingNotification(bookingId, bookingData.clientId, currentAdmin.uid);

      console.log(`✅ Admin booking created: ${bookingId}`);
      return bookingId;
    } catch (error) {
      console.error('Error creating admin booking:', error);
      throw error;
    }
  }

  /**
   * Create a recurring booking series as an admin
   */
  async createAdminRecurringBooking(bookingData: AdminRecurringBookingCreate): Promise<string> {
    try {
      const currentAdmin = auth.currentUser;
      if (!currentAdmin) {
        throw new Error('Admin not authenticated');
      }

      await verifyAdminRole(currentAdmin.uid);
      const clientInfo = await verifyClient(bookingData.clientId);

      const discount = getRecurringDiscount(bookingData.frequency);
      const subtotal = bookingData.basePrice * bookingData.numberOfVisits;
      const totalPrice = subtotal * (1 - discount);

      const seriesId = doc(collection(db, 'recurringSeries')).id;
      const seriesRef = doc(db, 'recurringSeries', seriesId);

      const seriesData: FirestoreRecurringSeriesDocument = {
        id: seriesId,
        clientId: bookingData.clientId,
        serviceType: bookingData.serviceType,
        numberOfVisits: bookingData.numberOfVisits,
        frequency: bookingData.frequency,
        startDate: bookingData.startDate,
        preferredTime: bookingData.preferredTime,
        preferredDays: bookingData.preferredDays || [],
        basePrice: bookingData.basePrice,
        totalPrice: totalPrice,
        pets: bookingData.pets,
        specialInstructions: bookingData.specialInstructions || '',
        address: bookingData.address || null,
        status: 'pending',
        createdAt: serverTimestamp(),
        assignedSitterId: bookingData.sitterId || null,
        preferredSitterId: bookingData.sitterId || null,
        completedVisits: 0,
        canceledVisits: 0,
        upcomingVisits: bookingData.numberOfVisits,
        duration: bookingData.duration,

        createdBy: currentAdmin.uid,
        createdByRole: 'admin',
        adminCreated: true,
        createdVia: 'web-admin',
        lastModifiedBy: currentAdmin.uid,
        modificationReason: bookingData.adminNotes || 'Admin-initiated recurring booking',
        paymentMethod: bookingData.paymentMethod,
      };

      await setDoc(seriesRef, seriesData);

      const daySchedulesData = bookingData.daySchedules;
      const visitsPerDay = bookingData.visitsPerDay || 1;

      const bookingDates = generateBookingDates(
        bookingData.startDate,
        bookingData.preferredTime,
        bookingData.frequency,
        bookingData.preferredDays || [],
        bookingData.numberOfVisits,
        visitsPerDay,
        60, // timeIntervalMinutes
        bookingData.daySchedules
      );

      // Validate that we have booking dates to create
      if (!bookingDates || bookingDates.length === 0) {
        throw new Error('No booking dates generated. Please check your booking configuration.');
      }

      // Use batch writes for better reliability and atomicity
      const BATCH_SIZE = 500;
      const bookingRefs: Array<{ ref: any; data: FirestoreBookingDocument; visitNumber: number }> = [];

      // Prepare all booking documents first
      for (let i = 0; i < bookingDates.length; i++) {
        const bookingDate = bookingDates[i];
        const bookingId = doc(collection(db, this.collectionName)).id;
        const bookingRef = doc(db, this.collectionName, bookingId);

        const timeStr = new Date(bookingDate).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: 'numeric', 
          hour12: true 
        });
        
        // Business rule: Status logic for recurring bookings
        const hasSitter = !!bookingData.sitterId;
        const isAutoApproved = ['cash', 'check', 'comp'].includes(bookingData.paymentMethod);
        const status: BookingStatus = isAutoApproved 
          ? (hasSitter ? 'approved' : 'scheduled')
          : 'pending';
        const paymentStatus: PaymentStatus = bookingData.paymentMethod === 'comp' ? 'waived' : 'confirmed';

        const scheduledTimestamp = Timestamp.fromDate(bookingDate);
        
        const booking: FirestoreBookingDocument = {
          id: bookingId,
          clientId: bookingData.clientId,
          clientName: clientInfo.name,
          sitterId: bookingData.sitterId || null,
          serviceType: bookingData.serviceType,
          status: status,
          scheduledDate: scheduledTimestamp,
          scheduledTime: timeStr,
          timeZoneIdentifier: Intl.DateTimeFormat().resolvedOptions().timeZone,
          duration: bookingData.duration,
          pets: bookingData.pets,
          specialInstructions: bookingData.specialInstructions || null,
          address: bookingData.address || null,
          price: String(bookingData.basePrice),
          paymentMethod: bookingData.paymentMethod,
          paymentStatus: paymentStatus,
          paymentCollectedBy: bookingData.paymentMethod === 'cash' ? currentAdmin.uid : null,
          paymentReceivedAt: bookingData.paymentMethod === 'cash' ? new Date() : null,
          skipPaymentValidation: ['cash', 'check', 'comp'].includes(bookingData.paymentMethod),
          recurringSeriesId: seriesId,
          visitNumber: i + 1,
          isRecurring: true,

          createdBy: currentAdmin.uid,
          createdByRole: 'admin',
          adminCreated: true,
          createdVia: 'web-admin',
          lastModifiedBy: currentAdmin.uid,
          modificationReason: bookingData.adminNotes || 'Admin-initiated recurring booking',
          ...(isAutoApproved && hasSitter ? { approvedAt: serverTimestamp() } : {}),

          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        bookingRefs.push({ ref: bookingRef, data: booking, visitNumber: i + 1 });
      }

      // Write in batches (Firestore limit is 500 operations per batch)
      let totalWritten = 0;
      for (let batchStart = 0; batchStart < bookingRefs.length; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, bookingRefs.length);
        const batch = writeBatch(db);
        const batchItems = bookingRefs.slice(batchStart, batchEnd);
        const batchNumber = Math.floor(batchStart / BATCH_SIZE) + 1;

        for (const { ref, data } of batchItems) {
          batch.set(ref, data);
        }

        try {
          await batch.commit();
          totalWritten += batchItems.length;
        } catch (batchError: any) {
          console.error(`❌ Failed to write batch ${batchNumber}:`, batchError);
          throw new Error(`Failed to create ${batchItems.length} bookings in batch ${batchNumber}: ${batchError.message}`);
        }
      }

      if (totalWritten !== bookingDates.length) {
        throw new Error(`Expected to create ${bookingDates.length} bookings, but only ${totalWritten} were created.`);
      }

      // Verify bookings were created
      try {
        const verifyQuery = query(
          collection(db, this.collectionName),
          where('recurringSeriesId', '==', seriesId)
        );
        const verifySnapshot = await getDocs(verifyQuery);
        
        if (verifySnapshot.size !== totalWritten) {
          console.error(`❌ Mismatch: Created ${totalWritten} bookings but found ${verifySnapshot.size} in Firestore`);
        }
      } catch (verifyError: any) {
        console.error('❌ Failed to verify bookings in Firestore:', verifyError);
        // Don't throw - verification failure shouldn't block creation
      }

      await sendAdminBookingNotification(seriesId, bookingData.clientId, currentAdmin.uid, 'recurring');

      console.log(`✅ Admin recurring booking created: ${seriesId} with ${totalWritten} visits`);
      return seriesId;
    } catch (error) {
      console.error('Error creating admin recurring booking:', error);
      throw error;
    }
  }
}

export const adminBookingService = new AdminBookingService();

