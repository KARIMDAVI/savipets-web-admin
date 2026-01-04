/**
 * Security Devices List Component
 * 
 * Displays list of security devices.
 */

import React from 'react';
import { Card, List, Button, Space, Tag, Badge, Tooltip, Popconfirm } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import dayjs from 'dayjs';
import type { SecurityDevice } from '../types/security.types';
import { getDeviceIcon, getDeviceTypeColor } from '../utils/securityHelpers';

interface SecurityDevicesListProps {
  devices: SecurityDevice[];
  loading: boolean;
  onAddDevice: () => void;
  onRemoveDevice: (deviceId: string) => void;
}

export const SecurityDevicesList: React.FC<SecurityDevicesListProps> = ({
  devices,
  loading,
  onAddDevice,
  onRemoveDevice,
}) => {
  return (
    <Card
      title="Security Devices"
      extra={
        <Space>
          <Button
            icon={<PlusOutlined />}
            onClick={onAddDevice}
            size="small"
          >
            Add Device
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => message.info('Refreshing devices...')}
            size="small"
          />
        </Space>
      }
    >
      <List
        dataSource={devices}
        renderItem={(device) => (
          <List.Item
            actions={[
              <Tooltip key="remove" title="Remove Device">
                <Popconfirm
                  title="Remove this device?"
                  onConfirm={() => onRemoveDevice(device.id)}
                >
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    danger
                    size="small"
                  />
                </Popconfirm>
              </Tooltip>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Space direction="vertical" align="center">
                  {getDeviceIcon(device.platform)}
                  {device.isDefault && <Badge status="success" />}
                </Space>
              }
              title={
                <Space>
                  <span style={{ fontWeight: 'bold' }}>{device.name}</span>
                  <Tag color={getDeviceTypeColor(device.type)}>
                    {device.type.toUpperCase()}
                  </Tag>
                  {device.isDefault && <Tag color="green">Default</Tag>}
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    Platform: {device.platform}
                  </span>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    Last used: {dayjs(device.lastUsed).format('MMM DD, YYYY')}
                  </span>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

