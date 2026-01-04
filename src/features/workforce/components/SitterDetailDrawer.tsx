/**
 * Sitter Detail Drawer Component
 * 
 * Displays detailed information about a sitter.
 */

import React from 'react';
import { Drawer, Card, Descriptions, Badge, Row, Col, Statistic, List, Tag, Space, Typography } from 'antd';
import {
  CalendarOutlined,
  StarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { User } from '@/types';
import type { SitterPerformance, SitterCertification, SitterAvailability } from '../types/workforce.types';

const { Text } = Typography;

interface SitterDetailDrawerProps {
  sitter: User | null;
  visible: boolean;
  performance: SitterPerformance | undefined;
  certifications: SitterCertification[];
  availability: SitterAvailability[];
  onClose: () => void;
}

export const SitterDetailDrawer: React.FC<SitterDetailDrawerProps> = ({
  sitter,
  visible,
  performance,
  certifications,
  availability,
  onClose,
}) => {
  if (!sitter) return null;

  return (
    <Drawer
      title={`Sitter Details: ${sitter.firstName} ${sitter.lastName}`}
      placement="right"
      onClose={onClose}
      open={visible}
      width={800}
    >
      {/* Sitter Info */}
      <Card title="Sitter Information" style={{ marginBottom: '16px' }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Name">
            {sitter.firstName} {sitter.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {sitter.email}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {sitter.phoneNumber || 'Not provided'}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Badge status={sitter.isActive ? 'success' : 'error'} text={sitter.isActive ? 'Active' : 'Inactive'} />
          </Descriptions.Item>
          <Descriptions.Item label="Member Since">
            {dayjs(sitter.createdAt).format('MMMM DD, YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Last Active">
            {dayjs(sitter.lastLoginAt).format('MMMM DD, YYYY')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Performance Stats */}
      <Card title="Performance Statistics" style={{ marginBottom: '16px' }}>
        {!performance ? (
          <Text type="secondary">No performance data available</Text>
        ) : (
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Statistic
                title="Total Bookings"
                value={performance.totalBookings}
                prefix={<CalendarOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Completion Rate"
                value={performance.completionRate}
                suffix="%"
                precision={1}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Avg Rating"
                value={performance.averageRating}
                precision={1}
                prefix={<StarOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Total Revenue"
                value={performance.totalRevenue}
                prefix="$"
                precision={2}
              />
            </Col>
          </Row>
        )}
      </Card>

      {/* Certifications */}
      <Card title="Certifications" style={{ marginBottom: '16px' }}>
        <List
          dataSource={certifications}
          renderItem={(cert) => (
            <List.Item>
              <List.Item.Meta
                avatar={<CheckCircleOutlined style={{ color: cert.status === 'active' ? '#52c41a' : '#f5222d' }} />}
                title={
                  <Space>
                    <Text strong>{cert.name}</Text>
                    <Tag color={cert.status === 'active' ? 'green' : 'red'}>
                      {cert.status}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">{cert.issuingOrganization}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Issued: {dayjs(cert.issuedDate).format('MMM DD, YYYY')}
                      {cert.expiryDate && ` • Expires: ${dayjs(cert.expiryDate).format('MMM DD, YYYY')}`}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Availability */}
      <Card title="Weekly Availability">
        <List
          dataSource={availability}
          renderItem={(avail) => (
            <List.Item>
              <List.Item.Meta
                avatar={<CalendarOutlined />}
                title={
                  <Space>
                    <Text strong>{dayjs().day(avail.dayOfWeek).format('dddd')}</Text>
                    <Tag color={avail.isAvailable ? 'green' : 'red'}>
                      {avail.isAvailable ? 'Available' : 'Unavailable'}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">
                      {avail.startTime} - {avail.endTime}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Max {avail.maxBookings} bookings • {avail.serviceTypes.join(', ')}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </Drawer>
  );
};

