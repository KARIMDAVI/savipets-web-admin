import { db } from '@/config/firebase.config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import type { ClientActivity } from '@/features/crm/types/crm.types';
import { withErrorHandling } from '@/features/crm/utils/errorHandler';

/**
 * Service for CRM activities operations
 */
export class CRMActivitiesService {
  private readonly activitiesCollection = 'crm_activities';

  /**
   * Get activities for a specific client
   */
  async getClientActivities(
    clientId: string,
    limitCount?: number
  ): Promise<ClientActivity[]> {
    return (
      (await withErrorHandling(async () => {
        let q = query(
          collection(db, this.activitiesCollection),
          where('clientId', '==', clientId),
          orderBy('timestamp', 'desc')
        );
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as ClientActivity[];
      })) || []
    );
  }

  /**
   * Log a new activity
   */
  async logActivity(
    activity: Omit<ClientActivity, 'id' | 'timestamp'>
  ): Promise<ClientActivity | null> {
    return withErrorHandling(async () => {
      const docRef = await addDoc(collection(db, this.activitiesCollection), {
        ...activity,
        timestamp: serverTimestamp(),
      });
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Activity logging failed');
      }
      return {
        id: docSnap.id,
        ...docSnap.data(),
        timestamp: docSnap.data().timestamp?.toDate() || new Date(),
      } as ClientActivity;
    });
  }
}

export const crmActivitiesService = new CRMActivitiesService();


