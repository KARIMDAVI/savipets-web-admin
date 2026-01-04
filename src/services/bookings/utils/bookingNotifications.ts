/**
 * Booking Notifications
 * 
 * Utility functions for sending booking-related notifications.
 */

import { collection, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase.config';

/**
 * Send admin booking notification to client
 */
export const sendAdminBookingNotification = async (
  bookingId: string,
  clientId: string,
  adminId: string,
  type: 'single' | 'recurring' = 'single'
): Promise<void> => {
  try {
    const [clientDoc, adminDoc] = await Promise.all([
      getDoc(doc(db, 'users', clientId)),
      getDoc(doc(db, 'users', adminId))
    ]);

    const clientData = clientDoc.data();
    const adminData = adminDoc.data();

    if (!clientData || !adminData) {
      console.warn('Could not send notification: missing data');
      return;
    }

    const title = type === 'recurring' 
      ? '📅 Recurring Bookings Created by Admin'
      : '📅 Booking Created by Admin';
      
    const message = type === 'recurring'
      ? `${adminData.firstName || 'Admin'} has scheduled recurring visits for you`
      : `${adminData.firstName || 'Admin'} has scheduled a service for you`;

    const notification = {
      recipientId: clientId,
      title,
      message,
      type: 'admin_booking_created',
      bookingId: bookingId,
      read: false,
      createdAt: serverTimestamp(),
      metadata: {
        adminId,
        adminName: `${adminData.firstName || ''} ${adminData.lastName || ''}`.trim(),
        bookingType: type,
      }
    };

    await addDoc(collection(db, 'notifications'), notification);
    console.log(`✅ Admin booking notification sent to client (${type})`);
  } catch (error) {
    console.error('Error sending admin booking notification:', error);
    // Don't throw - notification failure shouldn't block booking creation
  }
};

