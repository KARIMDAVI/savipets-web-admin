/**
 * Booking Statistics Cards Component
 * 
 * Component for displaying booking statistics in card format.
 */

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  DollarOutlined,
} from '@ant-design/icons';

interface BookingStats {
  total: number;
  pending: number;
  active: number;
  completed: number;
  revenue: number;
}

interface BookingStatsCardsProps {
  stats: BookingStats;
}

export const BookingStatsCards: React.FC<BookingStatsCardsProps> = ({ stats }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Total Bookings"
            value={stats.total}
            prefix={<CalendarOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Pending"
            value={stats.pending}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Active"
            value={stats.active}
            prefix={<CheckOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Revenue"
            value={stats.revenue}
            prefix={<DollarOutlined />}
            precision={0}
            valueStyle={{ color: '#722ed1' }}
            suffix="$"
          />
        </Card>
      </Col>
    </Row>
  );
};


