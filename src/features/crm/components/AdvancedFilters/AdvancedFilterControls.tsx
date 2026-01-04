import React from 'react';
import { Row, Col, Select, DatePicker, InputNumber, Switch, Space } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import type { ClientFilters, DateField } from '../../types/filters.types';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface AdvancedFilterControlsProps {
  filters: ClientFilters;
  onDateRangeChange: (dates: [Dayjs | null, Dayjs | null] | null, field: DateField) => void;
  onRevenueRangeChange: (min: number | null, max: number | null) => void;
  onBookingCountRangeChange: (min: number | null, max: number | null) => void;
  onRatingRangeChange: (min: number | null, max: number | null) => void;
  onActiveStatusChange: (checked: boolean) => void;
}

export const AdvancedFilterControls: React.FC<AdvancedFilterControlsProps> = ({
  filters,
  onDateRangeChange,
  onRevenueRangeChange,
  onBookingCountRangeChange,
  onRatingRangeChange,
  onActiveStatusChange,
}) => {
  return (
    <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
      <Col xs={24} sm={12} md={6}>
        <div style={{ marginBottom: '8px' }}>Date Range</div>
        <Select
          placeholder="Select date field"
          value={filters.dateRange?.field}
          onChange={(field: DateField) => {
            if (filters.dateRange) {
              onDateRangeChange(
                [
                  dayjs(filters.dateRange.start),
                  dayjs(filters.dateRange.end),
                ],
                field
              );
            }
          }}
          style={{ width: '100%', marginBottom: '8px' }}
        >
          <Option value="createdAt">Account Created</Option>
          <Option value="lastBooking">Last Booking</Option>
          <Option value="lastContact">Last Contact</Option>
        </Select>
        {filters.dateRange && (
          <RangePicker
            value={[
              dayjs(filters.dateRange.start),
              dayjs(filters.dateRange.end),
            ]}
            onChange={(dates) => {
              if (filters.dateRange) {
                onDateRangeChange(dates, filters.dateRange.field);
              }
            }}
            style={{ width: '100%' }}
          />
        )}
      </Col>
      <Col xs={24} sm={12} md={6}>
        <div style={{ marginBottom: '8px' }}>Revenue Range</div>
        <Space>
          <InputNumber
            placeholder="Min"
            prefix="$"
            value={filters.revenueRange?.min}
            onChange={(value) =>
              onRevenueRangeChange(value, filters.revenueRange?.max ?? null)
            }
            style={{ width: '100%' }}
          />
          <span>-</span>
          <InputNumber
            placeholder="Max"
            prefix="$"
            value={filters.revenueRange?.max}
            onChange={(value) =>
              onRevenueRangeChange(filters.revenueRange?.min ?? null, value)
            }
            style={{ width: '100%' }}
          />
        </Space>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <div style={{ marginBottom: '8px' }}>Booking Count</div>
        <Space>
          <InputNumber
            placeholder="Min"
            value={filters.bookingCountRange?.min}
            onChange={(value) =>
              onBookingCountRangeChange(
                value,
                filters.bookingCountRange?.max ?? null
              )
            }
            style={{ width: '100%' }}
          />
          <span>-</span>
          <InputNumber
            placeholder="Max"
            value={filters.bookingCountRange?.max}
            onChange={(value) =>
              onBookingCountRangeChange(
                filters.bookingCountRange?.min ?? null,
                value
              )
            }
            style={{ width: '100%' }}
          />
        </Space>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <div style={{ marginBottom: '8px' }}>Rating Range</div>
        <Space>
          <InputNumber
            placeholder="Min"
            min={0}
            max={5}
            step={0.1}
            value={filters.ratingRange?.min}
            onChange={(value) =>
              onRatingRangeChange(value, filters.ratingRange?.max ?? null)
            }
            style={{ width: '100%' }}
          />
          <span>-</span>
          <InputNumber
            placeholder="Max"
            min={0}
            max={5}
            step={0.1}
            value={filters.ratingRange?.max}
            onChange={(value) =>
              onRatingRangeChange(filters.ratingRange?.min ?? null, value)
            }
            style={{ width: '100%' }}
          />
        </Space>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <div style={{ marginBottom: '8px' }}>Account Status</div>
        <Switch
          checkedChildren="Active"
          unCheckedChildren="All"
          checked={filters.isActive === true}
          onChange={onActiveStatusChange}
        />
      </Col>
    </Row>
  );
};

