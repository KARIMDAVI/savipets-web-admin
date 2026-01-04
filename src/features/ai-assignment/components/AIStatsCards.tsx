/**
 * AI Stats Cards Component
 * 
 * Displays AI assignment statistics.
 */

import React from 'react';
import { Row, Col, Card, Typography } from 'antd';
import type { AIAssignmentStats } from '../types/ai-assignment.types';

const { Title, Text } = Typography;

interface AIStatsCardsProps {
  stats: AIAssignmentStats;
}

export const AIStatsCards: React.FC<AIStatsCardsProps> = ({ stats }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              {stats.totalPending}
            </Title>
            <Text type="secondary">Pending Assignments</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
              {stats.highConfidence}
            </Title>
            <Text type="secondary">High Confidence</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#722ed1' }}>
              {stats.autoAssigned}
            </Title>
            <Text type="secondary">Auto-assigned</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#faad14' }}>
              {stats.overridden}
            </Title>
            <Text type="secondary">Overridden</Text>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

