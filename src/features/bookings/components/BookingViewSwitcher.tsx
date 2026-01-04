/**
 * BookingViewSwitcher Component
 * 
 * Component for switching between table, calendar, and list views.
 * Extracted from BookingsPageRefactored for reusability.
 */

import React from 'react';
import { Select, Space } from 'antd';
import { TableOutlined, CalendarOutlined, UnorderedListOutlined } from '@ant-design/icons';
import type { BookingViewMode } from '../types/bookings.types';

const { Option } = Select;

interface BookingViewSwitcherProps {
  viewMode: BookingViewMode;
  onChange: (mode: BookingViewMode) => void;
}

export const BookingViewSwitcher: React.FC<BookingViewSwitcherProps> = ({
  viewMode,
  onChange,
}) => {
  return (
    <Select
      value={viewMode}
      onChange={onChange}
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
  );
};

