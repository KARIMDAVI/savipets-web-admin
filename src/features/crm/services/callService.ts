/**
 * Call Service
 * 
 * Service for logging phone calls.
 */

import { db } from '@/config/firebase.config';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import type { CallLog } from '../types/communication.types';
import { handleCRMError, withErrorHandling } from '../utils/errorHandler';

class CallService {
  private readonly callsCollection = 'crm_calls';

  /**
   * Log a phone call
   */
  async logCall(
    callData: Omit<CallLog, 'id' | 'createdAt'>
  ): Promise<CallLog | null> {
    return withErrorHandling(async () => {
      const docRef = await addDoc(collection(db, this.callsCollection), {
        ...callData,
        createdAt: serverTimestamp(),
      });

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      const data = docSnap.data();

      return {
        id: docSnap.id,
        ...callData,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as CallLog;
    });
  }

  /**
   * Get call logs for a client
   */
  async getClientCalls(clientId: string): Promise<CallLog[]> {
    return (
      (await withErrorHandling(async () => {
        const q = query(
          collection(db, this.callsCollection),
          where('clientId', '==', clientId),
          orderBy('startedAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            clientId: data.clientId as string,
            phoneNumber: data.phoneNumber as string,
            direction: data.direction as CallLog['direction'],
            duration: data.duration as number | undefined,
            status: data.status as CallLog['status'],
            notes: data.notes as string | undefined,
            recordingUrl: data.recordingUrl as string | undefined,
            startedAt: data.startedAt?.toDate() || new Date(),
            endedAt: data.endedAt?.toDate(),
            createdBy: data.createdBy as string,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as CallLog;
        });
      })) || []
    );
  }

  /**
   * Update call log
   */
  async updateCall(
    callId: string,
    updates: Partial<CallLog>
  ): Promise<void> {
    await withErrorHandling(async () => {
      const { id, createdAt, ...updateData } = updates;
      const callRef = doc(db, this.callsCollection, callId);
      await updateDoc(callRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    });
  }
}

export const callService = new CallService();

