/**
 * Clients Table Component
 * 
 * Displays clients in a table format with filtering.
 * Optimized with virtual scrolling and memoization for performance.
 */

import React, { useMemo, useCallback } from 'react';
import { Table, Space, Avatar, Tag, Badge, Button, Tooltip, Typography, Skeleton } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import {
  UserOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { User, Booking } from '@/types';
import type { ClientSegment } from '../types/crm.types';
import { getClientStats, getClientSegment } from '../utils/crmHelpers';
import { shouldUseVirtualScrolling, calculateOptimalPageSize } from '../utils/performanceUtils';

const { Text } = Typography;

interface ClientsTableProps {
  clients: User[];
  bookings: Booking[];
  segments: ClientSegment[];
  loading: boolean;
  onViewClient: (clientId: string) => void;
  onAddNote: (client: User) => void;
  pagination?: false | TablePaginationConfig;
  rowSelection?: Parameters<typeof Table<User>>[0]['rowSelection'];
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  bookings,
  segments,
  loading,
  onViewClient,
  onAddNote,
  pagination,
  rowSelection,
}) => {
  // Memoize client stats cache for performance
  const clientStatsCache = useMemo(() => {
    const cache = new Map<string, ReturnType<typeof getClientStats>>();
    clients.forEach((client) => {
      if (!cache.has(client.id)) {
        cache.set(client.id, getClientStats(client.id, bookings));
      }
    });
    return cache;
  }, [clients, bookings]);

  // Memoize segment calculations
  const segmentCache = useMemo(() => {
    const cache = new Map<string, string>();
    clients.forEach((client) => {
      if (!cache.has(client.id)) {
        cache.set(client.id, getClientSegment(client.id, bookings, segments, client));
      }
    });
    return cache;
  }, [clients, bookings, segments]);

  // Determine if virtual scrolling should be used
  const useVirtual = shouldUseVirtualScrolling(clients.length, 50);
  const optimalPageSize = useMemo(() => calculateOptimalPageSize(50), []);

  // Memoize callbacks to prevent re-renders
  const handleViewClient = useCallback((clientId: string) => {
    onViewClient(clientId);
  }, [onViewClient]);

  const handleAddNote = useCallback((client: User) => {
    onAddNote(client);
  }, [onAddNote]);

  // Memoize columns to prevent re-renders
  const columns = useMemo(() => [
    {
      title: 'Client',
      key: 'client',
      fixed: 'left' as const,
      width: 200,
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
      title: 'Segment',
      key: 'segment',
      width: 120,
      render: (record: User) => {
        const segment = segmentCache.get(record.id) || getClientSegment(record.id, bookings, segments, record);
        const color = segment === 'VIP Clients' ? 'gold' :
                     segment === 'At Risk' ? 'red' : 
                     segment === 'New Clients' ? 'green' : 'blue';
        return <Tag color={color}>{segment}</Tag>;
      },
    },
    {
      title: 'Total Bookings',
      key: 'bookings',
      width: 120,
      sorter: (a: User, b: User) => {
        const statsA = clientStatsCache.get(a.id) || getClientStats(a.id, bookings);
        const statsB = clientStatsCache.get(b.id) || getClientStats(b.id, bookings);
        return statsA.totalBookings - statsB.totalBookings;
      },
      render: (record: User) => {
        const stats = clientStatsCache.get(record.id) || getClientStats(record.id, bookings);
        return <Badge count={stats.totalBookings} showZero color="blue" />;
      },
    },
    {
      title: 'Total Spent',
      key: 'spent',
      width: 120,
      sorter: (a: User, b: User) => {
        const statsA = clientStatsCache.get(a.id) || getClientStats(a.id, bookings);
        const statsB = clientStatsCache.get(b.id) || getClientStats(b.id, bookings);
        return statsA.totalSpent - statsB.totalSpent;
      },
      render: (record: User) => {
        const stats = clientStatsCache.get(record.id) || getClientStats(record.id, bookings);
        return <Text strong>${stats.totalSpent.toFixed(2)}</Text>;
      },
    },
    {
      title: 'Last Booking',
      key: 'lastBooking',
      width: 150,
      sorter: (a: User, b: User) => {
        const statsA = clientStatsCache.get(a.id) || getClientStats(a.id, bookings);
        const statsB = clientStatsCache.get(b.id) || getClientStats(b.id, bookings);
        const dateA = statsA.lastBooking ? new Date(statsA.lastBooking).getTime() : 0;
        const dateB = statsB.lastBooking ? new Date(statsB.lastBooking).getTime() : 0;
        return dateA - dateB;
      },
      render: (record: User) => {
        const stats = clientStatsCache.get(record.id) || getClientStats(record.id, bookings);
        return stats.lastBooking ? (
          <Text type="secondary">
            {dayjs(stats.lastBooking).format('MMM DD, YYYY')}
          </Text>
        ) : (
          <Text type="secondary">Never</Text>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 120,
      render: (record: User) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewClient(record.id)}
            />
          </Tooltip>
          <Tooltip title="Add Note">
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={() => handleAddNote(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ], [clientStatsCache, segmentCache, bookings, segments, handleViewClient, handleAddNote]);

  // Configure pagination with optimal page size
  const tablePagination: TablePaginationConfig | false = pagination !== undefined
    ? pagination
    : {
        pageSize: useVirtual ? optimalPageSize : 20,
        showSizeChanger: true,
        showQuickJumper: !useVirtual,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} clients`,
        pageSizeOptions: ['10', '20', '50', '100'],
      };

  return (
    <Table
      columns={columns}
      dataSource={clients}
      loading={{
        spinning: loading,
        indicator: <Skeleton active paragraph={{ rows: 5 }} />,
      }}
      rowKey="id"
      rowSelection={rowSelection}
      pagination={tablePagination}
      scroll={{
        x: 'max-content',
        y: useVirtual ? 600 : undefined, // Enable virtual scrolling with fixed height
      }}
      virtual={useVirtual} // Enable Ant Design virtual scrolling for large lists
      size="middle"
    />
  );
};
