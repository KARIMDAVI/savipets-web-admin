/**
 * useMapboxTracking Hook
 * 
 * Orchestrates Mapbox map initialization, markers, routes, and subscriptions.
 * Uses specialized hooks for each concern to maintain separation of responsibilities.
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { message } from 'antd';
import type { UseMapboxTrackingDeps, UseMapboxTrackingReturn } from '../types/liveTrackingPage.types';
import { captureMapScreenshot as captureScreenshotHelper } from '../utils/trackingHelpers';
import { useMapboxInitialization } from './useMapboxInitialization';
import { useMapboxRoutes } from './useMapboxRoutes';
import { useMapboxMarkers } from './useMapboxMarkers';

export const useMapboxTracking = (
  deps: UseMapboxTrackingDeps
): UseMapboxTrackingReturn => {
  const {
    mapStyle,
    sitterLocations,
    visitTrackings,
    onMarkerClick,
  } = deps;

  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapInstanceKey, setMapInstanceKey] = useState(0);

  // Initialize markers ref for initialization hook
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const hasCenteredOnSittersRef = useRef(false);

  // Create refs to store hook returns for flushPendingUpdates
  const routesHookRef = useRef<ReturnType<typeof useMapboxRoutes> | null>(null);
  const markersHookRef = useRef<ReturnType<typeof useMapboxMarkers> | null>(null);

  // Flush pending updates callback - will be updated after hooks are initialized
  const flushPendingUpdates = useCallback(() => {
    if (routesHookRef.current) {
      routesHookRef.current.pendingRouteUpdates.current.forEach(tracking => {
        routesHookRef.current!.drawRoute(tracking, true);
      });
      routesHookRef.current.pendingRouteUpdates.current.clear();
    }

    if (markersHookRef.current) {
      markersHookRef.current.pendingLocationUpdates.current.forEach(location => {
        const { sitterId, location: coords } = location;
        markersHookRef.current!.updateMarker(sitterId, coords.lat, coords.lng, location, true);
      });
      markersHookRef.current.pendingLocationUpdates.current.clear();
    }
  }, []);

  // Initialize map
  const initHook = useMapboxInitialization({
    mapContainer,
    mapStyle,
    mapInstanceKey,
    markers,
    hasCenteredOnSittersRef,
    flushPendingUpdates,
  });

  // Setup routes
  const routesHook = useMapboxRoutes({
    map: initHook.map,
    mapReadyRef: initHook.mapReadyRef,
    visitTrackings,
  });
  routesHookRef.current = routesHook;

  // Setup markers
  const markersHook = useMapboxMarkers({
    map: initHook.map,
    mapReadyRef: initHook.mapReadyRef,
    sitterLocations,
    onMarkerClick,
    mapStatus: initHook.mapStatus,
  });
  markersHookRef.current = markersHook;

  // Flush pending updates when map status becomes ready
  useEffect(() => {
    if (initHook.mapStatus === 'ready') {
      flushPendingUpdates();
    }
  }, [initHook.mapStatus, flushPendingUpdates]);

  // Handle map style change
  const setMapStyleInternal = useCallback((style: string) => {
    if (initHook.map.current) {
      initHook.map.current.setStyle(style);
    }
  }, [initHook.map]);

  // Handle retry map
  const handleRetryMap = useCallback(() => {
    message.info('Connection lost, retrying...');
    setMapInstanceKey(prev => prev + 1);
  }, []);

  // Handle capture screenshot
  const handleCaptureScreenshot = useCallback(() => {
    if (initHook.map.current) {
      captureScreenshotHelper(
        initHook.map.current,
        () => {
          message.success('Map screenshot captured successfully!');
        },
        (error) => {
          message.error(`Failed to capture screenshot: ${error.message}`);
          console.error('Screenshot error:', error);
        }
      );
    } else {
      message.error('Map is not ready. Please wait for the map to load.');
    }
  }, [initHook.map]);

  // Expose updateMarkerPosition for direct calls from location subscriptions
  const exposedUpdateMarkerPosition = useCallback((sitterId: string, lat: number, lng: number, location: any) => {
    markersHook.updateMarkerPosition(sitterId, lat, lng, location);
  }, [markersHook]);

  // Register the callback so useLiveTracking can call it directly
  useEffect(() => {
    (window as any).__updateMarkerPosition = exposedUpdateMarkerPosition;
    return () => {
      delete (window as any).__updateMarkerPosition;
    };
  }, [exposedUpdateMarkerPosition]);

  return {
    mapContainerRef: mapContainer,
    mapStatus: initHook.mapStatus,
    setMapStyle: setMapStyleInternal,
    handleRetryMap,
    handleCaptureScreenshot,
    updateMarkerPosition: exposedUpdateMarkerPosition,
  };
};
