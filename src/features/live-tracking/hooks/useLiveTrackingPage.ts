/**
 * useLiveTrackingPage Hook
 * 
 * Orchestrates all page-level state and handlers for the LiveTracking page.
 * Coordinates between useLiveTracking (data) and useMapboxTracking (map).
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { useLiveTracking } from './useLiveTracking';
import { useMapboxTracking } from './useMapboxTracking';
import type { EnhancedSitterLocation } from '../types/live-tracking.types';
import type { UseLiveTrackingPageReturn } from '../types/liveTrackingPage.types';
import { calculateTrackingStats, generateTrackingReport as generateReportHelper, exportJSONFile } from '../utils/trackingHelpers';

export const useLiveTrackingPage = (): UseLiveTrackingPageReturn => {
  // Page-level state
  const [selectedSitter, setSelectedSitter] = useState<EnhancedSitterLocation | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');

  // Data from useLiveTracking
  const {
    activeBookings,
    activeVisits = [],
    sitters,
    sitterLocations,
    visitTrackings,
    isLoading,
    refetch,
    setSitterLocations,
    setVisitTrackings,
  } = useLiveTracking(autoRefresh, refreshInterval);

  // Debug: Log state changes
  useEffect(() => {
    console.log('[useLiveTrackingPage] State:', {
      activeVisits: activeVisits.length,
      activeBookings: activeBookings.length,
      sitterLocations: sitterLocations.size,
      visitTrackings: visitTrackings.size,
      isLoading,
    });
  }, [activeVisits.length, activeBookings.length, sitterLocations.size, visitTrackings.size, isLoading]);

  // Handle marker click
  const handleMarkerClick = useCallback((location: EnhancedSitterLocation) => {
    setSelectedSitter(location);
    setDetailModalVisible(true);
  }, []);

  // Create a ref to store the marker update function
  const markerUpdateRef = React.useRef<((sitterId: string, lat: number, lng: number, location: EnhancedSitterLocation) => void) | null>(null);

  // Map tracking hook
  const mapTracking = useMapboxTracking({
    mapStyle,
    activeBookings,
    sitters,
    sitterLocations,
    visitTrackings,
    setSitterLocations,
    setVisitTrackings,
    onMarkerClick: handleMarkerClick,
    onLocationUpdate: (sitterId, lat, lng, location) => {
      // Store the update function in ref for useLiveTracking to use
      if (markerUpdateRef.current) {
        markerUpdateRef.current(sitterId, lat, lng, location);
      }
    },
  });

  // Update the ref when mapTracking is ready
  React.useEffect(() => {
    if (mapTracking.updateMarkerPosition) {
      markerUpdateRef.current = mapTracking.updateMarkerPosition;
    }
  }, [mapTracking.updateMarkerPosition]);

  // Calculate statistics - ONLY use activeVisits (visits that sitters have started but not ended)
  // Do NOT fall back to activeBookings - bookings can be approved but visits not started yet
  const stats = useMemo(
    () => {
      // Find bookings that match active visits for revenue/duration calculation
      const bookingsForStats = activeVisits
        .map(visit => {
          // Try to find matching booking
          return activeBookings.find(b => b.id === visit.bookingId || b.id === visit.id);
        })
        .filter((b): b is typeof activeBookings[0] => b !== undefined);
      
      return {
        activeVisits: activeVisits.length, // Only count actual active visits, not bookings
        activeSitters: sitterLocations.size,
        totalRevenue: bookingsForStats.reduce((sum, b) => sum + (Number(b.price) || 0), 0),
        avgDuration: bookingsForStats.length > 0 
          ? bookingsForStats.reduce((sum, b) => sum + (Number(b.duration) || 0), 0) / bookingsForStats.length 
          : 0,
      };
    },
    [activeVisits, activeBookings, sitterLocations]
  );

  // Handlers
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleMapStyleChange = useCallback((style: string) => {
    setMapStyle(style);
    mapTracking.setMapStyle(style);
  }, [mapTracking]);

  const handleGenerateReport = useCallback(() => {
    const report = generateReportHelper(sitterLocations, visitTrackings);
    exportJSONFile(report, `savi-pets-tracking-report-${dayjs().format('YYYY-MM-DD-HHmmss')}.json`);
    message.success('Tracking report generated successfully!');
  }, [sitterLocations, visitTrackings]);

  const handleExportRoute = useCallback((visitId: string) => {
    const tracking = visitTrackings.get(visitId);
    if (!tracking) {
      message.error('Route data not found for this visit');
      return;
    }

    const candidateBookingId = (tracking as any).bookingId ?? tracking.visitId;
    const booking = activeBookings.find(b => b.id === candidateBookingId) || activeBookings.find(b => b.id === visitId);
    const sitter = sitters.find(s => s.id === tracking.sitterId);

    const routeData = {
      visitId: tracking.visitId,
      bookingId: booking?.id || (candidateBookingId ?? 'N/A'),
      sitterName: sitter ? `${sitter.firstName} ${sitter.lastName}` : 'Unknown',
      clientId: tracking.clientId,
      serviceType: booking?.serviceType || 'N/A',
      scheduledDate: booking?.scheduledDate || 'N/A',
      totalDistance: tracking.totalDistance,
      checkInLocation: tracking.checkInLocation,
      routePoints: tracking.routePoints.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude,
        timestamp: point.timestamp,
        accuracy: point.accuracy,
        speed: point.speed,
        altitude: point.altitude,
      })),
      exportedAt: new Date().toISOString(),
    };

    exportJSONFile(routeData, `savi-pets-route-${visitId.slice(-8)}-${dayjs().format('YYYY-MM-DD-HHmmss')}.json`);
    message.success('Route exported successfully!');
  }, [visitTrackings, activeBookings, sitters]);

  // Get visit tracking for selected sitter
  const selectedVisitTracking = useMemo(() => {
    if (!selectedSitter) return undefined;
    const byBookingId = visitTrackings.get(selectedSitter.booking.id);
    if (byBookingId) return byBookingId;
    const matchByBookingField = Array.from(visitTrackings.values()).find(t => (t as any).bookingId === selectedSitter.booking.id);
    if (matchByBookingField) return matchByBookingField;
    return Array.from(visitTrackings.values()).find(t => t.sitterId === selectedSitter.sitterId);
  }, [selectedSitter, visitTrackings]);

  return {
    // State
    selectedSitter,
    detailModalVisible,
    autoRefresh,
    refreshInterval,
    mapStyle,
    stats,
    
    // Data
    activeBookings,
    activeVisits,
    sitters,
    sitterLocations,
    visitTrackings,
    isLoading,
    
    // Map tracking
    mapTracking,
    
    // Handlers
    setSelectedSitter,
    setDetailModalVisible,
    setAutoRefresh,
    setRefreshInterval,
    handleRefresh,
    handleMapStyleChange,
    handleGenerateReport,
    handleExportRoute,
    selectedVisitTracking,
  };
};


