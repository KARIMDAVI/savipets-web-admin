/**
 * Mapbox Helper Functions
 * 
 * Utility functions for map operations like centering and popup creation.
 */

import mapboxgl from 'mapbox-gl';
import dayjs from 'dayjs';
import type { EnhancedSitterLocation } from '../types/live-tracking.types';
import { mapTokens } from '@/design/mapTokens';

/**
 * Center map on sitter locations
 */
export const centerMapOnSitters = (
  map: mapboxgl.Map | null,
  markers: Map<string, mapboxgl.Marker>
): boolean => {
  if (!map) return false;
  
  const activeMarkers = Array.from(markers.values());
  if (activeMarkers.length === 0) return false;
  
  if (activeMarkers.length === 1) {
    // Single sitter: center on them with a reasonable zoom level
    const lngLat = activeMarkers[0].getLngLat();
    console.log(`[mapboxHelpers] 🎯 Centering map on single sitter at (${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)})`);
    map.flyTo({
      center: [lngLat.lng, lngLat.lat],
      zoom: 14, // Good zoom level for tracking a single sitter
      duration: 1000
    });
    return true;
  } else {
    // Multiple sitters: fit bounds to show all
    const bounds = new mapboxgl.LngLatBounds();
    activeMarkers.forEach(marker => {
      const lngLat = marker.getLngLat();
      bounds.extend([lngLat.lng, lngLat.lat]);
    });
    
    if (!bounds.isEmpty()) {
      console.log(`[mapboxHelpers] 🎯 Centering map on ${activeMarkers.length} sitter location(s)`);
      map.fitBounds(bounds, { 
        padding: mapTokens.sizes.mapPadding || 50,
        maxZoom: 15, // Don't zoom in too close
        duration: 1000 // Smooth animation
      });
      return true;
    }
  }
  
  return false;
};

/**
 * Create popup HTML for sitter marker
 */
export const createSitterPopupHTML = (location: EnhancedSitterLocation): string => {
  return `
    <div style="padding: 8px; background: ${mapTokens.colors.popupBackground}; color: ${mapTokens.colors.popupText};">
      <div style="font-weight: bold; margin-bottom: 4px; color: ${mapTokens.colors.popupText};">
        ${location.sitter.firstName} ${location.sitter.lastName}
      </div>
      <div style="font-size: 12px; color: ${mapTokens.colors.popupText}; opacity: 0.75;">
        ${location.booking.serviceType.replace('-', ' ')}
      </div>
      <div style="font-size: 12px; color: ${mapTokens.colors.popupText}; opacity: 0.75;">
        Updated: ${dayjs(location.location.timestamp).format('h:mm:ss A')}
      </div>
    </div>
  `;
};

/**
 * Create marker element for sitter
 */
export const createSitterMarkerElement = (
  sitterId: string,
  location: EnhancedSitterLocation
): HTMLDivElement => {
  // Generate a consistent color for this sitter based on their ID
  const sitterColors = [
    '#52c41a', // Green
    '#1890ff', // Blue
    '#fa8c16', // Orange
    '#eb2f96', // Pink
    '#722ed1', // Purple
    '#13c2c2', // Cyan
    '#f5222d', // Red
    '#faad14', // Gold
  ];
  const colorIndex = parseInt(sitterId.slice(-2), 16) % sitterColors.length;
  const sitterColor = sitterColors[colorIndex];
  
  // Get sitter initials for label
  const firstName = location.sitter.firstName || '';
  const lastName = location.sitter.lastName || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'S';
  
  const el = document.createElement('div');
  el.className = `sitter-marker-${sitterId}`;
  el.style.cssText = `
    width: ${mapTokens.sizes.markerDiameter}px; 
    height: ${mapTokens.sizes.markerDiameter}px; 
    border-radius: 50%; 
    background-color: ${sitterColor};
    border: ${mapTokens.sizes.markerBorder}px solid white; 
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    cursor: pointer; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    color: white; 
    font-size: 12px; 
    font-weight: bold;
    position: relative;
  `;
  el.innerHTML = initials;
  
  // Add a tooltip/label below the marker
  const label = document.createElement('div');
  label.className = `sitter-label-${sitterId}`;
  label.style.cssText = `
    position: absolute;
    top: ${mapTokens.sizes.markerDiameter + 4}px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    white-space: nowrap;
    pointer-events: none;
    z-index: 1000;
  `;
  label.textContent = `${firstName} ${lastName}`.trim() || 'Sitter';
  el.appendChild(label);
  
  return el;
};


