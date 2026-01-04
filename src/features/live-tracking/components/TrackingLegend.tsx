/**
 * Tracking Legend Component
 * 
 * Displays legend for map markers (Active, Idle, Offline sitters).
 */

import React from 'react';
import { Card, Space, Typography } from 'antd';
import { mapTokens } from '@/design/mapTokens';

const { Title, Text } = Typography;

export const TrackingLegend: React.FC = () => {
  return (
    <Card style={{ marginTop: '16px' }}>
      <Title level={5}>Map Legend</Title>
      <Space direction="vertical" size="small">
        <Space wrap>
          <Space>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#52c41a',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
              }}
            >
              S
            </div>
            <Text>Active Sitter (with initials)</Text>
          </Space>
          <Space>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#1890ff',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            />
            <Text>Your Location (Admin)</Text>
          </Space>
        </Space>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Each sitter has a unique color and shows their initials. Click a marker to see details.
        </Text>
      </Space>
    </Card>
  );
};


