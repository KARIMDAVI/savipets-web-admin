/**
 * Analytics Stats Cards Component
 * 
 * Displays key metrics cards.
 */

import React from 'react';
import { Row, Col, Card, Statistic, Space, Typography } from 'antd';
import { RiseOutlined } from '@ant-design/icons';
import type { AnalyticsData } from '../types/analytics.types';

const { Text } = Typography;

interface AnalyticsStatsCardsProps {
  data: AnalyticsData;
}

export const AnalyticsStatsCards: React.FC<AnalyticsStatsCardsProps> = ({ data }) => {
  return (
    <section aria-label="Analytics key metrics" aria-live="polite">
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={data.revenue.total}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              suffix={
                <Space>
                  <RiseOutlined style={{ color: '#3f8600' }} aria-hidden="true" />
                  <Text type="success" aria-label={`Growth: ${data.revenue.growth}%`}>
                    {data.revenue.growth}%
                  </Text>
                </Space>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Bookings"
              value={data.bookings.total}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <Space>
                  <RiseOutlined style={{ color: '#1890ff' }} aria-hidden="true" />
                  <Text type="success" aria-label={`Growth: ${data.bookings.growth}%`}>
                    {data.bookings.growth}%
                  </Text>
                </Space>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={data.users.total}
              valueStyle={{ color: '#722ed1' }}
              suffix={
                <Space>
                  <RiseOutlined style={{ color: '#722ed1' }} aria-hidden="true" />
                  <Text type="success" aria-label={`Growth: ${data.users.growth}%`}>
                    {data.users.growth}%
                  </Text>
                </Space>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Avg Rating"
              value={data.performance.avgRating}
              precision={1}
              suffix={<span aria-label="stars">⭐</span>}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>
    </section>
  );
};

