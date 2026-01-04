/**
 * Performance Metrics Component
 * 
 * Displays booking status, user distribution, and performance metrics.
 */

import React from 'react';
import { Row, Col, Card, Space, Typography, Progress } from 'antd';
import { UserOutlined, TrophyOutlined } from '@ant-design/icons';
import type { AnalyticsData } from '../types/analytics.types';

const { Text } = Typography;

interface PerformanceMetricsProps {
  data: AnalyticsData;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ data }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      <Col xs={24} sm={8}>
        <Card title="Booking Status">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Space>
                <Text>Completed</Text>
                <Text strong>{data.bookings.completed}</Text>
              </Space>
              <Progress
                percent={(data.bookings.completed / data.bookings.total) * 100}
                strokeColor="#52c41a"
                size="small"
              />
            </div>
            <div>
              <Space>
                <Text>Pending</Text>
                <Text strong>{data.bookings.pending}</Text>
              </Space>
              <Progress
                percent={(data.bookings.pending / data.bookings.total) * 100}
                strokeColor="#faad14"
                size="small"
              />
            </div>
            <div>
              <Space>
                <Text>Cancelled</Text>
                <Text strong>{data.bookings.cancelled}</Text>
              </Space>
              <Progress
                percent={(data.bookings.cancelled / data.bookings.total) * 100}
                strokeColor="#f5222d"
                size="small"
              />
            </div>
          </Space>
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card title="User Distribution">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Space>
                <UserOutlined />
                <Text>Pet Sitters</Text>
                <Text strong>{data.users.sitters}</Text>
              </Space>
              <Progress
                percent={(data.users.sitters / data.users.total) * 100}
                strokeColor="#1890ff"
                size="small"
              />
            </div>
            <div>
              <Space>
                <UserOutlined />
                <Text>Pet Owners</Text>
                <Text strong>{data.users.owners}</Text>
              </Space>
              <Progress
                percent={(data.users.owners / data.users.total) * 100}
                strokeColor="#52c41a"
                size="small"
              />
            </div>
          </Space>
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card title="Performance">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Space>
                <TrophyOutlined />
                <Text>Completion Rate</Text>
                <Text strong>{data.performance.completionRate.toFixed(1)}%</Text>
              </Space>
              <Progress
                percent={data.performance.completionRate}
                strokeColor="#722ed1"
                size="small"
              />
            </div>
            <div>
              <Space>
                <Text>Avg Response Time</Text>
                <Text strong>{data.performance.responseTime}h</Text>
              </Space>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

