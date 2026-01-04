/**
 * Visit Service
 * 
 * Handles visit queries for live tracking.
 */

import { db } from '@/config/firebase.config';
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  type Unsubscribe,
} from 'firebase/firestore';

export interface Visit {
  id: string;
  bookingId: string;
  sitterId: string;
  sitterName: string;
  clientId: string;
  clientName: string;
  status: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  address?: string;
  serviceSummary: string;
  petNames: string[];
}

class VisitService {
  /**
   * Map Firestore document to Visit object
   */
  private mapDocToVisit(doc: any, data: any): Visit {
    return {
      id: doc.id,
      bookingId: data.bookingId || doc.id,
      sitterId: data.sitterId || '',
      sitterName: data.sitterName || 'Unknown Sitter',
      clientId: data.clientId || '',
      clientName: data.clientName || 'Unknown Client',
      status: data.status === 'in_adventure' ? 'on_adventure' : (data.status || 'scheduled'), // Normalize legacy status
      scheduledStart: data.scheduledStart?.toDate() || new Date(),
      scheduledEnd: data.scheduledEnd?.toDate() || new Date(),
      address: data.address,
      serviceSummary: data.serviceSummary || data.serviceType || '',
      petNames: Array.isArray(data.petNames) ? data.petNames : 
               data.petName ? [data.petName] : [],
    };
  }

  /**
   * Check if a visit is currently active (started but not ended)
   * A visit is active if:
   * 1. Status is 'on_adventure' (sitter has started)
   * 2. Status is NOT 'completed', 'cancelled', or 'awaiting_report' (visit hasn't ended)
   * 3. Current time is within scheduled window (scheduledStart <= now <= scheduledEnd)
   *    OR visit has been started (we allow some flexibility for visits that run longer than scheduled)
   */
  private isVisitCurrentlyActive(visit: Visit): boolean {
    const now = new Date();
    const endedStatuses = ['completed', 'cancelled'];
    
    // Must have active status (ONLY 'on_adventure' - legacy 'in_adventure' removed)
    if (visit.status !== 'on_adventure') {
      return false;
    }
    
    // Must not be ended
    if (endedStatuses.includes(visit.status)) {
      return false;
    }
    
    // Visit should be within scheduled time window OR started (allow flexibility for longer visits)
    // We check if scheduledEnd is in the future OR if scheduledStart is in the past (visit has started)
    const isWithinScheduledWindow = visit.scheduledStart <= now && visit.scheduledEnd >= now;
    const hasStarted = visit.scheduledStart <= now;
    
    // Active if within window OR has started (even if past scheduledEnd, as long as status is still on_adventure)
    // This handles cases where visits run longer than scheduled
    return hasStarted && !endedStatuses.includes(visit.status);
  }

  /**
   * Get all active visits (on_adventure status means visit is in progress)
   * Only returns visits that:
   * - Have status 'on_adventure' (sitter has started)
   * - Are NOT completed or cancelled (visit hasn't ended)
   */
  async getActiveVisits(): Promise<Visit[]> {
    try {
      // Query for visits with active status (ONLY 'on_adventure' - legacy 'in_adventure' removed)
      const q = query(
        collection(db, 'visits'),
        where('status', '==', 'on_adventure'),
        limit(100) // Safety limit for one-time queries
      );
      
      const snapshot = await getDocs(q);
      const now = new Date();
      
      // Map and filter visits
      const visits = snapshot.docs
        .map(doc => this.mapDocToVisit(doc, doc.data()))
        .filter(visit => {
          // Filter out completed/cancelled visits
          if (visit.status === 'completed' || visit.status === 'cancelled') {
            return false;
          }
          
          // If status is 'on_adventure', trust it - don't filter by time
          // The status 'on_adventure' means the sitter has explicitly started the visit
          // Even if scheduledStart is in the future or scheduledEnd is past, if status is active, include it
          if (visit.status === 'on_adventure') {
            return true;
          }
          
          // For other statuses, apply time-based filters
          // Visit must have started (scheduledStart <= now)
          const hasStarted = visit.scheduledStart <= now;
          
          if (!hasStarted) {
            return false;
          }
          
          // Check if visit is stale (ended more than 24 hours ago but status wasn't updated)
          const hoursSinceEnd = (now.getTime() - visit.scheduledEnd.getTime()) / (1000 * 60 * 60);
          if (hoursSinceEnd > 24) {
            return false;
          }
          
          return true;
        });
      
      // Sort by scheduledStart in memory
      visits.sort((a, b) => a.scheduledStart.getTime() - b.scheduledStart.getTime());
      
      return visits;
    } catch (error) {
      console.error('[visitService] ❌ Error fetching active visits:', error);
      if (error instanceof Error) {
        console.error('[visitService] Error details:', error.message, error.stack);
      }
      return [];
    }
  }

  /**
   * Subscribe to active visits using real-time subscription
   * Uses single query for efficiency
   * Filters to only include visits that are currently active (started but not ended)
   */
  subscribeToActiveVisits(callback: (visits: Visit[]) => void): Unsubscribe {
    // Query without orderBy to avoid index requirement - we'll sort in memory
    const q = query(
      collection(db, 'visits'),
      where('status', '==', 'on_adventure')
    );
    
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds
    
    const setupSubscription = (): Unsubscribe => {
      return onSnapshot(q, (snapshot) => {
        // Reset retry count on successful update
        retryCount = 0;
        
        const now = new Date();
        
        // Map and filter visits to only include currently active ones
        const visits = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return this.mapDocToVisit(doc, data);
          })
          .filter(visit => {
            // Filter out completed/cancelled visits
            if (visit.status === 'completed' || visit.status === 'cancelled') {
              return false;
            }
            
            // ✅ CRITICAL FIX: If status is 'on_adventure', trust it - don't filter by time
            // The status 'on_adventure' means the sitter has explicitly started the visit
            if (visit.status === 'on_adventure') {
              return true;
            }
            
            // For other statuses, apply time-based filters
            // Visit must have started (scheduledStart <= now)
            const hasStarted = visit.scheduledStart <= now;
            
            if (!hasStarted) {
              return false;
            }
            
            // Check if visit is stale (ended more than 24 hours ago but status wasn't updated)
            const hoursSinceEnd = (now.getTime() - visit.scheduledEnd.getTime()) / (1000 * 60 * 60);
            if (hoursSinceEnd > 24) {
              return false;
            }
            
            return true;
          });
        
        // Sort by scheduledStart in memory
        visits.sort((a, b) => a.scheduledStart.getTime() - b.scheduledStart.getTime());
        
        callback(visits);
      }, (error) => {
        console.error('[visitService] Active visits subscription error:', error);
        
        // Retry logic for persistent failures
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`[visitService] Retrying subscription (attempt ${retryCount}/${maxRetries})...`);
          setTimeout(() => {
            setupSubscription();
          }, retryDelay * retryCount); // Exponential backoff
        } else {
          console.error('[visitService] Max retries exceeded for active visits subscription');
          // Return empty array on error (don't break the UI)
          callback([]);
        }
      });
    };
    
    return setupSubscription();
  }

  /**
   * Get visit by booking ID
   */
  async getVisitByBookingId(bookingId: string): Promise<Visit | null> {
    try {
      const q = query(
        collection(db, 'visits'),
        where('bookingId', '==', bookingId)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        // Try using bookingId as visitId (some visits use bookingId as document ID)
        const visitDoc = await getDocs(query(collection(db, 'visits'), where('__name__', '==', bookingId)));
        if (visitDoc.empty) return null;
        
        const doc = visitDoc.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          bookingId: data.bookingId || doc.id,
          sitterId: data.sitterId || '',
          sitterName: data.sitterName || 'Unknown Sitter',
          clientId: data.clientId || '',
          clientName: data.clientName || 'Unknown Client',
          status: data.status || 'scheduled',
          scheduledStart: data.scheduledStart?.toDate() || new Date(),
          scheduledEnd: data.scheduledEnd?.toDate() || new Date(),
          address: data.address,
          serviceSummary: data.serviceSummary || data.serviceType || '',
          petNames: Array.isArray(data.petNames) ? data.petNames : 
                   data.petName ? [data.petName] : [],
        };
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        bookingId: data.bookingId || doc.id,
        sitterId: data.sitterId || '',
        sitterName: data.sitterName || 'Unknown Sitter',
        clientId: data.clientId || '',
        clientName: data.clientName || 'Unknown Client',
        status: data.status || 'scheduled',
        scheduledStart: data.scheduledStart?.toDate() || new Date(),
        scheduledEnd: data.scheduledEnd?.toDate() || new Date(),
        address: data.address,
        serviceSummary: data.serviceSummary || data.serviceType || '',
        petNames: Array.isArray(data.petNames) ? data.petNames : 
                 data.petName ? [data.petName] : [],
      };
    } catch (error) {
      console.error('Error fetching visit by booking ID:', error);
      return null;
    }
  }
}

export const visitService = new VisitService();
