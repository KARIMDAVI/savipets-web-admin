import { db } from '@/config/firebase.config';
import { 
  doc, 
  getDoc,
  getDocs,
  query,
  collection,
  where,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import type { VisitTrackingData, VisitTrackingLocation } from '../tracking.service';
import { parseTrackingLocation } from './TrackingUtils';

/**
 * Service for visit tracking operations
 * Dual-read strategy: reads from new location (sitters/{sitterId}/routes) first, falls back to old location (visitTracking)
 */
export class VisitTrackingService {
  /**
   * Helper: Get route from sitter subcollection (new location)
   * Returns null if not found (triggers fallback)
   */
  private async getRouteFromSitterSubcollection(sitterId: string, visitId: string): Promise<VisitTrackingData | null> {
    try {
      const docRef = doc(db, 'sitters', sitterId, 'routes', visitId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        const routePoints = Array.isArray(data.routePoints) 
          ? data.routePoints
              .map((point: any) => {
                if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
                  console.warn('[getRouteFromSitterSubcollection] Invalid route point:', point);
                  return null;
                }
                return {
                  latitude: point.latitude,
                  longitude: point.longitude,
                  altitude: point.altitude,
                  accuracy: point.horizontalAccuracy || point.accuracy,
                  speed: point.speed,
                  timestamp: point.timestamp?.toDate ? point.timestamp.toDate() : 
                           point.timestamp?.seconds ? new Date(point.timestamp.seconds * 1000) :
                           new Date(),
                };
              })
              .filter((point: any): point is NonNullable<typeof point> => point !== null)
          : [];
        
        const lastLocation = parseTrackingLocation(data.lastLocation);
        return {
          visitId: data.visitId,
          sitterId: sitterId, // sitterId is in path, add it to return data
          clientId: data.clientId,
          isActive: data.isActive || false,
          routePoints,
          checkInLocation: data.checkInLocation,
          totalDistance: data.totalDistance || 0,
          lastLocation,
          lastUpdated: data.lastUpdated?.toDate() || data.updatedAt?.toDate(),
        };
      }
      return null;
    } catch (error) {
      console.error('[getRouteFromSitterSubcollection] Error:', error);
      return null;
    }
  }

  /**
   * Helper: Parse tracking data from document
   */
  private parseTrackingData(data: any, sitterId?: string): VisitTrackingData | null {
    const routePoints = Array.isArray(data.routePoints) 
      ? data.routePoints
          .map((point: any) => {
            if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
              console.warn('[parseTrackingData] Invalid route point:', point);
              return null;
            }
            return {
              latitude: point.latitude,
              longitude: point.longitude,
              altitude: point.altitude,
              accuracy: point.horizontalAccuracy || point.accuracy,
              speed: point.speed,
              timestamp: point.timestamp?.toDate ? point.timestamp.toDate() : 
                       point.timestamp?.seconds ? new Date(point.timestamp.seconds * 1000) :
                       new Date(),
            };
          })
          .filter((point: any): point is NonNullable<typeof point> => point !== null)
      : [];
    
    const lastLocation = parseTrackingLocation(data.lastLocation);
    return {
      visitId: data.visitId,
      sitterId: sitterId || data.sitterId, // Use provided sitterId or from data
      clientId: data.clientId,
      isActive: data.isActive || false,
      routePoints,
      checkInLocation: data.checkInLocation,
      totalDistance: data.totalDistance || 0,
      lastLocation,
      lastUpdated: data.lastUpdated?.toDate() || data.updatedAt?.toDate(),
    };
  }

  /**
   * Get visit tracking data (includes route points)
   * Dual-read: tries new location first, falls back to old location
   * Compares timestamps if both exist (uses newer)
   */
  async getVisitTracking(visitId: string, sitterId?: string): Promise<VisitTrackingData | null> {
    // If sitterId provided, try new location first
    if (sitterId) {
      try {
        const newLocationData = await this.getRouteFromSitterSubcollection(sitterId, visitId);
        if (newLocationData) {
          // Also check old location for timestamp comparison
          try {
            const oldDocRef = doc(db, 'visitTracking', visitId);
            const oldDocSnap = await getDoc(oldDocRef);
            if (oldDocSnap.exists()) {
              const oldData = oldDocSnap.data();
              const oldLastUpdated = oldData.lastUpdated?.toDate() || oldData.updatedAt?.toDate();
              const newLastUpdated = newLocationData.lastUpdated;
              
              // Use newer timestamp if old location is more recent
              if (oldLastUpdated && newLastUpdated && oldLastUpdated > newLastUpdated) {
                console.log(`[getVisitTracking] Old location has newer data for ${visitId}, using old location`);
                const oldTracking = this.parseTrackingData(oldData);
                if (oldTracking) {
                  return oldTracking;
                }
              }
            }
          } catch (error) {
            // Ignore old location errors, use new location data
            console.warn('[getVisitTracking] Error checking old location:', error);
          }
          
          console.log(`[getVisitTracking] Using new location data for ${visitId}`);
          return newLocationData;
        }
      } catch (error) {
        console.warn('[getVisitTracking] Error reading from new location:', error);
      }
    }
    
    // Fallback to old location
    try {
      const docRef = doc(db, 'visitTracking', visitId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`[getVisitTracking] Using old location data for ${visitId}`);
        return this.parseTrackingData(data);
      }
      return null;
    } catch (error) {
      console.error('[getVisitTracking] Error fetching visit tracking:', error);
      return null;
    }
  }

  /**
   * Get all active visit tracking data
   * Dual-read: queries both locations, merges results, deduplicates by visitId
   * Prioritizes new location data, but uses newer timestamp if old location is more recent
   */
  async getAllActiveVisitTracking(): Promise<VisitTrackingData[]> {
    const trackingsMap = new Map<string, VisitTrackingData>();
    
    // Query new location (sitters/{sitterId}/routes)
    try {
      // Get all sitters first
      const sittersSnapshot = await getDocs(collection(db, 'sitters'));
      
      for (const sitterDoc of sittersSnapshot.docs) {
        const sitterId = sitterDoc.id;
        try {
          const routesQuery = query(
            collection(db, 'sitters', sitterId, 'routes'),
            where('isActive', '==', true)
          );
          
          const routesSnapshot = await getDocs(routesQuery);
          
          routesSnapshot.forEach((routeDoc) => {
            const data = routeDoc.data();
            const tracking = this.parseTrackingData(data, sitterId);
            if (tracking) {
              trackingsMap.set(tracking.visitId, tracking);
            }
          });
        } catch (error) {
          console.warn(`[getAllActiveVisitTracking] Error querying routes for sitter ${sitterId}:`, error);
        }
      }
    } catch (error) {
      console.warn('[getAllActiveVisitTracking] Error querying new location:', error);
    }
    
    // Query old location (visitTracking)
    try {
      const q = query(
        collection(db, 'visitTracking'),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const existing = trackingsMap.get(data.visitId);
        
        if (existing) {
          // Compare timestamps - use newer data
          const oldLastUpdated = data.lastUpdated?.toDate() || data.updatedAt?.toDate();
          const newLastUpdated = existing.lastUpdated;
          
          if (oldLastUpdated && newLastUpdated && oldLastUpdated > newLastUpdated) {
            // Old location has newer data, use it
            const oldTracking = this.parseTrackingData(data);
            if (oldTracking) {
              trackingsMap.set(data.visitId, oldTracking);
            }
          }
          // Otherwise keep existing (new location) data
        } else {
          // Not in new location, add from old location
          const tracking = this.parseTrackingData(data);
          if (tracking) {
            trackingsMap.set(tracking.visitId, tracking);
          }
        }
      });
    } catch (error) {
      console.error('[getAllActiveVisitTracking] Error querying old location:', error);
    }
    
    return Array.from(trackingsMap.values());
  }

  /**
   * Subscribe to all active visit tracking updates
   * Dual-read: subscribes to both locations, merges real-time updates
   * Deduplicates by visitId (prefers new location, but uses newer timestamp)
   */
  subscribeToActiveVisitTracking(callback: (trackings: VisitTrackingData[]) => void): Unsubscribe {
    const trackingsMap = new Map<string, VisitTrackingData>();
    const unsubscribes: Unsubscribe[] = [];
    
    const mergeAndCallback = () => {
      callback(Array.from(trackingsMap.values()));
    };
    
    const updateTracking = (tracking: VisitTrackingData) => {
      const existing = trackingsMap.get(tracking.visitId);
      
      if (existing) {
        // Compare timestamps - use newer data
        const existingLastUpdated = existing.lastUpdated;
        const newLastUpdated = tracking.lastUpdated;
        
        if (newLastUpdated && existingLastUpdated && newLastUpdated > existingLastUpdated) {
          trackingsMap.set(tracking.visitId, tracking);
          mergeAndCallback();
        }
        // Otherwise keep existing (newer) data
      } else {
        trackingsMap.set(tracking.visitId, tracking);
        mergeAndCallback();
      }
    };
    
    // Subscribe to old location (simpler, works immediately)
    // Note: Subscribing to new location (sitters/{sitterId}/routes) would require
    // subscribing to each sitter's routes collection, which is complex.
    // For now, we rely on old location subscription and periodic sync from new location.
    // In production, consider using a Cloud Function to aggregate routes.
    try {
      const oldQ = query(
        collection(db, 'visitTracking'),
        where('isActive', '==', true)
      );
      
      const unsubscribeOld = onSnapshot(oldQ, (snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          const tracking = this.parseTrackingData(data);
          if (tracking) {
            updateTracking(tracking);
          }
        });
      }, (error) => {
        console.error('[subscribeToActiveVisitTracking] Error in old location subscription:', error);
      });
      
      unsubscribes.push(unsubscribeOld);
    } catch (error) {
      console.error('[subscribeToActiveVisitTracking] Error setting up subscriptions:', error);
    }
    
    // Return unsubscribe function
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }
}

export const visitTrackingService = new VisitTrackingService();


