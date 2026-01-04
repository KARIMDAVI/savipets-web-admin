/**
 * Live Tracking Feature Types
 * 
 * Type definitions for live tracking and map visualization.
 * Extracted from LiveTracking.tsx for better organization.
 */

import type { User, Booking } from '@/types';

/**
 * Enhanced sitter location with booking and sitter info
 */
export interface EnhancedSitterLocation {
  sitterId: string;
  sitter: User;
  booking: Booking;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
    timestamp: Date;
  };
  status: 'active' | 'idle' | 'offline';
}

