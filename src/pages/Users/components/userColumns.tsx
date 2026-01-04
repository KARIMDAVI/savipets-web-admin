import React from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Avatar, Badge, Button, Space, Tag, Tooltip, Typography } from 'antd';
import {
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  UserSwitchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { User } from '@/types';
import { getRoleColor, getRoleDisplayName } from '@/utils/roleUtils';

const { Text } = Typography;

export interface UserColumnOptions {
  onView: (user: User) => void;
  onRoleChange: (user: User) => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
  onDelete: (user: User) => void;
}

const deriveDisplayName = (email?: string): string => {
  if (!email) {
    return 'User';
  }
  const localPart = email.split('@')[0] ?? '';
  if (!localPart) {
    return 'User';
  }
  return localPart
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
};

export const buildUserColumns = ({
  onView,
  onRoleChange,
  onToggleStatus,
  onDelete,
}: UserColumnOptions): ColumnsType<User> => [
  {
    title: 'User',
    key: 'user',
    render: (record: User) => {
      const firstName = (record.firstName || '').trim();
      const lastName = (record.lastName || '').trim();
      const fullName = [firstName, lastName].filter(Boolean).join(' ');
      const displayName = fullName.length > 0 ? fullName : deriveDisplayName(record.email);

      return (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} src={record.profileImage} />
          <div>
            <Text strong>{displayName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      );
    },
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    render: (role: string) => (
      <Tag color={getRoleColor(role)}>{getRoleDisplayName(role)}</Tag>
    ),
    filters: [
      { text: 'Admin', value: 'admin' },
      { text: 'Pet Sitter', value: 'petSitter' },
      { text: 'Pet Owner', value: 'petOwner' },
    ],
  },
  {
    title: 'Status',
    dataIndex: 'isActive',
    key: 'isActive',
    render: (isActive: boolean) => (
      <Badge status={isActive ? 'success' : 'error'} text={isActive ? 'Active' : 'Inactive'} />
    ),
    filters: [
      { text: 'Active', value: true },
      { text: 'Inactive', value: false },
    ],
  },
  {
    title: 'Direct Messaging',
    key: 'directMessaging',
    render: (record: User) => {
      if (record.role !== 'petSitter') {
        return <Text type="secondary">N/A</Text>;
      }
      const enabled = Boolean(record.directMessaging?.allowOwnerChats);
      return (
        <Badge status={enabled ? 'processing' : 'default'} text={enabled ? 'Enabled' : 'Disabled'} />
      );
    },
  },
  {
    title: 'Rating',
    dataIndex: 'rating',
    key: 'rating',
    render: (rating: number) => (
      <Space>
        <Text>{rating ? rating.toFixed(1) : 'N/A'}</Text>
        {rating && <Text type="secondary">⭐</Text>}
      </Space>
    ),
  },
  {
    title: 'Total Bookings',
    dataIndex: 'totalBookings',
    key: 'totalBookings',
    render: (value: number) => value || 0,
  },
  {
    title: 'Joined',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (date: Date) => new Date(date).toLocaleDateString(),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (record: User) => (
      <Space>
        <Tooltip title="View Details">
          <Button type="text" icon={<EyeOutlined />} onClick={() => onView(record)} />
        </Tooltip>
        <Tooltip title="Change Role">
          <Button type="text" icon={<UserSwitchOutlined />} onClick={() => onRoleChange(record)} />
        </Tooltip>
        <Tooltip title={record.isActive ? 'Deactivate' : 'Activate'}>
          <Button
            type="text"
            icon={record.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            onClick={() => onToggleStatus(record.id, !record.isActive)}
            style={{
              borderRadius: '4px',
              color: record.isActive ? '#52c41a' : '#8c8c8c',
            }}
          />
        </Tooltip>
        <Tooltip title="Delete User">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record)}
          />
        </Tooltip>
      </Space>
    ),
  },
];
