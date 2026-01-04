/**
 * Live Tracking Page Types
 * 
 * Centralized type definitions for the LiveTracking page refactoring.
 * Prevents circular dependencies between hooks and components.
 */

import type React from 'react';
import type { MapStatus } from '../components/MapContainer';
import type { EnhancedSitterLocation } from './live-tracking.types';
import type { VisitTrackingData } from '@/services/tracking.service';
import type { Booking, User } from '@/types';

/**
 * Map tracking hook return type
 */
export interface UseMapboxTrackingReturn {
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  mapStatus: MapStatus;
  setMapStyle: (style: string) => void;
  handleRetryMap: () => void;
  handleCaptureScreenshot: () => void;
  updateMarkerPosition: (sitterId: string, lat: number, lng: number, location: EnhancedSitterLocation) => void;
}

/**
 * Map tracking hook dependencies
 * All data and callbacks needed by useMapboxTracking
 */
export interface UseMapboxTrackingDeps {
  mapStyle: string;
  activeBookings: Booking[];
  sitters: User[];
  sitterLocations: Map<string, EnhancedSitterLocation>;
  visitTrackings: Map<string, VisitTrackingData>;
  setSitterLocations: React.Dispatch<React.SetStateAction<Map<string, EnhancedSitterLocation>>>;
  setVisitTrackings: React.Dispatch<React.SetStateAction<Map<string, VisitTrackingData>>>;
  onMarkerClick: (location: EnhancedSitterLocation) => void;
  onLocationUpdate?: (sitterId: string, lat: number, lng: number, location: EnhancedSitterLocation) => void;
}

/**
 * Page hook return type
 * Everything the LiveTracking page component needs
 */
export interface UseLiveTrackingPageReturn {
  // State
  selectedSitter: EnhancedSitterLocation | null;
  detailModalVisible: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  mapStyle: string;
  stats: {
    activeVisits: number;
    activeSitters: number;
    totalRevenue: number;
    avgDuration: number;
  };
  
  // Data from useLiveTracking
  activeBookings: Booking[];
  activeVisits?: any[]; // Visit[] from visitService
  sitters: User[];
  sitterLocations: Map<string, EnhancedSitterLocation>;
  visitTrackings: Map<string, VisitTrackingData>;
  isLoading: boolean;
  
  // Map tracking hook
  mapTracking: UseMapboxTrackingReturn;
  
  // Handlers
  setSelectedSitter: (sitter: EnhancedSitterLocation | null) => void;
  setDetailModalVisible: (visible: boolean) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  handleRefresh: () => void;
  handleMapStyleChange: (style: string) => void;
  handleGenerateReport: () => void;
  handleExportRoute: (visitId: string) => void;
  selectedVisitTracking?: VisitTrackingData;
}

