/**
 * BookingFilters Component
 * 
 * Filter UI for the bookings page.
 * Extracted from BookingsPageRefactored for reusability and testability.
 */

import React from 'react';
import { Card, Row, Col, Input, Select, DatePicker, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons';
import type { BookingFilters, BookingStatus, ServiceType } from '../types/bookings.types';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface BookingFiltersProps {
  filters: BookingFilters;
  onFiltersChange: (filters: BookingFilters) => void;
  onRefresh: () => void;
  onExport: () => void;
  isLoading?: boolean;
  bookingsCount?: number;
}

export const BookingFiltersComponent: React.FC<BookingFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  onExport,
  isLoading = false,
  bookingsCount = 0,
}) => {
  const handleSearch = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusFilter = (value: BookingStatus[]) => {
    onFiltersChange({ ...filters, status: value });
  };

  const handleServiceTypeFilter = (value: ServiceType[]) => {
    onFiltersChange({ ...filters, serviceType: value });
  };

  const handleDateRangeFilter = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      onFiltersChange({
        ...filters,
        dateRange: {
          start: dates[0]!.toDate(),
          end: dates[1]!.toDate(),
        },
      });
    } else {
      onFiltersChange({ ...filters, dateRange: undefined });
    }
  };

  return (
    <Card style={{ marginBottom: '16px' }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={8}>
          <Search
            placeholder="Search bookings, clients, or sitters..."
            onSearch={handleSearch}
            style={{ width: '100%' }}
            allowClear
            prefix={<SearchOutlined />}
            defaultValue={filters.search}
          />
        </Col>
        <Col xs={24} sm={4}>
          <Select
            placeholder="Status"
            style={{ width: '100%' }}
            mode="multiple"
            onChange={handleStatusFilter}
            allowClear
            value={filters.status}
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
            onChange={handleServiceTypeFilter}
            allowClear
            value={filters.serviceType}
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
            onChange={handleDateRangeFilter}
            placeholder={['Start Date', 'End Date']}
            value={
              filters.dateRange
                ? [dayjs(filters.dateRange.start), dayjs(filters.dateRange.end)]
                : null
            }
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

