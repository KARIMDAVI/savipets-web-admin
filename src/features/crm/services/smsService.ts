/**
 * SMS Service
 * 
 * Service for sending SMS messages.
 * Note: This is a placeholder service. In production, integrate with
 * your SMS provider (Twilio, AWS SNS, etc.)
 */

import { db } from '@/config/firebase.config';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import type { SMSCommunication } from '../types/communication.types';
import { handleCRMError, withErrorHandling } from '../utils/errorHandler';

class SMSService {
  private readonly smsCollection = 'crm_sms';

  /**
   * Send SMS
   * Note: This is a placeholder. In production, integrate with your SMS provider
   */
  async sendSMS(
    smsData: Omit<SMSCommunication, 'id' | 'createdAt' | 'status' | 'sentAt'>
  ): Promise<SMSCommunication | null> {
    return withErrorHandling(async () => {
      // TODO: Integrate with actual SMS provider (Twilio, AWS SNS, etc.)
      // For now, we'll just log it to Firestore

      const smsRecord: Omit<SMSCommunication, 'id'> = {
        ...smsData,
        status: 'sent', // In production, this would be set after successful send
        sentAt: new Date(),
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, this.smsCollection), {
        ...smsRecord,
        createdAt: serverTimestamp(),
        sentAt: serverTimestamp(),
      });

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      const data = docSnap.data();

      return {
        id: docSnap.id,
        ...smsRecord,
        createdAt: data.createdAt?.toDate() || new Date(),
        sentAt: data.sentAt?.toDate(),
      } as SMSCommunication;
    });
  }

  /**
   * Get SMS messages for a client
   */
  async getClientSMS(clientId: string): Promise<SMSCommunication[]> {
    return (
      (await withErrorHandling(async () => {
        const q = query(
          collection(db, this.smsCollection),
          where('clientId', '==', clientId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            clientId: data.clientId as string,
            to: data.to as string,
            from: data.from as string,
            message: data.message as string,
            status: data.status as SMSCommunication['status'],
            sentAt: data.sentAt?.toDate(),
            deliveredAt: data.deliveredAt?.toDate(),
            error: data.error as string | undefined,
            metadata: data.metadata as Record<string, unknown> | undefined,
            createdBy: data.createdBy as string,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as SMSCommunication;
        });
      })) || []
    );
  }
}

export const smsService = new SMSService();

