/**
 * Top Sitters Table Component
 * 
 * Displays top performing sitters table.
 */

import React from 'react';
import { Card, Table, Space, Typography, Progress } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import type { TopSitter } from '../types/analytics.types';

const { Text } = Typography;

interface TopSittersTableProps {
  data: TopSitter[];
}

export const TopSittersTable: React.FC<TopSittersTableProps> = ({ data }) => {
  return (
    <Card title="Top Performing Sitters" extra={<TrophyOutlined />}>
      <Table
        dataSource={data}
        columns={[
          {
            title: 'Sitter',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating: number) => (
              <Space>
                <Text>{rating.toFixed(1)}</Text>
                <Text>⭐</Text>
              </Space>
            ),
          },
          {
            title: 'Total Bookings',
            dataIndex: 'bookings',
            key: 'bookings',
          },
          {
            title: 'Completed',
            dataIndex: 'completed',
            key: 'completed',
          },
          {
            title: 'Revenue',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue: number) => `$${revenue.toFixed(2)}`,
          },
          {
            title: 'Completion Rate',
            dataIndex: 'completionRate',
            key: 'completionRate',
            render: (rate: number) => (
              <Progress
                percent={rate}
                size="small"
                strokeColor={rate >= 90 ? '#52c41a' : rate >= 70 ? '#faad14' : '#f5222d'}
              />
            ),
          },
        ]}
        pagination={false}
        size="small"
        rowKey="id"
      />
    </Card>
  );
};

