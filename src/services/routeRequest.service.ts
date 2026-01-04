/**
 * Route Request Service
 * 
 * Handles route requests from owners to admins.
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
  onSnapshot,
  type Unsubscribe,
  serverTimestamp,
} from 'firebase/firestore';

export interface RouteRequest {
  id: string;
  ownerId: string;
  sitterId: string;
  visitId: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'denied';
  adminId?: string;
  approvedAt?: Date;
  deniedAt?: Date;
  routeData?: any;
}

class RouteRequestService {
  /**
   * Create a route request from owner
   */
  async createRouteRequest(
    ownerId: string,
    sitterId: string,
    visitId: string
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'routeRequests'), {
        ownerId,
        sitterId,
        visitId,
        status: 'pending',
        requestedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating route request:', error);
      throw error;
    }
  }

  /**
   * Get route request by ID
   */
  async getRouteRequest(requestId: string): Promise<RouteRequest | null> {
    try {
      const docRef = doc(db, 'routeRequests', requestId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ownerId: data.ownerId,
          sitterId: data.sitterId,
          visitId: data.visitId,
          requestedAt: data.requestedAt?.toDate() || new Date(),
          status: data.status || 'pending',
          adminId: data.adminId,
          approvedAt: data.approvedAt?.toDate(),
          deniedAt: data.deniedAt?.toDate(),
          routeData: data.routeData,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching route request:', error);
      return null;
    }
  }

  /**
   * Get all pending route requests
   */
  async getPendingRouteRequests(): Promise<RouteRequest[]> {
    try {
      const q = query(
        collection(db, 'routeRequests'),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ownerId: data.ownerId,
          sitterId: data.sitterId,
          visitId: data.visitId,
          requestedAt: data.requestedAt?.toDate() || new Date(),
          status: data.status || 'pending',
          adminId: data.adminId,
          approvedAt: data.approvedAt?.toDate(),
          deniedAt: data.deniedAt?.toDate(),
          routeData: data.routeData,
        };
      });
    } catch (error) {
      console.error('Error fetching pending route requests:', error);
      return [];
    }
  }

  /**
   * Subscribe to pending route requests
   */
  subscribeToPendingRouteRequests(
    callback: (requests: RouteRequest[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'routeRequests'),
      where('status', '==', 'pending')
    );
    
    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ownerId: data.ownerId,
          sitterId: data.sitterId,
          visitId: data.visitId,
          requestedAt: data.requestedAt?.toDate() || new Date(),
          status: data.status || 'pending',
          adminId: data.adminId,
          approvedAt: data.approvedAt?.toDate(),
          deniedAt: data.deniedAt?.toDate(),
          routeData: data.routeData,
        };
      });
      callback(requests);
    }, (error) => {
      console.error('Error subscribing to route requests:', error);
      callback([]);
    });
  }

  /**
   * Approve route request and attach route data
   */
  async approveRouteRequest(
    requestId: string,
    adminId: string,
    routeData: any
  ): Promise<void> {
    try {
      const docRef = doc(db, 'routeRequests', requestId);
      await updateDoc(docRef, {
        status: 'approved',
        adminId,
        routeData,
        approvedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error approving route request:', error);
      throw error;
    }
  }

  /**
   * Deny route request
   */
  async denyRouteRequest(requestId: string, adminId: string): Promise<void> {
    try {
      const docRef = doc(db, 'routeRequests', requestId);
      await updateDoc(docRef, {
        status: 'denied',
        adminId,
        deniedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error denying route request:', error);
      throw error;
    }
  }
}

export const routeRequestService = new RouteRequestService();

