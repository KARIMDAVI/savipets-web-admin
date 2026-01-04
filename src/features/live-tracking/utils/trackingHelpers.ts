/**
 * Live Tracking Helper Utilities
 * 
 * Utility functions for tracking calculations and exports.
 */

import dayjs from 'dayjs';
import type { EnhancedSitterLocation } from '../types/live-tracking.types';
import type { VisitTrackingData } from '@/services/tracking.service';

/**
 * Haversine distance in meters between two lat/lng points
 */
const toRad = (deg: number) => (deg * Math.PI) / 180;
export const haversineDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Filter route points based on accuracy, min distance and min time delta
 */
export const filterRoutePoints = (
  points: Array<{
    latitude: number;
    longitude: number;
    timestamp: Date | string | number;
    accuracy?: number;
    speed?: number;
    altitude?: number;
  }>,
  options?: {
    maxAccuracyMeters?: number;
    minDistanceMeters?: number;
    minTimeSeconds?: number;
  }
) => {
  const maxAccuracy = options?.maxAccuracyMeters ?? 50; // meters
  const minDistance = options?.minDistanceMeters ?? 15; // meters
  const minTime = options?.minTimeSeconds ?? 7; // seconds
  const result: typeof points = [];
  let lastKept: typeof points[number] | undefined;

  for (const p of points) {
    if (typeof p.accuracy === 'number' && p.accuracy > maxAccuracy) {
      continue;
    }
    if (!lastKept) {
      result.push(p);
      lastKept = p;
      continue;
    }
    const dtSec = (new Date(p.timestamp).getTime() - new Date(lastKept.timestamp).getTime()) / 1000;
    const dMeters = haversineDistanceMeters(
      lastKept.latitude,
      lastKept.longitude,
      p.latitude,
      p.longitude
    );
    if (dtSec >= minTime && dMeters >= minDistance) {
      result.push(p);
      lastKept = p;
    }
  }
  return result;
};

/**
 * Compute total distance (km) of a route
 */
export const computeTotalDistanceKm = (points: Array<{ latitude: number; longitude: number }>) => {
  if (points.length < 2) return 0;
  let meters = 0;
  for (let i = 1; i < points.length; i++) {
    meters += haversineDistanceMeters(
      points[i - 1].latitude,
      points[i - 1].longitude,
      points[i].latitude,
      points[i].longitude
    );
  }
  return meters / 1000;
};

/**
 * Calculate tracking statistics
 */
export const calculateTrackingStats = (
  activeBookings: any[],
  sitterLocations: Map<string, EnhancedSitterLocation>
) => {
  return {
    activeVisits: activeBookings.length,
    activeSitters: sitterLocations.size,
    totalRevenue: activeBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0),
    avgDuration: activeBookings.length > 0 
      ? activeBookings.reduce((sum, b) => sum + (Number(b.duration) || 0), 0) / activeBookings.length 
      : 0,
  };
};

/**
 * Generate tracking report
 */
export const generateTrackingReport = (
  sitterLocations: Map<string, EnhancedSitterLocation>,
  visitTrackings: Map<string, VisitTrackingData>
) => {
  // Redact PII (no emails/phones), include only operational fields
  return {
    generatedAt: new Date().toISOString(),
    activeSitters: Array.from(sitterLocations.values()).map(loc => ({
      sitterName: `${loc.sitter.firstName} ${loc.sitter.lastName}`,
      bookingId: loc.booking.id,
      serviceType: loc.booking.serviceType,
      location: {
        lat: loc.location.lat,
        lng: loc.location.lng,
        timestamp: loc.location.timestamp,
      },
    })),
    routes: Array.from(visitTrackings.values()).map(tracking => {
      const filtered = filterRoutePoints(tracking.routePoints);
      const totalDistance = computeTotalDistanceKm(filtered);
      return {
        visitId: tracking.visitId,
        sitterId: tracking.sitterId,
        clientId: tracking.clientId,
        totalDistance,
        routePoints: filtered.map(point => ({
          latitude: point.latitude,
          longitude: point.longitude,
          timestamp: point.timestamp,
          accuracy: point.accuracy,
          speed: point.speed,
        })),
        checkInLocation: tracking.checkInLocation,
      };
    }),
  };
};

/**
 * Export JSON file
 */
export const exportJSONFile = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Capture map screenshot
 * 
 * Note: Mapbox map must be initialized with preserveDrawingBuffer: true
 * for canvas access to work properly.
 */
export const captureMapScreenshot = (map: any, onSuccess?: () => void, onError?: (error: Error) => void) => {
  if (!map) {
    onError?.(new Error('Map instance is not available'));
    return;
  }
  
  try {
    const canvas = map.getCanvas();
    
    if (!canvas) {
      onError?.(new Error('Map canvas is not available. Ensure preserveDrawingBuffer is enabled.'));
      return;
    }
    
    // Ensure canvas is ready
    if (canvas.width === 0 || canvas.height === 0) {
      onError?.(new Error('Map canvas has zero dimensions'));
      return;
    }
    
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `savi-pets-map-${dayjs().format('YYYY-MM-DD-HHmmss')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        onSuccess?.();
      } else {
        onError?.(new Error('Failed to create blob from canvas'));
      }
    }, 'image/png');
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error capturing screenshot');
    onError?.(err);
    console.error('Error capturing map screenshot:', error);
  }
};

