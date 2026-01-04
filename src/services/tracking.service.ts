import type { Booking, User } from '@/types';
import { sitterLocationService } from './tracking/SitterLocationService';
import { visitTrackingService } from './tracking/VisitTrackingService';

export interface SitterLocation {
  sitterId: string;
  sitter: User;
  booking: Booking;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
    timestamp: Date;
  };
  status: 'active' | 'idle' | 'offline';
}

export interface VisitTrackingLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
}

export interface VisitTrackingData {
  visitId: string;
  sitterId: string;
  clientId: string;
  isActive: boolean;
  routePoints: Array<{
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    speed?: number;
    timestamp: Date;
  }>;
  checkInLocation?: {
    latitude: number;
    longitude: number;
  };
  totalDistance: number;
  lastLocation?: VisitTrackingLocation;
  lastUpdated?: Date;
}

/**
 * Tracking Service - Facade for all tracking operations
 * Delegates to specialized services for sitter locations and visit tracking
 */
class TrackingService {
  /**
   * Get real-time location of a sitter
   */
  async getSitterLocation(sitterId: string): Promise<SitterLocation['location'] | null> {
    return sitterLocationService.getSitterLocation(sitterId);
  }

  /**
   * Subscribe to real-time location updates for a sitter
   */
  subscribeToSitterLocation(sitterId: string, callback: (location: SitterLocation['location'] | null) => void) {
    return sitterLocationService.subscribeToSitterLocation(sitterId, callback);
  }

  /**
   * Subscribe to real-time location updates for multiple sitters
   */
  subscribeToMultipleSitterLocations(
    sitterIds: string[],
    callback: (locations: Map<string, SitterLocation['location']>) => void
  ) {
    return sitterLocationService.subscribeToMultipleSitterLocations(sitterIds, callback);
  }

  /**
   * Get visit tracking data (includes route points)
   * Dual-read: tries new location first, falls back to old location
   */
  async getVisitTracking(visitId: string, sitterId?: string): Promise<VisitTrackingData | null> {
    return visitTrackingService.getVisitTracking(visitId, sitterId);
  }

  /**
   * Get all active visit tracking data
   */
  async getAllActiveVisitTracking(): Promise<VisitTrackingData[]> {
    return visitTrackingService.getAllActiveVisitTracking();
  }

  /**
   * Subscribe to all active visit tracking updates
   */
  subscribeToActiveVisitTracking(callback: (trackings: VisitTrackingData[]) => void) {
    return visitTrackingService.subscribeToActiveVisitTracking(callback);
  }
}

export const trackingService = new TrackingService();

// Re-export utility functions
export {
  initializeServerTimeSync,
  cleanupServerTimeSync,
  isLocationStale,
  useServerTimeSync,
} from './tracking/TrackingUtils';

