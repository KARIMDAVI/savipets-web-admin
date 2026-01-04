import { db } from '@/config/firebase.config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import type { ClientSegment } from '@/features/crm/types/crm.types';
import { withErrorHandling } from '@/features/crm/utils/errorHandler';
import {
  generateCacheKey,
  queryCache,
  deduplicateResults,
} from '@/features/crm/utils/queryOptimizer';

/**
 * Service for CRM segments operations
 */
export class CRMSegmentsService {
  private readonly segmentsCollection = 'crm_segments';

  /**
   * Get all segments
   * Optimized with caching and query limits
   */
  async getSegments(): Promise<ClientSegment[]> {
    return (
      (await withErrorHandling(async () => {
        const cacheKey = generateCacheKey(this.segmentsCollection);
        const cached = queryCache.get<ClientSegment[]>(cacheKey);
        if (cached) {
          return cached;
        }
        
        const q = query(
          collection(db, this.segmentsCollection),
          orderBy('name', 'asc')
        );
        
        const snapshot = await getDocs(q);
        const segments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          clientCount: doc.data().clientCount || 0,
        })) as ClientSegment[];
        
        const deduplicatedSegments = deduplicateResults(segments);
        queryCache.set(cacheKey, deduplicatedSegments);
        
        return deduplicatedSegments;
      })) || []
    );
  }

  /**
   * Create a new segment
   */
  async createSegment(
    segmentData: Omit<ClientSegment, 'id' | 'clientCount'>
  ): Promise<ClientSegment | null> {
    return withErrorHandling(async () => {
      const docRef = await addDoc(collection(db, this.segmentsCollection), {
        ...segmentData,
        clientCount: 0,
      });
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Segment creation failed');
      }
      return {
        id: docSnap.id,
        ...docSnap.data(),
        clientCount: docSnap.data().clientCount || 0,
      } as ClientSegment;
    });
  }

  /**
   * Update an existing segment
   */
  async updateSegment(
    segmentId: string,
    updates: Partial<ClientSegment>
  ): Promise<void> {
    await withErrorHandling(async () => {
      await updateDoc(doc(db, this.segmentsCollection, segmentId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    });
  }

  /**
   * Delete a segment
   */
  async deleteSegment(segmentId: string): Promise<void> {
    await withErrorHandling(async () => {
      await deleteDoc(doc(db, this.segmentsCollection, segmentId));
    });
  }
}

export const crmSegmentsService = new CRMSegmentsService();


