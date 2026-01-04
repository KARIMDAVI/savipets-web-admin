/**
 * List View Component
 * 
 * Card-based list view for displaying bookings.
 */

import React from 'react';
import { Card, Row, Col, Empty, Space, Tag, Typography } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Booking } from '@/types';
import { formatCurrency } from '@/shared/utils/formatters';
import { getStatusColor, getServiceTypeDisplayName } from '@/features/bookings/utils/bookingHelpers';

const { Text } = Typography;

interface ListViewProps {
  bookings: Booking[];
  getUserName: (userId: string | null | undefined) => string;
  onBookingClick: (bookingId: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  bookings,
  getUserName,
  onBookingClick,
}) => {
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
              onClick={() => onBookingClick(booking.id)}
              style={{ height: '100%' }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Tag color="blue">{getServiceTypeDisplayName(booking.serviceType)}</Tag>
                  <Tag color={getStatusColor(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Tag>
                </div>
                <Text strong ellipsis={false}>#{booking.id.slice(-8)}</Text>
                <Space>
                  <UserOutlined />
                  <Text ellipsis={false}>{(() => {
                    let name = getUserName(booking.clientId);
                    if (name && name.includes('@')) {
                      const emailName = name.split('@')[0];
                      name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
                    }
                    if ((!name || name === 'Unassigned' || name === 'Loading...') && booking.clientName && !booking.clientName.includes('@')) {
                      name = booking.clientName;
                    }
                    return name;
                  })()}</Text>
                </Space>
                <Space>
                  <UserOutlined />
                  <Text type={booking.sitterId ? undefined : 'secondary'} ellipsis={false}>
                    {(() => {
                      if (!booking.sitterId) return 'Unassigned';
                      let name = getUserName(booking.sitterId);
                      if (name && name.includes('@')) {
                        const emailName = name.split('@')[0];
                        name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
                      }
                      return name;
                    })()}
                  </Text>
                </Space>
                <Space>
                  <ClockCircleOutlined />
                  <Text ellipsis={false}>{dayjs(booking.scheduledDate).format('MMM DD, YYYY [at] h:mm A')}</Text>
                </Space>
                <Space>
                  <DollarOutlined />
                  <Text strong ellipsis={false}>{formatCurrency(booking.price)}</Text>
                </Space>
                {booking.pets && booking.pets.length > 0 && (
                  <Space wrap>
                    <Text type="secondary" ellipsis={false}>Pets: </Text>
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


