/**
 * Expanded Series Row Component
 * 
 * Component for rendering expanded row content for recurring booking series.
 */

import React from 'react';
import { Card, Space, Typography, Tag, Button } from 'antd';

const { Text } = Typography;
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Booking } from '../../types/bookings.types';
import { getStatusColor } from '../../utils/bookingHelpers';
import { formatUserDisplayName } from './bookingTableHelpers';

const { Text: AntText } = Typography;

interface ExpandedSeriesRowProps {
  record: Booking;
  seriesBookings: Booking[];
  getUserName: (userId: string) => string;
  onAssignSitter: (booking: Booking) => void;
}

export const ExpandedSeriesRow: React.FC<ExpandedSeriesRowProps> = ({
  record,
  seriesBookings,
  getUserName,
  onAssignSitter,
}) => {
  if (!record.recurringSeriesId) return null;

  return (
    <div style={{ padding: '16px', background: '#f5f5f5' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Text strong>Recurring Series - All Visits ({seriesBookings.length} total)</Text>
        <Space wrap>
          {seriesBookings.map(booking => (
            <Card
              key={booking.id}
              size="small"
              style={{ width: 200 }}
              title={
                <Space>
                  <Text strong>Visit {booking.visitNumber}</Text>
                  <Tag color={getStatusColor(booking.status)}>
                    {booking.status}
                  </Tag>
                </Space>
              }
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text>
                  <strong>Date:</strong> {dayjs(booking.scheduledDate).format('MMM DD, YYYY h:mm A')}
                </Text>
                <Text>
                  <strong>Sitter:</strong> {
                    booking.sitterId 
                      ? formatUserDisplayName(booking.sitterId, getUserName)
                      : <Text type="secondary">Unassigned</Text>
                  }
                </Text>
                <Button
                  size="small"
                  icon={<UserOutlined />}
                  onClick={() => onAssignSitter(booking)}
                >
                  {booking.sitterId ? 'Change' : 'Assign'} Sitter
                </Button>
              </Space>
            </Card>
          ))}
        </Space>
      </Space>
    </div>
  );
};

