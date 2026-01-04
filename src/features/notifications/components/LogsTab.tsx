/**
 * Logs Tab Component
 * 
 * Displays notification delivery logs.
 */

import React from 'react';
import { Card, Table, Tag, Space, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { NotificationLog } from '../types/notifications.types';
import { getTypeIcon, getTypeColor, getStatusColor } from '../utils/notificationHelpers';

const { Text } = Typography;

interface LogsTabProps {
  notificationLogs: NotificationLog[];
  loading: boolean;
}

export const LogsTab: React.FC<LogsTabProps> = ({
  notificationLogs,
  loading,
}) => {
  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record: NotificationLog) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <Text>{record.userName}</Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)} icon={getTypeIcon(type)}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Template',
      dataIndex: 'templateName',
      key: 'templateName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Sent At',
      dataIndex: 'sentAt',
      key: 'sentAt',
      render: (sentAt: Date) => dayjs(sentAt).format('MMM DD, YYYY HH:mm'),
    },
    {
      title: 'Device',
      dataIndex: 'deviceInfo',
      key: 'deviceInfo',
      render: (deviceInfo: string) => deviceInfo || 'N/A',
    },
  ];

  return (
    <Card title="Notification Logs">
      <Table
        columns={columns}
        dataSource={notificationLogs}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} logs`,
        }}
        scroll={{ x: 800 }}
      />
    </Card>
  );
};

