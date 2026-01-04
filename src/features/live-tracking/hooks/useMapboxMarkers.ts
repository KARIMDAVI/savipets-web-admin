/**
 * useMapboxMarkers Hook
 * 
 * Manages marker creation, updates, and removal for sitter locations on Mapbox map.
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';
import type React from 'react';
import mapboxgl from 'mapbox-gl';
import type { EnhancedSitterLocation } from '../types/live-tracking.types';
import { createSitterMarkerElement, createSitterPopupHTML, centerMapOnSitters } from './mapboxHelpers';

export interface UseMapboxMarkersDeps {
  map: React.RefObject<mapboxgl.Map | null>;
  mapReadyRef: React.RefObject<boolean>;
  sitterLocations: Map<string, EnhancedSitterLocation>;
  onMarkerClick: (location: EnhancedSitterLocation) => void;
  mapStatus: string;
}

export interface UseMapboxMarkersReturn {
  updateMarkerPosition: (sitterId: string, lat: number, lng: number, location: EnhancedSitterLocation) => void;
  updateMarker: (sitterId: string, lat: number, lng: number, location: EnhancedSitterLocation, force?: boolean) => void;
  cancelMarkerRemoval: (sitterId: string) => void;
  scheduleMarkerRemoval: (sitterId: string) => void;
  markers: React.RefObject<Map<string, mapboxgl.Marker>>;
  pendingLocationUpdates: React.RefObject<Map<string, EnhancedSitterLocation>>;
  lastLocationTimestamps: React.RefObject<Map<string, number>>;
  hasCenteredOnSittersRef: React.RefObject<boolean>;
}

export const useMapboxMarkers = (
  deps: UseMapboxMarkersDeps
): UseMapboxMarkersReturn => {
  const { map, mapReadyRef, sitterLocations, onMarkerClick, mapStatus } = deps;

  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const markerRemovalTimeouts = useRef<Map<string, number>>(new Map());
  const pendingLocationUpdates = useRef<Map<string, EnhancedSitterLocation>>(new Map());
  const lastLocationTimestamps = useRef<Map<string, number>>(new Map());
  const hasCenteredOnSittersRef = useRef(false);

  // Helper function to cancel marker removal
  const cancelMarkerRemoval = useCallback((sitterId: string) => {
    const timeoutId = markerRemovalTimeouts.current.get(sitterId);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      markerRemovalTimeouts.current.delete(sitterId);
    }
  }, []);

  // Helper function to schedule marker removal
  const scheduleMarkerRemoval = useCallback((sitterId: string) => {
    cancelMarkerRemoval(sitterId);
    const timeoutId = window.setTimeout(() => {
      const marker = markers.current.get(sitterId);
      if (marker) {
        marker.remove();
      }
      markers.current.delete(sitterId);
      markerRemovalTimeouts.current.delete(sitterId);
      lastLocationTimestamps.current.delete(sitterId);
    }, 30_000);
    markerRemovalTimeouts.current.set(sitterId, timeoutId);
  }, [cancelMarkerRemoval]);

  // Helper function to update marker position directly (called from location subscription)
  const updateMarkerPosition = useCallback((sitterId: string, lat: number, lng: number, location: EnhancedSitterLocation) => {
    // CRITICAL: Check if this location update is newer than the last one we processed
    const locationTimestamp = location.location.timestamp instanceof Date 
      ? location.location.timestamp.getTime() 
      : new Date(location.location.timestamp).getTime();
    const lastTimestamp = lastLocationTimestamps.current.get(sitterId);
    
    if (lastTimestamp !== undefined && locationTimestamp < lastTimestamp) {
      console.log(`[useMapboxMarkers] ⏭️  Skipping stale location update for sitter ${sitterId} (location is ${lastTimestamp - locationTimestamp}ms older than last update)`);
      return;
    }
    
    lastLocationTimestamps.current.set(sitterId, locationTimestamp);
    
    if (!map.current || !mapReadyRef.current) {
      console.log(`[useMapboxMarkers] Map not ready, queuing position update for sitter ${sitterId}`);
      pendingLocationUpdates.current.set(sitterId, location);
      return;
    }

    requestAnimationFrame(() => {
      if (!map.current || !mapReadyRef.current) return;

      let existingMarker = markers.current.get(sitterId);
      
      // If marker doesn't exist, create it immediately
      if (!existingMarker) {
        console.log(`[useMapboxMarkers] ⚠️  No marker found for sitter ${sitterId}, creating it now...`);
        
        const el = createSitterMarkerElement(sitterId, location);
        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .addTo(map.current);
        
        el.addEventListener('click', () => {
          onMarkerClick(location);
        });

        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML(createSitterPopupHTML(location));
        marker.setPopup(popup);
        markers.current.set(sitterId, marker);
        cancelMarkerRemoval(sitterId);
        
        existingMarker = marker;
        console.log(`[useMapboxMarkers] ✅ Created marker for sitter ${sitterId} at (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
      }

      // Always update marker position when we receive a location update
      // Don't filter by tiny differences - if an update is sent, we should show it
      const currentPos = existingMarker.getLngLat();
      const newPos: [number, number] = [lng, lat];
      const latDiff = Math.abs(currentPos.lat - lat);
      const lngDiff = Math.abs(currentPos.lng - lng);
      const distanceMeters = Math.sqrt(
        Math.pow(latDiff * 111000, 2) + 
        Math.pow(lngDiff * 111000 * Math.cos(lat * Math.PI / 180), 2)
      );

      // Always update if there's any difference (even 0.1 meters)
      // This ensures the marker moves when the sitter moves
      if (latDiff > 0.0000001 || lngDiff > 0.0000001 || distanceMeters > 0.1) {
        existingMarker.setLngLat(newPos);
        
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML(createSitterPopupHTML(location));
        existingMarker.setPopup(popup);
        cancelMarkerRemoval(sitterId);
      } else {
        // Position unchanged, but update popup timestamp anyway
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML(createSitterPopupHTML(location));
        existingMarker.setPopup(popup);
      }
    });
  }, [map, mapReadyRef, onMarkerClick, cancelMarkerRemoval]);

  // Helper function to update marker
  const updateMarker = useCallback(
    (sitterId: string, lat: number, lng: number, location: EnhancedSitterLocation, force = false) => {
      if (!map.current || (!force && !mapReadyRef.current)) {
        pendingLocationUpdates.current.set(sitterId, location);
        console.log(`[useMapboxMarkers] Map not ready, queuing location update for sitter ${sitterId}`);
        return;
      }

      const existingMarker = markers.current.get(sitterId);
      
      if (existingMarker) {
        const currentPos = existingMarker.getLngLat();
        const newPos = [lng, lat] as [number, number];
        
        if (Math.abs(currentPos.lng - lng) > 0.00001 || Math.abs(currentPos.lat - lat) > 0.00001) {
          console.log(`[useMapboxMarkers] Updating marker position for sitter ${sitterId}: (${currentPos.lat.toFixed(6)}, ${currentPos.lng.toFixed(6)}) → (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
          existingMarker.setLngLat(newPos);
          
          const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML(createSitterPopupHTML(location));
          existingMarker.setPopup(popup);
        }
        cancelMarkerRemoval(sitterId);
        return;
      }

      // Create new marker if it doesn't exist
      console.log(`[useMapboxMarkers] Creating new marker for sitter ${sitterId} at (${lat}, ${lng})`);
      
      const el = createSitterMarkerElement(sitterId, location);
      const marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map.current);
      el.addEventListener('click', () => {
        onMarkerClick(location);
      });

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(createSitterPopupHTML(location));
      marker.setPopup(popup);
      markers.current.set(sitterId, marker);
      cancelMarkerRemoval(sitterId);

      // Fit map to show all markers
      const bounds = new mapboxgl.LngLatBounds();
      markers.current.forEach(m => {
        const lngLat = m.getLngLat();
        bounds.extend([lngLat.lng, lngLat.lat]);
      });
      if (!bounds.isEmpty() && map.current) {
        map.current.fitBounds(bounds, { padding: 50 });
      }
    },
    [map, mapReadyRef, onMarkerClick, cancelMarkerRemoval]
  );

  // Render markers based on incoming sitterLocations
  const sitterLocationsKey = useMemo(() => {
    const key = Array.from(sitterLocations.entries())
      .map(([id, loc]) => {
        const timestamp = loc.location.timestamp instanceof Date 
          ? loc.location.timestamp.getTime() 
          : new Date(loc.location.timestamp).getTime();
        return `${id}:${loc.location.lat.toFixed(6)},${loc.location.lng.toFixed(6)},${timestamp}`;
      })
      .join('|');
    console.log(`[useMapboxMarkers] Dependency key updated: ${sitterLocations.size} sitters, key length: ${key.length}`);
    return key;
  }, [sitterLocations]);

  useEffect(() => {
    if (!map.current || !mapReadyRef.current) {
      console.log('[useMapboxMarkers] Map not ready, skipping marker updates');
      return;
    }

    const locationsArray = Array.from(sitterLocations.values());
    console.log(`[useMapboxMarkers] 🔄 Processing ${locationsArray.length} sitter location(s) from Map with size ${sitterLocations.size}`);
    
    if (locationsArray.length === 0) {
      console.log('[useMapboxMarkers] No sitter locations to render');
      markers.current.forEach((marker, sitterId) => {
        marker.remove();
        markers.current.delete(sitterId);
        lastLocationTimestamps.current.delete(sitterId);
      });
      hasCenteredOnSittersRef.current = false;
      return;
    }
    
    // Center map on sitters when first locations appear (only once)
    if (!hasCenteredOnSittersRef.current && locationsArray.length > 0) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (centerMapOnSitters(map.current, markers.current)) {
            hasCenteredOnSittersRef.current = true;
          }
        }, 500);
      });
    }
    
    // Process each location update
    locationsArray.forEach(loc => {
      console.log(`[useMapboxMarkers] 🔍 Processing location for sitter ${loc.sitterId} (${loc.sitter.firstName} ${loc.sitter.lastName}):`, {
        lat: loc.location.lat,
        lng: loc.location.lng,
        timestamp: new Date(loc.location.timestamp).toLocaleTimeString(),
      });
      if (!loc.location || typeof loc.location.lat !== 'number' || typeof loc.location.lng !== 'number') {
        console.warn(`[useMapboxMarkers] Invalid location data for sitter ${loc.sitterId}:`, loc.location);
        return;
      }
      
      const existingMarker = markers.current.get(loc.sitterId);
      if (existingMarker) {
        const currentPos = existingMarker.getLngLat();
        const newPos: [number, number] = [loc.location.lng, loc.location.lat];
        const latDiff = Math.abs(currentPos.lat - newPos[1]);
        const lngDiff = Math.abs(currentPos.lng - newPos[0]);
        
        const locationTimestamp = loc.location.timestamp instanceof Date 
          ? loc.location.timestamp.getTime() 
          : new Date(loc.location.timestamp).getTime();
        const lastTimestamp = lastLocationTimestamps.current.get(loc.sitterId);
        
        if (lastTimestamp !== undefined && locationTimestamp < lastTimestamp) {
          console.log(`[useMapboxMarkers] ⏭️  Skipping stale location in batch update for sitter ${loc.sitterId} (location is ${lastTimestamp - locationTimestamp}ms older)`);
          const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML(createSitterPopupHTML(loc));
          existingMarker.setPopup(popup);
          return;
        }
        
        lastLocationTimestamps.current.set(loc.sitterId, locationTimestamp);
        
        if (latDiff > 0.0000001 || lngDiff > 0.0000001) {
          console.log(`[useMapboxMarkers] 🔄 Updating marker position for sitter ${loc.sitterId} (${loc.sitter.firstName} ${loc.sitter.lastName}):`);
          console.log(`  Current: (${currentPos.lat.toFixed(6)}, ${currentPos.lng.toFixed(6)})`);
          console.log(`  New:     (${loc.location.lat.toFixed(6)}, ${loc.location.lng.toFixed(6)})`);
          console.log(`  Diff:    (${latDiff.toFixed(6)}, ${lngDiff.toFixed(6)})`);
          
          const distanceMeters = Math.sqrt(
            Math.pow(latDiff * 111000, 2) + 
            Math.pow(lngDiff * 111000 * Math.cos(loc.location.lat * Math.PI / 180), 2)
          );
          console.log(`  Distance: ${distanceMeters.toFixed(1)} meters`);
          
          requestAnimationFrame(() => {
            if (!map.current || !existingMarker) return;
            
            existingMarker.setLngLat(newPos);
            
            Promise.resolve().then(() => {
              if (!existingMarker) return;
              const updatedPos = existingMarker.getLngLat();
              const verifyLatDiff = Math.abs(updatedPos.lat - loc.location.lat);
              const verifyLngDiff = Math.abs(updatedPos.lng - loc.location.lng);
              
              if (verifyLatDiff > 0.0001 || verifyLngDiff > 0.0001) {
                console.warn(`[useMapboxMarkers] ⚠️  Marker position update may have failed! Expected: (${loc.location.lat.toFixed(6)}, ${loc.location.lng.toFixed(6)}), Got: (${updatedPos.lat.toFixed(6)}, ${updatedPos.lng.toFixed(6)})`);
                existingMarker.setLngLat(newPos);
              } else {
                console.log(`[useMapboxMarkers] ✅ Marker position verified: (${updatedPos.lat.toFixed(6)}, ${updatedPos.lng.toFixed(6)})`);
              }
            });
          });
          
          const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML(createSitterPopupHTML(loc));
          existingMarker.setPopup(popup);
          cancelMarkerRemoval(loc.sitterId);
        } else {
          console.log(`[useMapboxMarkers] ⏸️  Marker position unchanged for sitter ${loc.sitterId} (${loc.sitter.firstName} ${loc.sitter.lastName})`);
          const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML(createSitterPopupHTML(loc));
          existingMarker.setPopup(popup);
        }
      } else {
        const locationTimestamp = loc.location.timestamp instanceof Date 
          ? loc.location.timestamp.getTime() 
          : new Date(loc.location.timestamp).getTime();
        lastLocationTimestamps.current.set(loc.sitterId, locationTimestamp);
        
        console.log(`[useMapboxMarkers] Creating new marker for sitter ${loc.sitterId} at (${loc.location.lat}, ${loc.location.lng})`);
        updateMarker(loc.sitterId, loc.location.lat, loc.location.lng, loc, true);
      }
    });
  }, [sitterLocationsKey, sitterLocations, updateMarker, cancelMarkerRemoval, map, mapStatus]);

  // Manage marker removal based on active sitter locations
  useEffect(() => {
    const activeSitterIds = new Set(sitterLocations.keys());
    markers.current.forEach((_marker, sitterId) => {
      if (activeSitterIds.has(sitterId)) {
        cancelMarkerRemoval(sitterId);
      } else {
        scheduleMarkerRemoval(sitterId);
      }
    });
  }, [sitterLocations, cancelMarkerRemoval, scheduleMarkerRemoval]);

  return {
    updateMarkerPosition,
    updateMarker,
    cancelMarkerRemoval,
    scheduleMarkerRemoval,
    markers,
    pendingLocationUpdates,
    lastLocationTimestamps,
    hasCenteredOnSittersRef,
  };
};

