import { useEffect } from 'react';
import { db } from '@/config/firebase.config';
import { 
  collection, 
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { VisitTrackingLocation } from '../tracking.service';

/**
 * Parse tracking location from various formats
 */
export function parseTrackingLocation(point: any): VisitTrackingLocation | undefined {
  if (!point || (point.latitude ?? point.lat) === undefined || (point.longitude ?? point.lng) === undefined) {
    return undefined;
  }
  const latitude = point.latitude ?? point.lat;
  const longitude = point.longitude ?? point.lng;
  return {
    latitude,
    longitude,
    accuracy: point.accuracy ?? point.horizontalAccuracy,
    speed: point.speed,
    heading: point.heading,
    timestamp: point.timestamp?.toDate
      ? point.timestamp.toDate()
      : point.timestamp?.seconds
        ? new Date(point.timestamp.seconds * 1000)
        : point.timestamp instanceof Date
          ? point.timestamp
          : new Date(),
  };
}

// ============================================================================
// Server Time Synchronization (Memory-Safe)
// ============================================================================

let serverTimeOffset = 0;
let syncInterval: ReturnType<typeof setInterval> | null = null;
const LOCATION_STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get server timestamp by writing a temporary document and reading it back
 */
async function getServerTimestamp(): Promise<number> {
  try {
    const tempRef = doc(collection(db, '_temp'));
    await setDoc(tempRef, { timestamp: serverTimestamp() });
    
    const docSnap = await getDoc(tempRef);
    const data = docSnap.data();
    const serverTime = data?.timestamp?.toDate?.()?.getTime();
    
    await deleteDoc(tempRef);
    
    if (serverTime) {
      return serverTime;
    }
    
    return Date.now();
  } catch (error) {
    console.error('[trackingService] Error getting server timestamp:', error);
    return Date.now();
  }
}

/**
 * Calculate server time offset (difference between server and client time)
 */
async function calculateServerTimeOffset(): Promise<number> {
  const clientTime = Date.now();
  const serverTimestamp = await getServerTimestamp();
  const offset = serverTimestamp - clientTime;
  console.log(`[trackingService] Server time offset: ${offset}ms`);
  return offset;
}

/**
 * Initialize server time sync
 */
export function initializeServerTimeSync() {
  calculateServerTimeOffset().then(offset => {
    serverTimeOffset = offset;
  });
  
  syncInterval = setInterval(() => {
    calculateServerTimeOffset().then(offset => {
      serverTimeOffset = offset;
    });
  }, 5 * 60 * 1000);
}

/**
 * Cleanup server time sync
 */
export function cleanupServerTimeSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('[trackingService] Server time sync cleaned up');
  }
}

/**
 * Check if a location timestamp is stale
 */
export function isLocationStale(timestamp: Date): boolean {
  const now = Date.now() + serverTimeOffset;
  const locationTime = timestamp instanceof Date 
    ? timestamp.getTime() 
    : new Date(timestamp).getTime();
  return (now - locationTime) > LOCATION_STALE_THRESHOLD_MS;
}

/**
 * React hook for server time synchronization
 */
export const useServerTimeSync = () => {
  useEffect(() => {
    initializeServerTimeSync();
    return () => {
      cleanupServerTimeSync();
    };
  }, []);
};


