/**
 * Booking Validators
 * 
 * Utility functions for validating booking data.
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import type { AdminBookingCreate, AdminRecurringBookingCreate } from '@/types';

/**
 * Verify admin role
 */
export const verifyAdminRole = async (adminId: string): Promise<void> => {
  const adminDoc = await getDoc(doc(db, 'users', adminId));
  const adminData = adminDoc.data();

  if (!adminData || adminData.role !== 'admin') {
    throw new Error('Unauthorized: Admin role required');
  }
};

/**
 * Verify client exists and is a pet owner
 */
export const verifyClient = async (clientId: string): Promise<{ name: string; email: string }> => {
  const clientDoc = await getDoc(doc(db, 'users', clientId));
  const clientData = clientDoc.data();

  if (!clientDoc.exists()) {
    throw new Error('Client not found: Client ID does not exist');
  }

  if (clientData?.role !== 'petOwner') {
    throw new Error('Invalid client: Client must be a pet owner');
  }

  const clientName = `${clientData?.firstName || ''} ${clientData?.lastName || ''}`.trim() || clientData?.email || 'Unknown Client';
  return {
    name: clientName,
    email: clientData?.email || '',
  };
};

/**
 * Get client name for storage
 */
export const getClientName = async (clientId: string): Promise<string> => {
  const clientDoc = await getDoc(doc(db, 'users', clientId));
  const clientData = clientDoc.data();
  return `${clientData?.firstName || ''} ${clientData?.lastName || ''}`.trim() || clientData?.email || 'Unknown Client';
};

/**
 * Get sitter name for storage
 */
export const getSitterName = async (sitterId: string): Promise<string> => {
  const sitterDoc = await getDoc(doc(db, 'users', sitterId));
  const sitterData = sitterDoc.data();
  return sitterData?.displayName || sitterData?.name || `${sitterData?.firstName || ''} ${sitterData?.lastName || ''}`.trim() || 'Sitter';
};

