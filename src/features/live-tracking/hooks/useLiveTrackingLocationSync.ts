/**
 * useLiveTrackingLocationSync Hook
 * 
 * Manages location syncing from visit tracking data.
 */

import { useCallback, useRef } from 'react';
import type { Visit } from '@/services/visit.service';
import type { VisitTrackingData } from '@/services/tracking.service';
import type { EnhancedSitterLocation } from '../types/live-tracking.types';
import type { Booking, User } from '@/types';
import { isActiveVisitStatus, deriveLocationFromTracking, buildFallbackSitter, findBookingForTracking } from './liveTrackingHelpers';

export interface UseLiveTrackingLocationSyncDeps {
  activeVisitsRef: React.RefObject<Visit[]>;
  visitTrackingsRef: React.RefObject<Map<string, VisitTrackingData>>;
  sitterLookup: Map<string, User>;
  effectiveActiveBookings: Booking[];
  activeVisits: Visit[];
  convertVisitToBookingFn: (visit: Visit) => Booking;
}

export interface UseLiveTrackingLocationSyncReturn {
  syncLocationsFromTrackings: (trackings: Iterable<VisitTrackingData>) => void;
}

export const useLiveTrackingLocationSync = (
  deps: UseLiveTrackingLocationSyncDeps,
  setSitterLocations: React.Dispatch<React.SetStateAction<Map<string, EnhancedSitterLocation>>>
): UseLiveTrackingLocationSyncReturn => {
  const { activeVisitsRef, visitTrackingsRef, sitterLookup, effectiveActiveBookings, activeVisits, convertVisitToBookingFn } = deps;

  const syncLocationsFromTrackings = useCallback((trackings: Iterable<VisitTrackingData>) => {
    // CRITICAL: Only sync locations if there are active visits
    const currentActiveVisits = activeVisitsRef.current;
    if (currentActiveVisits.length === 0) {
      return;
    }
    
    setSitterLocations(prev => {
      let mutated = false;
      const next = new Map(prev);
      
      for (const tracking of trackings) {
        // Try to get the correct sitterId by matching visitId with activeVisits
        let sitterId = tracking.sitterId;
        const visitForTracking = currentActiveVisits.find(
          v => (v.id === tracking.visitId || v.bookingId === tracking.visitId) && isActiveVisitStatus(v.status)
        );
        
        // CRITICAL: Only process tracking if there's an active visit for it
        if (!visitForTracking) {
          continue;
        }
        
        // If we found a visit that matches by visitId but has different sitterId, use the visit's sitterId
        if (visitForTracking.sitterId !== tracking.sitterId) {
          sitterId = visitForTracking.sitterId;
        }
        
        // Check if we already have a location for this sitter
        const existingLocation = next.get(sitterId);

        const derivedLocation = deriveLocationFromTracking(tracking);
        
        if (!derivedLocation) {
          continue;
        }

        // Evaluate whether the new point is newer/different before skipping updates
        const existingTs = existingLocation?.location.timestamp instanceof Date 
          ? existingLocation.location.timestamp.getTime() 
          : existingLocation?.location.timestamp
            ? new Date(existingLocation.location.timestamp).getTime()
            : 0;
        const nextTs = derivedLocation.timestamp instanceof Date
          ? derivedLocation.timestamp.getTime()
          : new Date(derivedLocation.timestamp).getTime();
        const latDiff = existingLocation ? Math.abs(existingLocation.location.lat - derivedLocation.lat) : null;
        const lngDiff = existingLocation ? Math.abs(existingLocation.location.lng - derivedLocation.lng) : null;
        const hasMoved = latDiff === null || lngDiff === null || latDiff > 0.000001 || lngDiff > 0.000001;
        const isNewer = nextTs > existingTs;
        
        // Skip only if the point is neither newer nor moved
        if (existingLocation && !hasMoved && !isNewer) {
          continue;
        }

        const sitter = sitterLookup.get(sitterId) || buildFallbackSitter(sitterId, activeVisits);
        const booking = findBookingForTracking(
          sitterId,
          tracking.visitId,
          tracking.clientId,
          effectiveActiveBookings,
          activeVisits,
          convertVisitToBookingFn
        );

        next.set(sitterId, {
          sitterId,
          sitter,
          booking,
          location: derivedLocation,
          status: tracking.isActive ? 'active' : 'idle',
        });
        mutated = true;
        
        console.log(`[useLiveTrackingLocationSync] 🛰️ Synced sitter ${sitterId} from visit tracking fallback`);
      }
      
      // Also sync locations for sitters with active visits but no visitTracking data yet
      for (const visit of currentActiveVisits) {
        if (!isActiveVisitStatus(visit.status)) continue;
        
        const sitterId = visit.sitterId;
        if (!sitterId) continue;
        
        // Skip if we already have a location for this sitter
        if (next.has(sitterId)) continue;
        
        // Check if there's a visitTracking for this visit (by visitId, not sitterId)
        const trackingForVisit = Array.from(trackings).find(
          t => (t.visitId === visit.id || t.visitId === visit.bookingId) && t.isActive
        );
        
        if (trackingForVisit) {
          // We already processed this in the loop above (or will)
          continue;
        }
      }

      return mutated ? next : prev;
    });
  }, [
    activeVisitsRef,
    visitTrackingsRef,
    sitterLookup,
    effectiveActiveBookings,
    activeVisits,
    convertVisitToBookingFn,
    setSitterLocations,
  ]);

  return {
    syncLocationsFromTrackings,
  };
};


