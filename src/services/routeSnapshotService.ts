/**
 * Route Snapshot Service
 * 
 * Handles fetching and managing route snapshot data from Firestore.
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/config/firebase.config';
import { auth } from '@/config/firebase.config';

export interface RouteSnapshot {
  visitId: string;
  sitterId: string;
  clientId: string;
  screenshotURL: string;
  storagePath: string;
  startTime: Date;
  endTime: Date;
  totalDistance: number;
  totalDuration: number;
  pointCount: number;
  createdAt: Date;
  createdBy: string;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface SnapshotFilters {
  sitterId?: string;
  clientId?: string;
  startDate?: Date;
  endDate?: Date;
}

class RouteSnapshotService {
  private readonly COLLECTION = 'routeSnapshots';

  /**
   * Fetch route snapshots with filters
   */
  async getSnapshots(filters: SnapshotFilters = {}): Promise<RouteSnapshot[]> {
    let q = query(collection(db, this.COLLECTION));

    // Apply filters
    if (filters.sitterId) {
      q = query(q, where('sitterId', '==', filters.sitterId));
    }

    if (filters.clientId) {
      q = query(q, where('clientId', '==', filters.clientId));
    }

    if (filters.startDate) {
      q = query(q, where('startTime', '>=', Timestamp.fromDate(filters.startDate)));
    }

    if (filters.endDate) {
      q = query(q, where('startTime', '<=', Timestamp.fromDate(filters.endDate)));
    }

    // Only non-deleted
    q = query(q, where('isDeleted', '==', false));

    // Order by most recent
    q = query(q, orderBy('startTime', 'desc'), limit(100));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => this.mapSnapshot(doc));
  }

  /**
   * Get single snapshot
   */
  async getSnapshot(visitId: string): Promise<RouteSnapshot | null> {
    const docRef = doc(db, this.COLLECTION, visitId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return this.mapSnapshot(docSnap);
  }

  /**
   * Delete snapshot (admin only - enforced by security rules)
   */
  async deleteSnapshot(visitId: string, storagePath: string): Promise<void> {
    // Delete from Cloud Storage
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);

    // Soft delete in Firestore (preserve audit trail)
    const docRef = doc(db, this.COLLECTION, visitId);
    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: auth.currentUser?.uid || null
    });
  }

  /**
   * Get statistics
   */
  async getStats(sitterId?: string): Promise<{
    totalSnapshots: number;
    totalDistance: number;
    avgDistance: number;
    last7Days: number;
  }> {
    let q = query(collection(db, this.COLLECTION));

    if (sitterId) {
      q = query(q, where('sitterId', '==', sitterId));
    }

    q = query(q, where('isDeleted', '==', false));

    const snapshot = await getDocs(q);
    const snapshots = snapshot.docs.map(doc => this.mapSnapshot(doc));

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return {
      totalSnapshots: snapshots.length,
      totalDistance: snapshots.reduce((sum, s) => sum + s.totalDistance, 0),
      avgDistance: snapshots.length > 0
        ? snapshots.reduce((sum, s) => sum + s.totalDistance, 0) / snapshots.length
        : 0,
      last7Days: snapshots.filter(s => s.startTime >= sevenDaysAgo).length
    };
  }

  private mapSnapshot(doc: any): RouteSnapshot {
    const data = doc.data();
    return {
      visitId: data.visitId,
      sitterId: data.sitterId,
      clientId: data.clientId,
      screenshotURL: data.screenshotURL,
      storagePath: data.storagePath,
      startTime: data.startTime.toDate(),
      endTime: data.endTime.toDate(),
      totalDistance: data.totalDistance,
      totalDuration: data.totalDuration,
      pointCount: data.pointCount,
      createdAt: data.createdAt.toDate(),
      createdBy: data.createdBy,
      isDeleted: data.isDeleted || false,
      deletedAt: data.deletedAt?.toDate(),
      deletedBy: data.deletedBy
    };
  }
}

export const routeSnapshotService = new RouteSnapshotService();

