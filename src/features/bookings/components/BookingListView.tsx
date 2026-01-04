/**
 * Booking List View Component
 * 
 * Displays bookings in a card-based list format.
 */

import React from 'react';
import { Card, Row, Col, Empty, Space, Tag, Typography } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Booking } from '../types/bookings.types';
import { formatCurrency } from '@/shared/utils/formatters';
import { getStatusColor, getServiceTypeDisplayName } from '../utils/bookingHelpers';

const { Text } = Typography;

interface BookingListViewProps {
  bookings: Booking[];
  getUserName: (userId: string) => string;
  onViewBooking: (bookingId: string) => void;
}

export const BookingListView: React.FC<BookingListViewProps> = ({
  bookings,
  getUserName,
  onViewBooking,
}) => {
  const formatUserName = (name: string | undefined, fallback?: string): string => {
    if (!name || name === 'Unassigned' || name === 'Loading...') {
      return fallback || 'Unknown';
    }
    if (name.includes('@')) {
      const emailName = name.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return name;
  };

  if (bookings.length === 0) {
    return (
      <Card>
        <Empty description="No bookings found" />
      </Card>
    );
  }

  return (
    <Card>
      <Row gutter={[16, 16]}>
        {bookings.map(booking => (
          <Col xs={24} sm={12} lg={8} key={booking.id}>
            <Card
              hoverable
              onClick={() => onViewBooking(booking.id)}
              style={{ height: '100%' }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Tag color="blue">{getServiceTypeDisplayName(booking.serviceType)}</Tag>
                  <Tag color={getStatusColor(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Tag>
                </div>
                <Text strong>#{booking.id.slice(-8)}</Text>
                <Space>
                  <UserOutlined />
                  <Text>
                    {formatUserName(
                      getUserName(booking.clientId),
                      booking.clientName
                    )}
                  </Text>
                </Space>
                <Space>
                  <UserOutlined />
                  <Text type={booking.sitterId ? undefined : 'secondary'}>
                    {booking.sitterId
                      ? formatUserName(getUserName(booking.sitterId))
                      : 'Unassigned'}
                  </Text>
                </Space>
                <Space>
                  <ClockCircleOutlined />
                  <Text>{dayjs(booking.scheduledDate).format('MMM DD, YYYY [at] h:mm A')}</Text>
                </Space>
                <Space>
                  <DollarOutlined />
                  <Text strong>{formatCurrency(booking.price)}</Text>
                </Space>
                {booking.pets && booking.pets.length > 0 && (
                  <Space wrap>
                    <Text type="secondary">Pets: </Text>
                    {booking.pets.map((pet, index) => (
                      <Tag key={index} color="purple">
                        {pet}
                      </Tag>
                    ))}
                  </Space>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

