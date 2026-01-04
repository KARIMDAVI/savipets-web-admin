/**
 * Live Tracking Helper Functions
 * 
 * Utility functions for live tracking operations.
 */

import type { Booking, User } from '@/types';
import type { Visit } from '@/services/visit.service';
import type { VisitTrackingData } from '@/services/tracking.service';
import type { EnhancedSitterLocation } from '../types/live-tracking.types';

/**
 * Check if visit status is active
 * Standardized to 'on_adventure' only (legacy 'in_adventure' is normalized when reading)
 */
export const isActiveVisitStatus = (status: string): boolean => {
  return status === 'on_adventure';
};

/**
 * Convert visit to booking for compatibility
 */
export const convertVisitToBooking = (visit: Visit): Booking => {
  const scheduledEnd = visit.scheduledEnd ?? visit.scheduledStart;
  const durationMinutes = Math.max(
    (scheduledEnd.getTime() - visit.scheduledStart.getTime()) / 60000,
    0
  );

  return {
    id: visit.id,
    sitterId: visit.sitterId,
    clientId: visit.clientId,
    serviceType: visit.serviceSummary as any, // ServiceType
    scheduledDate: visit.scheduledStart,
    status: 'active' as const,
    address: visit.address as any, // Address type
    pets: visit.petNames,
    duration: durationMinutes,
    price: 0,
    createdAt: visit.scheduledStart,
    updatedAt: scheduledEnd,
  };
};

/**
 * Build fallback sitter profile
 */
export const buildFallbackSitter = (sitterId: string, activeVisits: Visit[]): User => {
  const visit = activeVisits.find(v => v.sitterId === sitterId);
  const displayName = visit?.sitterName?.trim();
  const [firstName, ...rest] = (displayName && displayName.length > 0
    ? displayName
    : 'Sitter').split(' ');

  return {
    id: sitterId,
    email: `${sitterId}@fallback.savipets`,
    firstName: firstName || 'Sitter',
    lastName: rest.join(' ') || '',
    role: 'petSitter',
    isActive: true,
    createdAt: visit?.scheduledStart ?? new Date(),
    updatedAt: visit?.scheduledEnd ?? visit?.scheduledStart ?? new Date(),
  };
};

/**
 * Find booking for tracking
 */
export const findBookingForTracking = (
  sitterId: string,
  visitId: string,
  clientId: string,
  effectiveActiveBookings: Booking[],
  activeVisits: Visit[],
  convertVisitToBookingFn: (visit: Visit) => Booking
): Booking => {
  const fromEffective = effectiveActiveBookings.find(b => b.id === visitId || b.sitterId === sitterId);
  if (fromEffective) {
    return fromEffective;
  }

  const fromVisit = activeVisits.find(v => v.id === visitId) || activeVisits.find(v => v.sitterId === sitterId);
  if (fromVisit) {
    return convertVisitToBookingFn(fromVisit);
  }

  return {
    id: visitId,
    sitterId,
    clientId,
    serviceType: 'dog-walking',
    status: 'active',
    scheduledDate: new Date(),
    duration: 0,
    pets: [],
    address: null,
    price: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Derive location from tracking data
 */
export const deriveLocationFromTracking = (tracking: VisitTrackingData) => {
  const routePoints = tracking.routePoints || [];
  const fallbackPoint = routePoints.length > 0 ? routePoints[routePoints.length - 1] : undefined;
  const source = tracking.lastLocation || fallbackPoint;

  if (!source || typeof source.latitude !== 'number' || typeof source.longitude !== 'number') {
    return undefined;
  }

  const timestamp =
    source.timestamp instanceof Date
      ? source.timestamp
      : tracking.lastUpdated ?? new Date();

  return {
    lat: source.latitude,
    lng: source.longitude,
    accuracy: source.accuracy,
    speed: source.speed,
    heading: (source as any).heading,
    timestamp,
  };
};


