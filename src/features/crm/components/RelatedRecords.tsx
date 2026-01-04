/**
 * Related Records Component
 * 
 * Displays related records for a client (bookings, pets, etc.).
 */

import React from 'react';
import { Card, List, Tag, Typography, Button, Space, Empty } from 'antd';
import {
  CalendarOutlined,
  EyeOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { User, Booking } from '@/types';

const { Text } = Typography;

interface RelatedRecordsProps {
  client: User;
  bookings: Booking[];
  onViewBooking?: (bookingId: string) => void;
}

export const RelatedRecords: React.FC<RelatedRecordsProps> = ({
  client,
  bookings,
  onViewBooking,
}) => {
  const clientBookings = bookings.filter((b) => b.clientId === client.id);
  const recentBookings = clientBookings
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'cancelled':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <Card title="Related Records">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Recent Bookings */}
        <div>
          <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            Recent Bookings ({clientBookings.length} total)
          </Text>
          {recentBookings.length > 0 ? (
            <List
              size="small"
              dataSource={recentBookings}
              renderItem={(booking) => (
                <List.Item
                  actions={[
                    onViewBooking && (
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => onViewBooking?.(booking.id)}
                      >
                        View
                      </Button>
                    ),
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={<CalendarOutlined />}
                    title={
                      <Space>
                        <Text strong>{booking.serviceType}</Text>
                        <Tag color={getStatusColor(booking.status)}>
                          {booking.status}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">
                          {dayjs(booking.scheduledDate).format('MMM DD, YYYY h:mm A')}
                        </Text>
                        <Text type="secondary">${Number(booking.price).toFixed(2)}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No bookings found" />
          )}
        </div>

        {/* Pets (if available) */}
        {client.pets && client.pets.length > 0 && (
          <div>
            <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              Pets ({client.pets.length})
            </Text>
            <List
              size="small"
              dataSource={client.pets}
              renderItem={(pet: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<HeartOutlined />}
                    title={<Text strong>{pet.name || 'Unnamed Pet'}</Text>}
                    description={
                      <Space>
                        {pet.type && <Tag>{pet.type}</Tag>}
                        {pet.breed && <Text type="secondary">{pet.breed}</Text>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Space>
    </Card>
  );
};

