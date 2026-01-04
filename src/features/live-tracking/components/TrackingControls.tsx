/**
 * Tracking Controls Component
 * 
 * Controls for map refresh, style, and auto-refresh settings.
 */

import React from 'react';
import { Card, Row, Col, Space, Switch, Select, Typography } from 'antd';
import {
  ReloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { CompactControlButton } from '@/components/common/CompactControlButton';

const { Option } = Select;
const { Text } = Typography;

interface TrackingControlsProps {
  autoRefresh: boolean;
  refreshInterval: number;
  mapStyle: string;
  isLoading: boolean;
  onAutoRefreshChange: (value: boolean) => void;
  onRefreshIntervalChange: (value: number) => void;
  onMapStyleChange: (value: string) => void;
  onRefresh: () => void;
}

export const TrackingControls: React.FC<TrackingControlsProps> = ({
  autoRefresh,
  refreshInterval,
  mapStyle,
  isLoading,
  onAutoRefreshChange,
  onRefreshIntervalChange,
  onMapStyleChange,
  onRefresh,
}) => {
  return (
    <Card style={{ marginBottom: '16px' }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={6}>
          <Space>
            <Text>Auto Refresh:</Text>
            <Switch
              size="small"
              checked={autoRefresh}
              onChange={onAutoRefreshChange}
              checkedChildren={<PlayCircleOutlined />}
              unCheckedChildren={<PauseCircleOutlined />}
            />
          </Space>
        </Col>
        <Col xs={24} sm={4}>
          <Select
            size="small"
            value={refreshInterval}
            onChange={onRefreshIntervalChange}
            style={{ width: '100%' }}
            disabled={!autoRefresh}
          >
            <Option value={10}>10 seconds</Option>
            <Option value={30}>30 seconds</Option>
            <Option value={60}>1 minute</Option>
            <Option value={300}>5 minutes</Option>
          </Select>
        </Col>
        <Col xs={24} sm={4}>
          <Select
            size="small"
            value={mapStyle}
            onChange={onMapStyleChange}
            style={{ width: '100%' }}
          >
            <Option value="mapbox://styles/mapbox/streets-v12">Streets</Option>
            <Option value="mapbox://styles/mapbox/satellite-v9">Satellite</Option>
            <Option value="mapbox://styles/mapbox/light-v11">Light</Option>
            <Option value="mapbox://styles/mapbox/dark-v11">Dark</Option>
          </Select>
        </Col>
        <Col xs={24} sm={4}>
          <CompactControlButton
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={isLoading}
            title="Refresh Now"
            aria-label="Refresh Now"
          />
        </Col>
        <Col xs={24} sm={6}>
          <Text type="secondary">
            Last updated: {dayjs().format('h:mm:ss A')}
          </Text>
        </Col>
      </Row>
    </Card>
  );
};

