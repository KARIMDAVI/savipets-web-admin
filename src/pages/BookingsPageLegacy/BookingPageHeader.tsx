/**
 * Booking Page Header Component
 * 
 * Header component for the bookings page with title and view mode selector.
 */

import React from 'react';
import { Space, Select, Typography } from 'antd';
import {
  CalendarOutlined,
  TableOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

interface BookingPageHeaderProps {
  viewMode: 'table' | 'calendar' | 'list';
  onViewModeChange: (mode: 'table' | 'calendar' | 'list') => void;
}

export const BookingPageHeader: React.FC<BookingPageHeaderProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, lineHeight: '32px' }}>
            <CalendarOutlined /> Booking Management
          </h2>
          <Text type="secondary" ellipsis={false}>
            Manage all pet care bookings, assignments, and schedules
          </Text>
        </div>
        <Space>
          <Select
            value={viewMode}
            onChange={onViewModeChange}
            style={{ width: 140 }}
          >
            <Option value="table">
              <TableOutlined /> Table View
            </Option>
            <Option value="calendar">
              <CalendarOutlined /> Calendar View
            </Option>
            <Option value="list">
              <UnorderedListOutlined /> List View
            </Option>
          </Select>
        </Space>
      </Space>
    </div>
  );
};


