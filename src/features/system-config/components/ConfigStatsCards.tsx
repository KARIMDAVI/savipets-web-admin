/**
 * System Configuration Statistics Cards Component
 * 
 * Displays key system configuration statistics in card format.
 */

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  FlagOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { SystemConfigStats } from '../types/system-config.types';

interface ConfigStatsCardsProps {
  stats: SystemConfigStats;
}

export const ConfigStatsCards: React.FC<ConfigStatsCardsProps> = ({ stats }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Active Services"
            value={stats.activeServices}
            prefix={<FileTextOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Pricing Tiers"
            value={stats.totalPricingTiers}
            prefix={<DollarOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Feature Flags"
            value={stats.activeFeatureFlags}
            prefix={<FlagOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Business Days"
            value={stats.businessHoursConfigured}
            prefix={<CalendarOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

