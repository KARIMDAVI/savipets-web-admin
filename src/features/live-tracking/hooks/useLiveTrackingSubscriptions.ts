/**
 * useLiveTrackingSubscriptions Hook
 * 
 * Manages location subscriptions for active sitters.
 */

import { useCallback, useRef, useEffect } from 'react';
import type { Unsubscribe } from 'firebase/firestore';
import { trackingService } from '@/services/tracking.service';
import type { Visit } from '@/services/visit.service';
import type { VisitTrackingData } from '@/services/tracking.service';
import type { EnhancedSitterLocation } from '../types/live-tracking.types';
import type { Booking, User } from '@/types';
import { isActiveVisitStatus, buildFallbackSitter, deriveLocationFromTracking, convertVisitToBooking } from './liveTrackingHelpers';

export interface UseLiveTrackingSubscriptionsDeps {
  activeVisits: Visit[];
  activeVisitsRef: React.RefObject<Visit[]>;
  effectiveActiveBookings: Booking[];
  visitTrackings: Map<string, VisitTrackingData>;
  visitTrackingsRef: React.RefObject<Map<string, VisitTrackingData>>;
  effectiveActiveBookingsRef: React.RefObject<Booking[]>;
  sitterLookup: Map<string, User>;
  throttledLocationUpdate: (sitterId: string, location: EnhancedSitterLocation) => void;
  convertVisitToBookingFn: (visit: Visit) => Booking;
  setSitterLocations: React.Dispatch<React.SetStateAction<Map<string, EnhancedSitterLocation>>>;
  clearTrackingState: () => void;
}

export const useLiveTrackingSubscriptions = (
  deps: UseLiveTrackingSubscriptionsDeps
) => {
  const {
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
  } = deps;

  const locationSubscriptions = useRef<Map<string, Unsubscribe>>(new Map());
  const lastKnownSitterIdsRef = useRef<Set<string>>(new Set());
  const isSubscribingRef = useRef(false);
  const lastSitterIdsStringRef = useRef<string>('');

  // Subscribe to sitter location updates
  useEffect(() => {
    // ✅ Prevent concurrent subscription setup
    if (isSubscribingRef.current) {
      console.warn('[useLiveTrackingSubscriptions] ⚠️ Subscription setup already in progress, skipping');
      return;
    }
    
    console.log(`[useLiveTrackingSubscriptions] 🔄 Effect triggered: activeVisits=${activeVisits.length}, visitTrackings=${visitTrackingsRef.current.size}`);
    
    const sitterIds = new Set<string>();
    
    if (activeVisits.length > 0) {
      activeVisits.forEach((visit, index) => {
        const hasSitterId = !!visit.sitterId;
        const isActive = isActiveVisitStatus(visit.status);
        console.log(`[useLiveTrackingSubscriptions] Visit ${index + 1}:`, {
          id: visit.id,
          sitterId: visit.sitterId || 'MISSING',
          status: visit.status,
          hasSitterId,
          isActive,
          willAdd: hasSitterId && isActive,
        });
        
        if (hasSitterId && isActive) {
          sitterIds.add(visit.sitterId);
          console.log(`[useLiveTrackingSubscriptions] ✅ Added sitter ${visit.sitterId} from visit ${visit.id}`);
        } else {
          const reasons = [];
          if (!hasSitterId) reasons.push('missing sitterId');
          if (!isActive) reasons.push(`status "${visit.status}" is not active`);
          console.warn(`[useLiveTrackingSubscriptions] ⚠️ Skipped visit ${visit.id}: ${reasons.join(', ')}`);
        }
      });
      console.log(`[useLiveTrackingSubscriptions] Found ${sitterIds.size} unique sitter(s) from ${activeVisits.length} active visit(s)`);
    } else {
      console.warn(`[useLiveTrackingSubscriptions] ⚠️ No active visits found! This means no subscriptions will be set up.`);
      console.warn(`[useLiveTrackingSubscriptions] Check: Are there visits with status 'on_adventure' in Firestore?`);
    }
    
    const currentVisitTrackings = visitTrackingsRef.current;
    currentVisitTrackings.forEach(tracking => {
      if (tracking.sitterId && tracking.isActive) {
        const matchingVisit = activeVisits.find((v: Visit) => 
          v.sitterId === tracking.sitterId && 
          isActiveVisitStatus(v.status) &&
          (v.id === tracking.visitId || v.bookingId === tracking.visitId)
        );
        if (matchingVisit) {
          sitterIds.add(tracking.sitterId);
        }
      }
    });
    
    if (currentVisitTrackings.size === 0 && lastKnownSitterIdsRef.current.size > 0 && sitterIds.size === 0) {
      lastKnownSitterIdsRef.current.forEach(sitterId => sitterIds.add(sitterId));
      console.log(`[useLiveTrackingSubscriptions] Using ${lastKnownSitterIdsRef.current.size} last known sitter ID(s) during temporary empty state`);
    }

    if (sitterIds.size > 0) {
      lastKnownSitterIdsRef.current = new Set(sitterIds);
    }

    // ✅ Create stable string representation of sitter IDs
    const sitterIdsString = Array.from(sitterIds).sort().join(',');
    
    // ✅ CRITICAL FIX: Don't skip if we have active visits but no subscriptions yet
    // This handles the case where subscriptions were cleared but visits are still active
    const hasSubscriptions = locationSubscriptions.current.size > 0;
    const shouldSkip = sitterIdsString === lastSitterIdsStringRef.current && hasSubscriptions;
    
    if (shouldSkip) {
      console.log(`[useLiveTrackingSubscriptions] ⏭️ Sitter IDs unchanged (${sitterIds.size} sitters) and subscriptions exist, skipping re-subscription`);
      return;
    }
    
    // If we have sitters but no subscriptions, force re-subscription
    if (sitterIds.size > 0 && !hasSubscriptions) {
      console.log(`[useLiveTrackingSubscriptions] 🔄 Force re-subscription: ${sitterIds.size} sitter(s) but no subscriptions`);
    }
    
    lastSitterIdsStringRef.current = sitterIdsString;
    
    if (sitterIds.size === 0) {
      console.log('[useLiveTrackingSubscriptions] No active sitters found, clearing tracking state');
      // ✅ Clean up existing subscriptions
      locationSubscriptions.current.forEach((unsubscribe, sitterId) => {
        try {
          unsubscribe();
        } catch (error) {
          console.error(`[useLiveTrackingSubscriptions] Error unsubscribing:`, error);
        }
      });
      locationSubscriptions.current.clear();
      clearTrackingState();
      lastKnownSitterIdsRef.current.clear();
      return;
    }

    isSubscribingRef.current = true;
    
    // ✅ CRITICAL: Clean up ALL existing subscriptions first
    console.log(`[useLiveTrackingSubscriptions] Cleaning up ${locationSubscriptions.current.size} existing subscription(s)`);
    locationSubscriptions.current.forEach((unsubscribe, sitterId) => {
      try {
        unsubscribe();
        console.log(`[useLiveTrackingSubscriptions] Unsubscribed from sitter ${sitterId}`);
      } catch (error) {
        console.error(`[useLiveTrackingSubscriptions] Error unsubscribing from sitter ${sitterId}:`, error);
      }
    });
    locationSubscriptions.current.clear();

    console.log(`[useLiveTrackingSubscriptions] Setting up location subscriptions for ${sitterIds.size} sitters`);

    sitterIds.forEach(sitterId => {
      // ✅ CRITICAL: Skip if already subscribing to this sitter
      if (locationSubscriptions.current.has(sitterId)) {
        console.warn(`[useLiveTrackingSubscriptions] ⚠️ Already subscribed to sitter ${sitterId}, skipping duplicate`);
        return;
      }
      let sitter = sitterLookup.get(sitterId);
      if (!sitter) {
        console.warn(`[useLiveTrackingSubscriptions] Sitter ${sitterId} not found in sitter lookup, using fallback profile`);
        sitter = buildFallbackSitter(sitterId, activeVisits);
      }

      let booking = effectiveActiveBookings.find(b => b.sitterId === sitterId);
      
      if (!booking) {
        const visit = activeVisits.find(v => v.sitterId === sitterId && isActiveVisitStatus(v.status));
        if (visit) {
          booking = convertVisitToBookingFn(visit);
        } else {
          const tracking = Array.from(visitTrackingsRef.current.values()).find(t => t.sitterId === sitterId);
          if (tracking) {
            const visitFromTracking = activeVisits.find(v => v.id === tracking.visitId) || 
                         activeVisits.find(v => v.sitterId === sitterId);
            if (visitFromTracking) {
              booking = convertVisitToBookingFn(visitFromTracking);
            } else {
              booking = {
                id: tracking.visitId,
                sitterId: tracking.sitterId,
                clientId: tracking.clientId,
                serviceType: 'dog-walking' as any,
                status: 'active' as const,
                scheduledDate: new Date(),
                duration: 0,
                pets: [],
                address: null,
                price: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
            }
          }
        }
      }
      
      // ✅ CRITICAL FIX: Don't require booking - we have active visit, that's enough
      // The booking is only for display, not for subscription logic
      if (!booking) {
        console.warn(`[useLiveTrackingSubscriptions] No booking found for sitter ${sitterId}, creating minimal booking for subscription`);
        // Create minimal booking from visit
        const visit = activeVisits.find(v => v.sitterId === sitterId && isActiveVisitStatus(v.status));
        if (visit) {
          booking = convertVisitToBookingFn(visit);
        } else {
          // Still subscribe even without booking - we have sitterId and active visit
          booking = {
            id: `fallback-${sitterId}`,
            sitterId: sitterId,
            clientId: '',
            serviceType: 'dog-walking' as any,
            status: 'active' as const,
            scheduledDate: new Date(),
            duration: 0,
            pets: [],
            address: null,
            price: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
      }

      const unsubscribe = trackingService.subscribeToSitterLocation(sitterId, (location) => {
        // Declare updateFn once at the top of the callback to avoid duplicate declaration errors
        const updateFn = (window as any).__updateMarkerPosition;
        
        if (!location) {
          const currentVisitTrackings = visitTrackingsRef.current;
          const currentActiveVisits = activeVisitsRef.current;
          
          let trackingForSitter = Array.from(currentVisitTrackings.values()).find(
            t => t.sitterId === sitterId && t.isActive
          );
          
          if (!trackingForSitter) {
            const visitForSitter = currentActiveVisits.find(v => v.sitterId === sitterId && isActiveVisitStatus(v.status));
            if (visitForSitter) {
              trackingForSitter = Array.from(currentVisitTrackings.values()).find(
                t => (t.visitId === visitForSitter.id || t.visitId === visitForSitter.bookingId) && t.isActive
              );
            }
            
            if (!trackingForSitter && currentActiveVisits.length === 0) {
              const bookingForSitter = effectiveActiveBookingsRef.current.find(b => b.sitterId === sitterId);
              if (bookingForSitter) {
                trackingForSitter = Array.from(currentVisitTrackings.values()).find(
                  t => (t.visitId === bookingForSitter.id) && t.isActive
                );
              }
            }
          }
          
          if (trackingForSitter) {
            const derivedLocation = deriveLocationFromTracking(trackingForSitter);
            
            if (derivedLocation) {
              const enhancedLocation: EnhancedSitterLocation = {
                sitterId,
                sitter,
                booking,
                location: derivedLocation,
                status: trackingForSitter.isActive ? 'active' : 'idle',
              };
              
              setSitterLocations(prev => {
                const updated = new Map(prev);
                updated.set(sitterId, enhancedLocation);
                return updated;
              });
              
              // ✅ Use the updateFn declared at the top of the callback
              if (updateFn && typeof updateFn === 'function') {
                try {
                  updateFn(sitterId, derivedLocation.lat, derivedLocation.lng, enhancedLocation);
                } catch (error) {
                  console.error(`[useLiveTrackingSubscriptions] Error calling marker update:`, error);
                }
              }
              
              return;
            }
          }
          
          setSitterLocations(prev => {
            if (!prev.has(sitterId)) return prev;
            const updated = new Map(prev);
            updated.delete(sitterId);
            return updated;
          });
          return;
        }

        setSitterLocations(prev => {
          const prevLocation = prev.get(sitterId);
          
          // Always update marker position when we receive a location update
          // This ensures the marker moves even if the change detection is too strict
          if (updateFn && typeof updateFn === 'function') {
            try {
              const enhancedLocation: EnhancedSitterLocation = {
                sitterId,
                sitter,
                booking,
                location,
                status: 'active',
              };
              updateFn(sitterId, location.lat, location.lng, enhancedLocation);
            } catch (error) {
              console.error(`[useLiveTrackingSubscriptions] Error calling marker update:`, error);
            }
          }

          const hasChanged = !prevLocation || 
            Math.abs(prevLocation.location.lat - location.lat) > 0.000001 ||
            Math.abs(prevLocation.location.lng - location.lng) > 0.000001 ||
            (prevLocation.location.timestamp instanceof Date 
              ? prevLocation.location.timestamp.getTime() 
              : new Date(prevLocation.location.timestamp).getTime()) !== 
            (location.timestamp instanceof Date 
              ? location.timestamp.getTime() 
              : new Date(location.timestamp).getTime());

          const enhancedLocation: EnhancedSitterLocation = {
            sitterId,
            sitter,
            booking,
            location,
            status: 'active',
          };

          throttledLocationUpdate(sitterId, enhancedLocation);
          
          return prev;
        });
      });

      if (typeof unsubscribe === 'function') {
        // ✅ Store subscription by sitterId for easy lookup and cleanup
        locationSubscriptions.current.set(sitterId, unsubscribe);
        console.log(`[useLiveTrackingSubscriptions] ✅ Stored subscription for sitter ${sitterId}`);
      }
    });
    
    isSubscribingRef.current = false;

    return () => {
      console.log(`[useLiveTrackingSubscriptions] Cleanup: unsubscribing from ${locationSubscriptions.current.size} sitter(s)`);
      locationSubscriptions.current.forEach((unsubscribe, sitterId) => {
        try {
          unsubscribe();
          console.log(`[useLiveTrackingSubscriptions] ✅ Unsubscribed from sitter ${sitterId}`);
        } catch (error) {
          console.error(`[useLiveTrackingSubscriptions] ❌ Error unsubscribing from sitter ${sitterId}:`, error);
        }
      });
      locationSubscriptions.current.clear();
      isSubscribingRef.current = false;
    };
  }, [
    // ✅ Use stable dependencies - only trigger when actual data changes, not computed strings
    activeVisits.length,
    effectiveActiveBookings.length,
    sitterLookup,
    clearTrackingState,
    convertVisitToBookingFn,
    throttledLocationUpdate,
    setSitterLocations,
    // Use refs for visitTrackings to avoid re-triggering on every map update
    // visitTrackingsRef is stable, so we don't need it in deps
  ]);
};

