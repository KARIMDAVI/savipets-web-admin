import React from 'react';
import { Card, Col, Row, Typography } from 'antd';

const { Title, Text } = Typography;

export interface UserStats {
  total: number;
  active: number;
  sitters: number;
  owners: number;
}

interface UserStatsCardsProps {
  stats: UserStats;
}

const StatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <Card>
    <div style={{ textAlign: 'center' }}>
      <Title level={3} style={{ margin: 0, color }}>
        {value}
      </Title>
      <Text type="secondary">{label}</Text>
    </div>
  </Card>
);

const UserStatsCards: React.FC<UserStatsCardsProps> = ({ stats }) => (
  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
    <Col xs={24} sm={6}>
      <StatCard label="Total Users" value={stats.total} color="#1890ff" />
    </Col>
    <Col xs={24} sm={6}>
      <StatCard label="Active Users" value={stats.active} color="#52c41a" />
    </Col>
    <Col xs={24} sm={6}>
      <StatCard label="Pet Sitters" value={stats.sitters} color="#722ed1" />
    </Col>
    <Col xs={24} sm={6}>
      <StatCard label="Pet Owners" value={stats.owners} color="#faad14" />
    </Col>
  </Row>
);

export default UserStatsCards;
