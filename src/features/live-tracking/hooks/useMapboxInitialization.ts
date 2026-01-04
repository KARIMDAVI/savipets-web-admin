/**
 * useMapboxInitialization Hook
 * 
 * Manages Mapbox map initialization, style loading, and cleanup.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import type React from 'react';
import mapboxgl from 'mapbox-gl';
import type { MapStatus } from '../components/MapContainer';
import { centerMapOnSitters } from './mapboxHelpers';

export interface UseMapboxInitializationDeps {
  mapContainer: React.RefObject<HTMLDivElement | null>;
  mapStyle: string;
  mapInstanceKey: number;
  markers: React.RefObject<Map<string, mapboxgl.Marker>>;
  hasCenteredOnSittersRef: React.RefObject<boolean>;
  flushPendingUpdates: () => void;
}

export interface UseMapboxInitializationReturn {
  map: React.RefObject<mapboxgl.Map | null>;
  mapStatus: MapStatus;
  mapReadyRef: React.RefObject<boolean>;
  styleLoadTimeoutId: React.RefObject<number | null>;
}

export const useMapboxInitialization = (
  deps: UseMapboxInitializationDeps
): UseMapboxInitializationReturn => {
  const { mapContainer, mapStyle, mapInstanceKey, markers, hasCenteredOnSittersRef, flushPendingUpdates } = deps;

  const map = useRef<mapboxgl.Map | null>(null);
  const [mapStatus, setMapStatus] = useState<MapStatus>('initializing');
  const mapReadyRef = useRef(false);
  const styleLoadTimeoutId = useRef<number | null>(null);
  const hasLoggedTokenError = useRef(false);

  useEffect(() => {
    mapReadyRef.current = mapStatus === 'ready';
  }, [mapStatus]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    
    // Check if token is missing or is a placeholder
    if (!token || 
        token === 'your_mapbox_token_here' || 
        token.includes('your_') || 
        token.length < 20) {
      // Only log error once to avoid console spam
      if (!hasLoggedTokenError.current) {
        console.error('❌ Mapbox access token is missing or invalid!');
        console.error('Please set a valid Mapbox access token in .env.local');
        console.error('Get your token from: https://account.mapbox.com/access-tokens/');
        hasLoggedTokenError.current = true;
      }
      setMapStatus('error');
      return;
    }

    mapboxgl.accessToken = token;
    setMapStatus('initializing');

    if (styleLoadTimeoutId.current) {
      window.clearTimeout(styleLoadTimeoutId.current);
      styleLoadTimeoutId.current = null;
    }

    try {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }

      // Initialize map with a default center (will be updated when sitter locations are available)
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [-74.006, 40.7128], // Default to NYC, will center on sitters when available
        zoom: 10, // Start with wider zoom, will adjust to sitter locations
        attributionControl: false,
        preserveDrawingBuffer: true, // Required for screenshot capture
      });
      
      // Reset centering flag when map is recreated
      hasCenteredOnSittersRef.current = false;

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        'top-right'
      );

      const timeoutId = window.setTimeout(() => {
        if (!map.current || map.current.isStyleLoaded()) {
          return;
        }
        setMapStatus('timeout');
      }, 5000);
      styleLoadTimeoutId.current = timeoutId;

      const handleLoad = () => {
        if (styleLoadTimeoutId.current) {
          window.clearTimeout(styleLoadTimeoutId.current);
          styleLoadTimeoutId.current = null;
        }
        setMapStatus('ready');
        flushPendingUpdates();
        
        // Try to center on sitters after map loads if markers are available
        setTimeout(() => {
          if (markers.current.size > 0 && map.current) {
            if (centerMapOnSitters(map.current, markers.current)) {
              hasCenteredOnSittersRef.current = true;
            }
          }
        }, 1500);
      };

      const handleError = (e: mapboxgl.ErrorEvent) => {
        console.error('❌ Map error:', e.error);
        if (styleLoadTimeoutId.current) {
          window.clearTimeout(styleLoadTimeoutId.current);
          styleLoadTimeoutId.current = null;
        }
        setMapStatus('error');
      };

      map.current.on('load', handleLoad);
      map.current.on('error', handleError);
    } catch (error) {
      console.error('❌ Failed to initialize map:', error);
      setMapStatus('error');
    }

    return () => {
      if (styleLoadTimeoutId.current) {
        window.clearTimeout(styleLoadTimeoutId.current);
        styleLoadTimeoutId.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      markers.current.forEach(marker => marker.remove());
      markers.current.clear();
      hasCenteredOnSittersRef.current = false;
    };
  }, [mapContainer, mapStyle, mapInstanceKey, markers, hasCenteredOnSittersRef, flushPendingUpdates]);

  return {
    map,
    mapStatus,
    mapReadyRef,
    styleLoadTimeoutId,
  };
};


