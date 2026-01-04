/**
 * Security Stats Cards Component
 * 
 * Displays security statistics.
 */

import React from 'react';
import { Row, Col, Card, Typography } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface SecurityStatsCardsProps {
  totalDevices: number;
  activeSessions: number;
  totalSessions: number;
  lastLogin: Date;
}

export const SecurityStatsCards: React.FC<SecurityStatsCardsProps> = ({
  totalDevices,
  activeSessions,
  totalSessions,
  lastLogin,
}) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              {totalDevices}
            </Title>
            <Text type="secondary">Security Devices</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
              {activeSessions}
            </Title>
            <Text type="secondary">Active Sessions</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#722ed1' }}>
              {totalSessions}
            </Title>
            <Text type="secondary">Total Sessions</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#faad14' }}>
              {dayjs(lastLogin).format('MMM DD')}
            </Title>
            <Text type="secondary">Last Login</Text>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

