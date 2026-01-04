/**
 * Sitters Table Component
 * 
 * Displays sitters in a table with performance metrics.
 */

import React from 'react';
import { Card, Table, Space, Avatar, Typography, Badge, Tooltip, Button, Rate, Progress, Tag } from 'antd';
import {
  UserOutlined,
  EyeOutlined,
  CalendarOutlined,
  PlusOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import type { User } from '@/types';
import type { SitterPerformance, SitterCertification } from '../types/workforce.types';
import { getPerformanceColor, getRatingColor } from '../utils/workforceHelpers';

const { Text } = Typography;

interface SittersTableProps {
  sitters: User[];
  filteredSitters: User[];
  loading: boolean;
  sitterPerformance: SitterPerformance[];
  sitterCertifications: SitterCertification[];
  getSitterPerformance: (sitterId: string) => SitterPerformance | undefined;
  getSitterCertifications: (sitterId: string) => SitterCertification[];
  onViewSitter: (sitterId: string) => void;
  onManageAvailability: (sitter: User) => void;
  onCreateSchedule: (sitter: User) => void;
}

export const SittersTable: React.FC<SittersTableProps> = ({
  sitters,
  filteredSitters,
  loading,
  sitterPerformance,
  sitterCertifications,
  getSitterPerformance,
  getSitterCertifications,
  onViewSitter,
  onManageAvailability,
  onCreateSchedule,
}) => {
  const columns = [
    {
      title: 'Sitter',
      key: 'sitter',
      render: (record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{record.firstName} {record.lastName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (record: User) => {
        const performance = getSitterPerformance(record.id);
        if (!performance) return <Text type="secondary">No data</Text>;
        
        return (
          <Space direction="vertical" size={0}>
            <Space>
              <Rate disabled value={performance.averageRating} style={{ fontSize: '12px' }} />
              <Text style={{ fontSize: '12px' }}>{performance.averageRating}</Text>
            </Space>
            <Progress
              percent={performance.completionRate}
              strokeColor={getPerformanceColor(performance.completionRate)}
              size="small"
              format={(percent) => `${percent?.toFixed(1)}%`}
            />
          </Space>
        );
      },
    },
    {
      title: 'Bookings',
      key: 'bookings',
      render: (record: User) => {
        const performance = getSitterPerformance(record.id);
        if (!performance) return <Text type="secondary">0</Text>;
        
        return (
          <Space direction="vertical" size={0}>
            <Text strong>{performance.totalBookings}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {performance.completedBookings} completed
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Revenue',
      key: 'revenue',
      render: (record: User) => {
        const performance = getSitterPerformance(record.id);
        if (!performance) return <Text type="secondary">$0</Text>;
        
        return (
          <Space direction="vertical" size={0}>
            <Text strong>${performance.totalRevenue.toFixed(2)}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Avg: ${(performance.totalRevenue / performance.totalBookings).toFixed(2)}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Response Time',
      key: 'responseTime',
      render: (record: User) => {
        const performance = getSitterPerformance(record.id);
        if (!performance) return <Text type="secondary">N/A</Text>;
        
        return (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {performance.responseTime} min
          </Text>
        );
      },
    },
    {
      title: 'Certifications',
      key: 'certifications',
      render: (record: User) => {
        const certifications = getSitterCertifications(record.id);
        const activeCerts = certifications.filter(c => c.status === 'active').length;
        
        return (
          <Space>
            <Badge count={activeCerts} showZero color="blue" />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {certifications.length} total
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: User) => (
        <Badge 
          status={record.isActive ? 'success' : 'error'} 
          text={record.isActive ? 'Active' : 'Inactive'} 
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onViewSitter(record.id)}
            />
          </Tooltip>
          <Tooltip title="Manage Availability">
            <Button
              type="text"
              icon={<CalendarOutlined />}
              onClick={() => onManageAvailability(record)}
            />
          </Tooltip>
          <Tooltip title="Create Schedule">
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={() => onCreateSchedule(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Table
        columns={columns}
        dataSource={filteredSitters}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} sitters`,
        }}
        scroll={{ x: 'max-content' }} // Mobile-friendly horizontal scroll
      />
    </Card>
  );
};

