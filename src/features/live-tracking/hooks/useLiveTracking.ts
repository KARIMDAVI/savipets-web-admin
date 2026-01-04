/**
 * useLiveTracking Hook
 * 
 * Orchestrates live tracking state, subscriptions, and location updates.
 * Uses specialized hooks for data fetching, location syncing, and helpers.
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { throttle } from 'lodash';
import { trackingService, type VisitTrackingData, isLocationStale } from '@/services/tracking.service';
import type { EnhancedSitterLocation } from '../types/live-tracking.types';
import type { Unsubscribe } from 'firebase/firestore';
import { useLiveTrackingData } from './useLiveTrackingData';
import { useLiveTrackingLocationSync } from './useLiveTrackingLocationSync';
import { useLiveTrackingSubscriptions } from './useLiveTrackingSubscriptions';
import { isActiveVisitStatus } from './liveTrackingHelpers';

export const useLiveTracking = (autoRefresh: boolean, refreshInterval: number) => {
  const [sitterLocations, setSitterLocations] = useState<Map<string, EnhancedSitterLocation>>(new Map());
  const [visitTrackings, setVisitTrackings] = useState<Map<string, VisitTrackingData>>(new Map());
  const locationSubscriptions = useRef<Set<Unsubscribe>>(new Set());
  const updateQueue = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const activeVisitsRef = useRef<any[]>([]);
  const visitTrackingsRef = useRef<Map<string, VisitTrackingData>>(new Map());
  const lastKnownSitterIdsRef = useRef<Set<string>>(new Set());
  const effectiveActiveBookingsRef = useRef<any[]>([]);

  // Fetch data
  const dataHook = useLiveTrackingData(autoRefresh, refreshInterval);
  const {
    activeVisits,
    effectiveActiveBookings,
    sitters,
    sitterLookup,
    isLoading,
    refetch,
    convertVisitToBookingFn,
  } = dataHook;

  // Keep refs in sync
  useEffect(() => {
    activeVisitsRef.current = activeVisits;
  }, [activeVisits]);

  useEffect(() => {
    visitTrackingsRef.current = visitTrackings;
  }, [visitTrackings]);

  useEffect(() => {
    effectiveActiveBookingsRef.current = effectiveActiveBookings;
  }, [effectiveActiveBookings]);

  // Location sync hook
  const locationSyncHook = useLiveTrackingLocationSync(
    {
      activeVisitsRef,
      visitTrackingsRef,
      sitterLookup,
      effectiveActiveBookings,
      activeVisits,
      convertVisitToBookingFn,
    },
    setSitterLocations
  );

  const clearLocationSubscriptions = useCallback(() => {
    locationSubscriptions.current.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn('[useLiveTracking] Failed to unsubscribe sitter listener', error);
      }
    });
    locationSubscriptions.current.clear();
  }, []);

  const clearTrackingState = useCallback(() => {
    clearLocationSubscriptions();
    setSitterLocations(prev => {
      if (prev.size === 0) return prev;
      return new Map<string, EnhancedSitterLocation>();
    });
    setVisitTrackings(prev => {
      if (prev.size === 0) return prev;
      return new Map<string, VisitTrackingData>();
    });
  }, [clearLocationSubscriptions]);

  // Throttle location updates to max once per 2 seconds
  const throttledLocationUpdate = useMemo(
    () => throttle((sitterId: string, location: EnhancedSitterLocation) => {
      setSitterLocations(prev => {
        const currentActiveVisits = activeVisitsRef.current;
        const currentVisitTrackings = visitTrackingsRef.current;
        
        const visit = currentActiveVisits.find(v => v.sitterId === sitterId);
        const hasActiveVisit = visit && isActiveVisitStatus(visit.status);
        
        const hasActiveTracking = Array.from(currentVisitTrackings.values()).some(
          tracking => {
            if (visit && tracking.isActive) {
              if (tracking.visitId === visit.id || tracking.visitId === visit.bookingId) return true;
              if (tracking.sitterId === sitterId) return true;
            }
            return false;
          }
        );
        
        if (!hasActiveVisit) {
          const updated = new Map(prev);
          updated.delete(sitterId);
          return updated;
        }
        
        if (visit && !isActiveVisitStatus(visit.status)) {
          const updated = new Map(prev);
          updated.delete(sitterId);
          return updated;
        }
        
        const isStale = isLocationStale(location.location.timestamp);
        if (isStale && !hasActiveTracking) {
          return prev;
        }
        
        const updated = new Map(prev);
        updated.set(sitterId, location);
        return updated;
      });
    }, 2000, { leading: true, trailing: true }),
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      updateQueue.current.forEach(timeout => clearTimeout(timeout));
      updateQueue.current.clear();
      throttledLocationUpdate.cancel();
    };
  }, [throttledLocationUpdate]);

  // Subscribe to visit tracking data
  // ✅ CRITICAL FIX: Use activeVisits instead of effectiveActiveBookings
  // effectiveActiveBookings can be empty even when there are active visits
  useEffect(() => {
    // ✅ Use activeVisits.length instead - this is the source of truth
    if (activeVisits.length === 0 && effectiveActiveBookings.length === 0) {
      console.log('[useLiveTracking] No active visits or bookings, clearing tracking state');
      clearTrackingState();
      return;
    }

    console.log(`[useLiveTracking] Setting up visit tracking subscription: activeVisits=${activeVisits.length}, effectiveActiveBookings=${effectiveActiveBookings.length}`);

    const unsubscribe = trackingService.subscribeToActiveVisitTracking((trackings: VisitTrackingData[]) => {
      console.log(`[useLiveTracking] Received ${trackings.length} visit tracking update(s)`);
      const trackingMap = new Map<string, VisitTrackingData>();
      trackings.forEach(tracking => {
        const pointCount = tracking.routePoints?.length || 0;
        console.log(`[useLiveTracking] Visit ${tracking.visitId} (sitter ${tracking.sitterId}) has ${pointCount} route points`);
        trackingMap.set(tracking.visitId, tracking);
      });
      setVisitTrackings(new Map(trackingMap));
      locationSyncHook.syncLocationsFromTrackings(trackings);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [activeVisits.length, effectiveActiveBookings.length, clearTrackingState, locationSyncHook]);

  // Cleanup locations when no active visits
  useEffect(() => {
    if (activeVisits.length === 0) {
      clearTrackingState();
      return;
    }

    const activeSitterIds = new Set(
      activeVisits
        .filter(v => isActiveVisitStatus(v.status))
        .map(v => v.sitterId)
        .filter((sitterId): sitterId is string => Boolean(sitterId))
    );

    setSitterLocations(prev => {
      if (prev.size === 0) return prev;
      let mutated = false;
      const next = new Map(prev);
      for (const sitterId of next.keys()) {
        if (!activeSitterIds.has(sitterId)) {
          next.delete(sitterId);
          mutated = true;
        }
      }
      return mutated ? next : prev;
    });
  }, [activeVisits, clearTrackingState]);

  // Periodic cleanup
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setSitterLocations(prev => {
        if (prev.size === 0) return prev;
        
        const currentActiveVisits = activeVisitsRef.current;
        const currentVisitTrackings = visitTrackingsRef.current;
        
        let mutated = false;
        const next = new Map(prev);
        
        for (const [sitterId, location] of prev.entries()) {
          const visit = currentActiveVisits.find(v => v.sitterId === sitterId);
          const hasActiveVisit = visit && isActiveVisitStatus(visit.status);
          
          const hasActiveTracking = Array.from(currentVisitTrackings.values()).some(
            tracking => {
              if (visit && tracking.isActive) {
                if (tracking.visitId === visit.id || tracking.visitId === visit.bookingId) return true;
                if (tracking.sitterId === sitterId) return true;
              }
              return false;
            }
          );
          
          if (!hasActiveVisit) {
            next.delete(sitterId);
            mutated = true;
          }
        }
        
        return mutated ? next : prev;
      });
    }, 5000);
    
    return () => clearInterval(cleanupInterval);
  }, []);

  // Immediate cleanup when activeVisits becomes empty
  useEffect(() => {
    if (activeVisits.length === 0) {
      setSitterLocations(new Map());
    }
  }, [activeVisits.length]);

  // Use subscriptions hook
  useLiveTrackingSubscriptions({
    activeVisits,
    activeVisitsRef,
    effectiveActiveBookings,
    visitTrackings,
    visitTrackingsRef,
    effectiveActiveBookingsRef,
    sitterLookup,
    throttledLocationUpdate,
    convertVisitToBookingFn,
    setSitterLocations,
    clearTrackingState,
  });

  useEffect(() => {
    if (visitTrackings.size === 0) {
      return;
    }
    
    locationSyncHook.syncLocationsFromTrackings(visitTrackings.values());
  }, [visitTrackings, locationSyncHook]);

  return {
    activeBookings: effectiveActiveBookings,
    activeVisits,
    sitters,
    sitterLocations,
    visitTrackings,
    isLoading,
    refetch,
    setSitterLocations,
    setVisitTrackings,
  };
};
