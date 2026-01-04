/**
 * Live Tracking Page
 * 
 * Real-time tracking visualization for active pet care visits.
 * Refactored to use feature hooks for better maintainability.
 */

import React from 'react';
import { Typography, Alert } from 'antd';
import { useLiveTrackingPage } from '@/features/live-tracking/hooks';
import {
  TrackingStatsCards,
  TrackingControls,
  TrackingActions,
  MapContainer,
  SitterDetailModal,
  TrackingLegend,
  TrackingDiagnostics,
} from '@/features/live-tracking/components';

const { Title, Text } = Typography;

// ✅ IMMEDIATE SCRIPT - Runs before React even loads
if (typeof window !== 'undefined') {
  console.log('🚀 [LiveTrackingPage] Script loaded at:', new Date().toISOString());
  console.log('🚀 [LiveTrackingPage] Window location:', window.location.href);
}

const LiveTrackingPage: React.FC = () => {
  // ✅ IMMEDIATE LOG - Runs on every render
  console.log('🚀 [LiveTrackingPage] Component rendering at:', new Date().toISOString());
  // ✅ IMMEDIATE LOG - Runs on every render
  console.log('🚀 [LiveTrackingPage] Component rendering...');
  
  const {
    selectedSitter,
    detailModalVisible,
    autoRefresh,
    refreshInterval,
    mapStyle,
    stats,
    activeBookings,
    activeVisits = [],
    sitterLocations,
    visitTrackings,
    isLoading,
    mapTracking,
    setDetailModalVisible,
    setAutoRefresh,
    setRefreshInterval,
    handleRefresh,
    handleMapStyleChange,
    handleGenerateReport,
    handleExportRoute,
    selectedVisitTracking,
  } = useLiveTrackingPage();

  // ✅ IMMEDIATE LOG - After hook execution
  console.log('📊 [LiveTrackingPage] Hook returned:', {
    activeBookings: activeBookings.length,
    activeVisits: activeVisits.length,
    sitterLocations: sitterLocations.size,
    visitTrackings: visitTrackings.size,
    isLoading,
  });

  // Debug logging
  React.useEffect(() => {
    console.log('🔄 [LiveTrackingPage] State update:', {
      activeBookings: activeBookings.length,
      activeVisits: activeVisits.length,
      sitterLocations: sitterLocations.size,
      visitTrackings: visitTrackings.size,
      isLoading,
    });
    if (sitterLocations.size > 0) {
      console.log('[LiveTrackingPage] Active sitter locations:', Array.from(sitterLocations.keys()));
    }
    if (activeVisits.length > 0) {
      console.log('[LiveTrackingPage] Active visits:', activeVisits.map(v => ({ id: v.id, sitterId: v.sitterId, status: v.status })));
    }
  }, [activeBookings.length, activeVisits.length, sitterLocations.size, visitTrackings.size, isLoading]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Live Tracking</Title>
        <Text type="secondary">
          Monitor active pet care visits in real-time
        </Text>
      </div>

      <TrackingStatsCards
        activeVisits={stats.activeVisits}
        activeSitters={stats.activeSitters}
        totalRevenue={stats.totalRevenue}
        avgDuration={stats.avgDuration}
      />

      {/* Diagnostic Panel - Remove in production */}
      {import.meta.env.DEV && (
        <TrackingDiagnostics
          activeVisits={activeVisits}
          activeBookings={activeBookings}
          sitterLocations={sitterLocations}
          visitTrackings={visitTrackings}
          isLoading={isLoading}
        />
      )}

      {activeBookings.length === 0 && (
        <Alert
          message="No Active Visits"
          description="Sitter locations will appear here once a visit is started (status changes to 'on_adventure'). To see locations: 1) Approve a booking in the Bookings section, 2) Ensure the sitter has started their visit in the iOS app, 3) Verify the sitter has granted 'Always Allow' location permission."
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {sitterLocations.size === 0 && activeBookings.length > 0 && (
        <Alert
          message="No Live Locations Yet"
          description={
            <div>
              <p>You have {activeBookings.length} active booking(s), but no sitters are currently tracking their location.</p>
              <p><strong>Possible causes:</strong></p>
              <ol>
                <li>The sitter hasn't started their visit yet (visit status must be 'on_adventure')</li>
                <li>The sitter's iOS app isn't running or doesn't have location permissions</li>
                <li>The sitter hasn't granted 'Always Allow' location permission</li>
                <li>Location updates aren't being written to Firestore</li>
              </ol>
              <p><strong>Troubleshooting:</strong></p>
              <ul>
                <li>Open browser console (F12) to see debug logs</li>
                <li>Check Firestore Console: visits collection where status == 'on_adventure'</li>
                <li>Check Firestore Console: locations/&lt;sitterId&gt; collection for location updates</li>
                <li>Verify sitter has 'Always Allow' location permission in iOS Settings</li>
                <li>Verify visitTracking documents are being created</li>
              </ul>
              <p><strong>Debug Info:</strong> Check browser console for [useLiveTracking] and [visitService] logs</p>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <TrackingControls
        autoRefresh={autoRefresh}
        refreshInterval={refreshInterval}
        mapStyle={mapStyle}
        isLoading={isLoading}
        onAutoRefreshChange={setAutoRefresh}
        onRefreshIntervalChange={setRefreshInterval}
        onMapStyleChange={handleMapStyleChange}
        onRefresh={handleRefresh}
      />

      <TrackingActions
        hasLocations={sitterLocations.size > 0}
        onCaptureScreenshot={mapTracking.handleCaptureScreenshot}
        onGenerateReport={handleGenerateReport}
      />

      <MapContainer
        mapContainerRef={mapTracking.mapContainerRef}
        isLoading={isLoading}
        status={mapTracking.mapStatus}
        onRetry={mapTracking.handleRetryMap}
      />

      <TrackingLegend />

      <SitterDetailModal
        sitter={selectedSitter}
        visible={detailModalVisible}
        visitTracking={selectedVisitTracking}
        onClose={() => setDetailModalVisible(false)}
        onExportRoute={handleExportRoute}
      />

      {!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN && (
        <Alert
          message="Mapbox Token Required"
          description="Please add your Mapbox access token to the .env file to enable map functionality."
          type="warning"
          showIcon
          style={{ marginTop: '16px' }}
        />
      )}
    </div>
  );
};

export default LiveTrackingPage;
