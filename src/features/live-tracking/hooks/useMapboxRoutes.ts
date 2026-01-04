/**
 * useMapboxRoutes Hook
 * 
 * Manages route drawing and removal for visit tracking on Mapbox map.
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';
import type React from 'react';
import mapboxgl from 'mapbox-gl';
import type { VisitTrackingData } from '@/services/tracking.service';
import { mapTokens } from '@/design/mapTokens';
import { filterRoutePoints } from '../utils/trackingHelpers';

export interface UseMapboxRoutesDeps {
  map: React.RefObject<mapboxgl.Map | null>;
  mapReadyRef: React.RefObject<boolean>;
  visitTrackings: Map<string, VisitTrackingData>;
}

export interface UseMapboxRoutesReturn {
  drawRoute: (tracking: VisitTrackingData, force?: boolean) => void;
  cancelRouteRemoval: (visitId: string) => void;
  scheduleRouteRemoval: (visitId: string) => void;
  pendingRouteUpdates: React.RefObject<Map<string, VisitTrackingData>>;
}

export const useMapboxRoutes = (
  deps: UseMapboxRoutesDeps
): UseMapboxRoutesReturn => {
  const { map, mapReadyRef, visitTrackings } = deps;

  const routes = useRef<Map<string, string>>(new Map());
  const routeSources = useRef<Map<string, mapboxgl.GeoJSONSource>>(new Map());
  const routeRemovalTimeouts = useRef<Map<string, number>>(new Map());
  const pendingRouteUpdates = useRef<Map<string, VisitTrackingData>>(new Map());

  // Helper function to cancel route removal
  const cancelRouteRemoval = useCallback((visitId: string) => {
    const timeoutId = routeRemovalTimeouts.current.get(visitId);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      routeRemovalTimeouts.current.delete(visitId);
    }
  }, []);

  // Helper function to schedule route removal
  const scheduleRouteRemoval = useCallback((visitId: string) => {
    cancelRouteRemoval(visitId);
    const timeoutId = window.setTimeout(() => {
      const layerId = routes.current.get(visitId);
      const source = routeSources.current.get(visitId);
      if (layerId && map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (source && map.current?.getSource(`route-${visitId}`)) {
        map.current.removeSource(`route-${visitId}`);
      }
      routes.current.delete(visitId);
      routeSources.current.delete(visitId);
      routeRemovalTimeouts.current.delete(visitId);
    }, 30_000);
    routeRemovalTimeouts.current.set(visitId, timeoutId);
  }, [cancelRouteRemoval, map]);

  // Helper function to draw route on map
  const drawRoute = useCallback((tracking: VisitTrackingData, force = false) => {
    if (!map.current || (!force && !mapReadyRef.current)) {
      pendingRouteUpdates.current.set(tracking.visitId, tracking);
      return;
    }

    const sourceId = `route-${tracking.visitId}`;
    const layerId = `route-layer-${tracking.visitId}`;
    
    // Validate route points exist
    if (!tracking.routePoints || tracking.routePoints.length === 0) {
      console.debug(`[drawRoute] No route points for visit ${tracking.visitId}`);
      return;
    }
    
    const filtered = filterRoutePoints(tracking.routePoints);
    if (!filtered || filtered.length < 2) {
      console.debug(`[drawRoute] Not enough filtered points for visit ${tracking.visitId}: ${filtered?.length || 0} points`);
      // If we have at least 1 point, we can still show it as a marker, but no line
      if (filtered && filtered.length === 1) {
        console.debug(`[drawRoute] Only 1 point available, skipping line draw for visit ${tracking.visitId}`);
      }
      return;
    }
    
    const coordinates = filtered.map(point => {
      if (typeof point.longitude !== 'number' || typeof point.latitude !== 'number') {
        console.warn(`[drawRoute] Invalid coordinate for visit ${tracking.visitId}:`, point);
        return null;
      }
      return [point.longitude, point.latitude] as [number, number];
    }).filter((coord): coord is [number, number] => coord !== null);
    
    if (coordinates.length < 2) {
      console.warn(`[drawRoute] Not enough valid coordinates after filtering for visit ${tracking.visitId}`);
      return;
    }
    
    const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: { visitId: tracking.visitId, sitterId: tracking.sitterId, totalDistance: tracking.totalDistance },
      geometry: { type: 'LineString', coordinates: coordinates },
    };

    try {
      const existingSource = map.current.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;
      if (existingSource) {
        existingSource.setData(geojson);
        console.log(`[drawRoute] ✅ Updated route for visit ${tracking.visitId} with ${coordinates.length} points`);
      } else {
        map.current.addSource(sourceId, { type: 'geojson', data: geojson });
        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': mapTokens.colors.routeActive,
            'line-width': 4,
            'line-opacity': 0.7,
          },
        });
        console.log(`[drawRoute] ✅ Created new route for visit ${tracking.visitId} with ${coordinates.length} points`);
      }

      routes.current.set(tracking.visitId, layerId);
      routeSources.current.set(tracking.visitId, map.current.getSource(sourceId) as mapboxgl.GeoJSONSource);
      cancelRouteRemoval(tracking.visitId);
    } catch (error) {
      console.error(`[drawRoute] Error drawing route for visit ${tracking.visitId}:`, error);
    }
  }, [map, mapReadyRef, cancelRouteRemoval]);

  // Render routes based on incoming visitTrackings (single source of truth comes from useLiveTracking)
  // Convert Map to string for dependency tracking (React doesn't detect Map changes)
  const visitTrackingsKey = useMemo(() => {
    return Array.from(visitTrackings.entries())
      .map(([visitId, tracking]) => {
        const pointCount = tracking.routePoints?.length || 0;
        const lastPoint = tracking.routePoints && tracking.routePoints.length > 0 
          ? tracking.routePoints[tracking.routePoints.length - 1]
          : null;
        const lastPointKey = lastPoint 
          ? `${lastPoint.latitude.toFixed(4)},${lastPoint.longitude.toFixed(4)}`
          : 'none';
        return `${visitId}:${pointCount}:${lastPointKey}`;
      })
      .join('|');
  }, [visitTrackings]);

  useEffect(() => {
    if (!map.current || !mapReadyRef.current) {
      console.log('[useMapboxRoutes] Map not ready, skipping route updates');
      return;
    }

    console.log(`[useMapboxRoutes] Processing ${visitTrackings.size} visit tracking(s) for route drawing`);
    
    visitTrackings.forEach(tracking => {
      const pointCount = tracking.routePoints?.length || 0;
      console.log(`[useMapboxRoutes] Visit ${tracking.visitId} has ${pointCount} route points`);
      
      if (tracking.routePoints && tracking.routePoints.length > 1) {
        console.log(`[useMapboxRoutes] Drawing route for visit ${tracking.visitId} with ${pointCount} points`);
        drawRoute(tracking, true);
      } else if (tracking.routePoints && tracking.routePoints.length === 1) {
        console.log(`[useMapboxRoutes] Visit ${tracking.visitId} has only 1 route point, waiting for more`);
      } else {
        console.log(`[useMapboxRoutes] Visit ${tracking.visitId} has no route points yet`);
      }
    });
  }, [visitTrackingsKey, visitTrackings, drawRoute]);

  // Manage route removal based on active visit trackings
  useEffect(() => {
    const activeVisitIds = new Set(visitTrackings.keys());
    routes.current.forEach((_layerId, visitId) => {
      if (activeVisitIds.has(visitId)) {
        cancelRouteRemoval(visitId);
      } else {
        scheduleRouteRemoval(visitId);
      }
    });
  }, [visitTrackings, cancelRouteRemoval, scheduleRouteRemoval]);

  return {
    drawRoute,
    cancelRouteRemoval,
    scheduleRouteRemoval,
    pendingRouteUpdates,
  };
};

