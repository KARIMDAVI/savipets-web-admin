import React from 'react';
import { Descriptions, Modal, Space, Switch, Tag, Typography } from 'antd';
import type { User } from '@/types';
import { getRoleColor, getRoleDisplayName } from '@/utils/roleUtils';
import SitterMessagingControls from '@/components/features/users/SitterMessagingControls';

const { Text } = Typography;

interface UserDetailModalProps {
  user: User | null;
  open: boolean;
  loading: boolean;
  messagingLoading: boolean;
  onClose: () => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
  onMessagingToggle: (userId: string, allow: boolean) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  open,
  loading,
  messagingLoading,
  onClose,
  onToggleStatus,
  onMessagingToggle,
}) => (
  <Modal
    title="User Details"
    open={open}
    onCancel={onClose}
    footer={null}
    width={800}
    confirmLoading={loading}
  >
    {user && (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Descriptions
          column={2}
          bordered
          size="small"
          extra={
            <Space>
              <Switch
                checked={user.isActive}
                onChange={(checked) => onToggleStatus(user.id, checked)}
              />
              <Text>{user.isActive ? 'Active' : 'Inactive'}</Text>
            </Space>
          }
        >
          <Descriptions.Item label="Name" span={2}>
            {user.firstName} {user.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{user.phoneNumber || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Role">
            <Tag color={getRoleColor(user.role)}>{getRoleDisplayName(user.role)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Rating">
            {user.rating ? `${user.rating.toFixed(1)} ⭐` : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Total Bookings">{user.totalBookings || 0}</Descriptions.Item>
          <Descriptions.Item label="Joined Date">
            {new Date(user.createdAt).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {new Date(user.updatedAt).toLocaleDateString()}
          </Descriptions.Item>
          {user.address && (
            <Descriptions.Item label="Address" span={2}>
              {user.address.street}, {user.address.city}, {user.address.state} {user.address.zipCode}
            </Descriptions.Item>
          )}
          {user.pets && user.pets.length > 0 && (
            <Descriptions.Item label="Pets" span={2}>
              {user.pets.map((pet, index) => (
                <Tag key={index} color="blue">
                  {pet.name} ({pet.species})
                </Tag>
              ))}
            </Descriptions.Item>
          )}
          {user.certifications && user.certifications.length > 0 && (
            <Descriptions.Item label="Certifications" span={2}>
              {user.certifications.map((cert, index) => (
                <Tag key={index} color="green">
                  {cert.name}
                </Tag>
              ))}
            </Descriptions.Item>
          )}
        </Descriptions>

        {user.role === 'petSitter' && (
          <SitterMessagingControls
            enabled={Boolean(user.directMessaging?.allowOwnerChats)}
            loading={messagingLoading}
            onChange={(value) => onMessagingToggle(user.id, value)}
          />
        )}
      </Space>
    )}
  </Modal>
);

export default UserDetailModal;
