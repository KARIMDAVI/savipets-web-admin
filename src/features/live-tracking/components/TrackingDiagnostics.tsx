/**
 * Tracking Diagnostics Component
 * 
 * Shows diagnostic information for debugging live tracking issues.
 */

import React from 'react';
import { Card, Descriptions, Tag, Space, Typography } from 'antd';
import type { EnhancedSitterLocation } from '../types/live-tracking.types';
import type { VisitTrackingData } from '@/services/tracking.service';
import type { Visit } from '@/services/visit.service';
import type { Booking } from '@/types';

const { Text } = Typography;

interface TrackingDiagnosticsProps {
  activeVisits: Visit[];
  activeBookings: Booking[];
  sitterLocations: Map<string, EnhancedSitterLocation>;
  visitTrackings: Map<string, VisitTrackingData>;
  isLoading: boolean;
}

export const TrackingDiagnostics: React.FC<TrackingDiagnosticsProps> = ({
  activeVisits,
  activeBookings,
  sitterLocations,
  visitTrackings,
  isLoading,
}) => {
  const sitterIdsFromVisits = new Set(activeVisits.map(v => v.sitterId).filter(Boolean));
  const sitterIdsFromBookings = new Set(activeBookings.map(b => b.sitterId).filter(Boolean));
  const sitterIdsWithLocations = new Set(Array.from(sitterLocations.keys()));

  return (
    <Card title="🔍 Tracking Diagnostics" size="small" style={{ marginBottom: '16px' }}>
      <Descriptions column={1} size="small">
        <Descriptions.Item label="Loading State">
          <Tag color={isLoading ? 'processing' : 'success'}>
            {isLoading ? 'Loading...' : 'Ready'}
          </Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Active Visits (on_adventure)">
          <Space>
            <Tag color={activeVisits.length > 0 ? 'success' : 'default'}>
              {activeVisits.length} visit(s)
            </Tag>
            {activeVisits.length > 0 && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Sitter IDs: {Array.from(sitterIdsFromVisits).join(', ') || 'None'}
              </Text>
            )}
          </Space>
        </Descriptions.Item>
        
        <Descriptions.Item label="Active Bookings">
          <Tag color={activeBookings.length > 0 ? 'info' : 'default'}>
            {activeBookings.length} booking(s)
          </Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Sitter Locations">
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Tag color={sitterLocations.size > 0 ? 'success' : 'warning'}>
              {sitterLocations.size} sitter(s) with locations
            </Tag>
            {sitterLocations.size > 0 && (
              <div style={{ fontSize: '12px' }}>
                {Array.from(sitterLocations.entries()).map(([sitterId, loc]) => (
                  <div key={sitterId} style={{ marginTop: '4px' }}>
                    <Text strong>{sitterId.slice(0, 8)}...</Text>
                    {' '}
                    <Text type="secondary">
                      lat: {loc.location.lat.toFixed(4)}, lng: {loc.location.lng.toFixed(4)}
                    </Text>
                    {' '}
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {new Date(loc.location.timestamp).toLocaleTimeString()}
                    </Text>
                  </div>
                ))}
              </div>
            )}
          </Space>
        </Descriptions.Item>
        
        <Descriptions.Item label="Visit Trackings">
          <Tag color={visitTrackings.size > 0 ? 'success' : 'default'}>
            {visitTrackings.size} tracking document(s)
          </Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Sitter ID Mismatch">
          {sitterIdsFromVisits.size > 0 && sitterLocations.size === 0 && (
            <Space direction="vertical" size="small">
              <Tag color="error">⚠️ Visits found but no locations</Tag>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Expected sitters: {Array.from(sitterIdsFromVisits).join(', ')}
                <br />
                Found locations: {Array.from(sitterIdsWithLocations).join(', ') || 'None'}
              </Text>
            </Space>
          )}
          {sitterIdsFromVisits.size === 0 && activeBookings.length > 0 && (
            <Tag color="warning">
              ⚠️ No active visits found, but {activeBookings.length} booking(s) exist
            </Tag>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

