/**
 * CRM Stats Cards Component
 * 
 * Displays CRM statistics.
 */

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  UserOutlined,
  StarOutlined,
  WarningOutlined,
} from '@ant-design/icons';

interface CRMStatsCardsProps {
  totalClients: number;
  vipClients: number;
  atRiskClients: number;
  totalRevenue: number;
}

export const CRMStatsCards: React.FC<CRMStatsCardsProps> = ({
  totalClients,
  vipClients,
  atRiskClients,
  totalRevenue,
}) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Total Clients"
            value={totalClients}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="VIP Clients"
            value={vipClients}
            prefix={<StarOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="At Risk"
            value={atRiskClients}
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Total Revenue"
            value={totalRevenue}
            prefix="$"
            precision={0}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

