/**
 * Tracking Stats Cards Component
 * 
 * Displays tracking statistics.
 */

import React from 'react';
import { Row, Col, Card, Typography } from 'antd';

const { Title, Text } = Typography;

interface TrackingStatsCardsProps {
  activeVisits: number;
  activeSitters: number;
  totalRevenue: number;
  avgDuration: number;
}

export const TrackingStatsCards: React.FC<TrackingStatsCardsProps> = ({
  activeVisits,
  activeSitters,
  totalRevenue,
  avgDuration,
}) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
              {activeVisits}
            </Title>
            <Text type="secondary">Active Visits</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              {activeSitters}
            </Title>
            <Text type="secondary">Live Sitters</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#722ed1' }}>
              ${typeof totalRevenue === 'number' ? totalRevenue.toFixed(0) : '0'}
            </Title>
            <Text type="secondary">Active Revenue</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#faad14' }}>
              {typeof avgDuration === 'number' ? avgDuration.toFixed(0) : '0'}m
            </Title>
            <Text type="secondary">Avg Duration</Text>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

