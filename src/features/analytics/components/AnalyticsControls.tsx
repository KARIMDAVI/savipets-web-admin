/**
 * Analytics Controls Component
 * 
 * Controls for date range, timeframe, refresh, and export.
 */

import React from 'react';
import { Card, Row, Col, Space, Typography, Select, DatePicker } from 'antd';
import { ReloadOutlined, ExportOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Timeframe } from '../types/analytics.types';
import { CompactControlButton } from '@/components/common/CompactControlButton';

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface AnalyticsControlsProps {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
  timeframe: Timeframe;
  isLoading: boolean;
  onDateRangeChange: (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => void;
  onTimeframeChange: (value: Timeframe) => void;
  onRefresh: () => void;
  onExport: () => void;
}

export const AnalyticsControls: React.FC<AnalyticsControlsProps> = ({
  dateRange,
  timeframe,
  isLoading,
  onDateRangeChange,
  onTimeframeChange,
  onRefresh,
  onExport,
}) => {
  return (
    <Card style={{ marginBottom: '24px' }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={8}>
          <Space>
            <Text>Date Range:</Text>
            <RangePicker
              size="small"
              value={dateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  onDateRangeChange([dates[0], dates[1]]);
                } else {
                  onDateRangeChange(null);
                }
              }}
              format="MMM DD, YYYY"
            />
          </Space>
        </Col>
        <Col xs={24} sm={4}>
          <Select
            size="small"
            value={timeframe}
            onChange={onTimeframeChange}
            style={{ width: '100%' }}
          >
            <Option value="daily">Daily</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="monthly">Monthly</Option>
          </Select>
        </Col>
        <Col xs={24} sm={4}>
          <CompactControlButton
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={isLoading}
            title="Refresh"
            aria-label="Refresh"
          />
        </Col>
        <Col xs={24} sm={4}>
          <CompactControlButton
            icon={<ExportOutlined />}
            onClick={onExport}
            disabled={isLoading}
            title="Export"
            aria-label="Export"
          />
        </Col>
      </Row>
    </Card>
  );
};

