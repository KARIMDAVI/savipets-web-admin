import { db } from '@/config/firebase.config';
import { 
  doc, 
  getDoc,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import type { SitterLocation } from '../tracking.service';

/**
 * Service for sitter location operations
 */
export class SitterLocationService {
  /**
   * Get real-time location of a sitter
   */
  async getSitterLocation(sitterId: string): Promise<SitterLocation['location'] | null> {
    try {
      const docRef = doc(db, 'locations', sitterId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          lat: data.lat || data.latitude,
          lng: data.lng || data.longitude,
          accuracy: data.accuracy,
          speed: data.speed,
          heading: data.heading,
          timestamp: data.lastUpdated?.toDate() || data.updatedAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching sitter location:', error);
      return null;
    }
  }

  /**
   * Subscribe to real-time location updates for a sitter
   */
  subscribeToSitterLocation(sitterId: string, callback: (location: SitterLocation['location'] | null) => void): Unsubscribe {
    const docRef = doc(db, 'locations', sitterId);
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const lat = data.lat || data.latitude;
          const lng = data.lng || data.longitude;
          const lastUpdated = data.lastUpdated?.toDate?.() || data.updatedAt?.toDate?.();
          
          if (!lat || !lng) {
            console.error(`[SitterLocationService] Missing lat/lng for ${sitterId}`);
            callback(null);
            return;
          }
          
          const location = {
            lat,
            lng,
            accuracy: data.accuracy,
            speed: data.speed,
            heading: data.heading,
            timestamp: lastUpdated || new Date(),
          };
          
          callback(location);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error(`[SitterLocationService] Error subscribing to locations/${sitterId}:`, error);
        if (error.code === 'permission-denied') {
          console.error(`[SitterLocationService] Permission denied - Check Firestore security rules`);
        }
        callback(null);
      }
    );
    
    return unsubscribe;
  }

  /**
   * Subscribe to real-time location updates for multiple sitters
   */
  subscribeToMultipleSitterLocations(
    sitterIds: string[],
    callback: (locations: Map<string, SitterLocation['location']>) => void
  ): Unsubscribe[] {
    const unsubscribes: Unsubscribe[] = [];
    const locationsMap = new Map<string, SitterLocation['location']>();
    
    sitterIds.forEach(sitterId => {
      const unsubscribe = this.subscribeToSitterLocation(sitterId, (location) => {
        if (location) {
          locationsMap.set(sitterId, location);
        } else {
          locationsMap.delete(sitterId);
        }
        callback(new Map(locationsMap));
      });
      unsubscribes.push(unsubscribe);
    });
    
    return unsubscribes;
  }
}

export const sitterLocationService = new SitterLocationService();


