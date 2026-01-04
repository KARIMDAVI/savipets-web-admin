/**
 * useMapbox Hook
 * 
 * Hook for managing Mapbox map initialization and operations.
 */

import { useRef, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { EnhancedSitterLocation } from '../types/live-tracking.types';

export const useMapbox = (mapStyle: string) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const routes = useRef<Map<string, string>>(new Map());
  const routeSources = useRef<Map<string, mapboxgl.GeoJSONSource>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    
    // Check if token is missing or is a placeholder
    if (!token || 
        token === 'your_mapbox_token_here' || 
        token.includes('your_') || 
        token.length < 20) {
      console.error('❌ Mapbox access token is missing or invalid!');
      console.error('Please set a valid Mapbox access token in .env.local');
      console.error('Get your token from: https://account.mapbox.com/access-tokens/');
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [-122.4194, 37.7749], // San Francisco default
      zoom: 12,
    });

    map.current.on('load', () => {
      console.log('✅ Map loaded successfully');
    });

    map.current.on('error', (e) => {
      console.error('❌ Map error:', e);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map style
  useEffect(() => {
    if (map.current && mapStyle) {
      map.current.setStyle(mapStyle);
    }
  }, [mapStyle]);

  // Update marker
  const updateMarker = useCallback((sitterId: string, lat: number, lng: number, location: EnhancedSitterLocation, onMarkerClick?: () => void) => {
    if (!map.current) return;

    // Remove existing marker
    const existingMarker = markers.current.get(sitterId);
    if (existingMarker) {
      existingMarker.remove();
    }

    // Create custom marker element
    const el = document.createElement('div');
    el.className = `sitter-marker-${sitterId}`;
    el.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #52c41a;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      font-weight: bold;
    `;
    el.innerHTML = '👤';

    // Create new marker
    const marker = new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .addTo(map.current);

    // Add click handler
    if (onMarkerClick) {
      el.addEventListener('click', onMarkerClick);
    }

    // Add popup
    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false,
    })
      .setHTML(`
        <div style="padding: 8px;">
          <div style="font-weight: bold; margin-bottom: 4px;">
            ${location.sitter.firstName} ${location.sitter.lastName}
          </div>
          <div style="font-size: 12px; color: #666;">
            ${location.booking.serviceType.replace('-', ' ')}
          </div>
        </div>
      `);

    marker.setPopup(popup);
    markers.current.set(sitterId, marker);
  }, []);

  // Draw route
  const drawRoute = useCallback((visitId: string, routePoints: Array<{ latitude: number; longitude: number }>) => {
    if (!map.current) return;

    const sourceId = `route-${visitId}`;
    const layerId = `route-layer-${visitId}`;

    // Convert route points to GeoJSON LineString format
    const coordinates = routePoints.map(point => [point.longitude, point.latitude]);
    
    const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: { visitId },
      geometry: {
        type: 'LineString',
        coordinates: coordinates,
      },
    };

    // Remove existing route if it exists
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    // Add source
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: geojson,
    });

    // Add layer
    map.current.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#1890ff',
        'line-width': 4,
        'line-opacity': 0.7,
      },
    });

    // Store references
    routes.current.set(visitId, layerId);
    routeSources.current.set(visitId, map.current.getSource(sourceId) as mapboxgl.GeoJSONSource);
  }, []);

  // Clear all markers
  const clearMarkers = useCallback(() => {
    markers.current.forEach(marker => marker.remove());
    markers.current.clear();
  }, []);

  // Clear all routes
  const clearRoutes = useCallback(() => {
    if (!map.current) return;
    routes.current.forEach((layerId) => {
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });
    routeSources.current.forEach((source) => {
      const sourceId = source.id;
      if (map.current?.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    });
    routes.current.clear();
    routeSources.current.clear();
  }, []);

  return {
    mapContainer,
    map: map.current,
    updateMarker,
    drawRoute,
    clearMarkers,
    clearRoutes,
  };
};

