/**
 * Booking Filters Component
 * 
 * Component for filtering bookings by search, status, service type, and date range.
 */

import React from 'react';
import { Card, Row, Col, Input, Select, DatePicker, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons';
import type { BookingFilters, BookingStatus, ServiceType } from '@/types';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface BookingFiltersProps {
  filters: BookingFilters;
  bookingsCount: number;
  isLoading: boolean;
  onSearch: (value: string) => void;
  onStatusFilter: (value: BookingStatus[]) => void;
  onServiceTypeFilter: (value: ServiceType[]) => void;
  onDateRangeFilter: (dates: [any, any] | null) => void;
  onRefresh: () => void;
  onExport: () => void;
}

export const BookingFiltersComponent: React.FC<BookingFiltersProps> = ({
  filters,
  bookingsCount,
  isLoading,
  onSearch,
  onStatusFilter,
  onServiceTypeFilter,
  onDateRangeFilter,
  onRefresh,
  onExport,
}) => {
  return (
    <Card style={{ marginBottom: '16px' }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={8}>
          <Search
            placeholder="Search bookings, clients, or sitters..."
            onSearch={onSearch}
            style={{ width: '100%' }}
            allowClear
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col xs={24} sm={4}>
          <Select
            placeholder="Status"
            style={{ width: '100%' }}
            mode="multiple"
            onChange={onStatusFilter}
            allowClear
          >
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="scheduled">Scheduled</Option>
            <Option value="active">Active</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
        </Col>
        <Col xs={24} sm={5}>
          <Select
            placeholder="Service Type"
            style={{ width: '100%' }}
            mode="multiple"
            onChange={onServiceTypeFilter}
            allowClear
          >
            <Option value="dog-walking">Dog Walking</Option>
            <Option value="pet-sitting">Pet Sitting</Option>
            <Option value="overnight-care">Overnight Care</Option>
            <Option value="drop-in-visit">Drop-in Visit</Option>
            <Option value="transport">Transport</Option>
          </Select>
        </Col>
        <Col xs={24} sm={7}>
          <RangePicker
            style={{ width: '100%' }}
            onChange={onDateRangeFilter}
            placeholder={['Start Date', 'End Date']}
          />
        </Col>
        <Col xs={24} sm={24}>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={onExport}
              disabled={bookingsCount === 0}
            >
              Export CSV
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};


