/**
 * Historical Route Viewer Component
 * 
 * Displays historical routes by sitter, visit, date, and time.
 */

import React, { useState } from 'react';
import { Card, Select, DatePicker, Table, Button, Space, Typography, Empty } from 'antd';
import { EnvironmentOutlined, ExportOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useHistoricalRoutes } from '../hooks/useHistoricalRoutes';
import { exportJSONFile } from '../utils/trackingHelpers';
import type { HistoricalRoute } from '../hooks/useHistoricalRoutes';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface HistoricalRouteViewerProps {
  onRouteSelect?: (route: HistoricalRoute) => void;
}

export const HistoricalRouteViewer: React.FC<HistoricalRouteViewerProps> = ({
  onRouteSelect,
}) => {
  const [selectedSitterId, setSelectedSitterId] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  const {
    routes,
    sitters,
    selectedRoute,
    isLoading,
    selectRoute,
  } = useHistoricalRoutes(
    selectedSitterId,
    dateRange[0]?.toDate(),
    dateRange[1]?.toDate()
  );

  const handleRouteClick = (route: HistoricalRoute) => {
    selectRoute(route);
    onRouteSelect?.(route);
  };

  const handleExportRoute = (route: HistoricalRoute) => {
    const routeData = {
      visitId: route.visitId,
      sitterId: route.sitterId,
      sitterName: route.sitterName,
      clientId: route.clientId,
      visitDate: route.visitDate.toISOString(),
      totalDistance: route.totalDistance,
      routePoints: route.routePoints.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude,
        timestamp: point.timestamp,
        accuracy: point.accuracy,
        speed: point.speed,
        altitude: point.altitude,
      })),
      exportedAt: new Date().toISOString(),
    };

    exportJSONFile(
      routeData,
      `savi-pets-route-${route.visitId.slice(-8)}-${dayjs(route.visitDate).format('YYYY-MM-DD-HHmmss')}.json`
    );
  };

  const columns = [
    {
      title: 'Sitter',
      dataIndex: 'sitterName',
      key: 'sitterName',
    },
    {
      title: 'Date & Time',
      key: 'visitDate',
      render: (record: HistoricalRoute) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(record.visitDate).format('MMM DD, YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(record.visitDate).format('h:mm A')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Route Points',
      key: 'routePoints',
      render: (record: HistoricalRoute) => (
        <Text>{record.routePoints.length} points</Text>
      ),
    },
    {
      title: 'Distance',
      key: 'totalDistance',
      render: (record: HistoricalRoute) => (
        <Text>{record.totalDistance ? `${record.totalDistance.toFixed(2)} km` : 'N/A'}</Text>
      ),
    },
    {
      title: 'Status',
      key: 'isActive',
      render: (record: HistoricalRoute) => (
        <Text type={record.isActive ? 'success' : 'secondary'}>
          {record.isActive ? 'Active' : 'Completed'}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: HistoricalRoute) => (
        <Space>
          <Button
            type="link"
            icon={<EnvironmentOutlined />}
            onClick={() => handleRouteClick(record)}
            size="small"
          >
            View Route
          </Button>
          <Button
            type="link"
            icon={<ExportOutlined />}
            onClick={() => handleExportRoute(record)}
            size="small"
          >
            Export
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={4}>Historical Routes</Title>
        
        <Space>
          <Select
            placeholder="Select Sitter"
            allowClear
            style={{ width: 200 }}
            value={selectedSitterId}
            onChange={setSelectedSitterId}
            options={sitters.map(sitter => ({
              label: `${sitter.firstName} ${sitter.lastName}`,
              value: sitter.id,
            }))}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates || [null, null])}
            format="YYYY-MM-DD"
          />
        </Space>

        {routes.length === 0 && !isLoading ? (
          <Empty description="No routes found" />
        ) : (
          <Table
            dataSource={routes}
            columns={columns}
            loading={isLoading}
            rowKey="visitId"
            pagination={{ pageSize: 10 }}
            onRow={(record) => ({
              onClick: () => handleRouteClick(record),
              style: { cursor: 'pointer' },
            })}
          />
        )}
      </Space>
    </Card>
  );
};

