/**
 * Settings Tab Component
 * 
 * Displays and manages system settings configuration.
 */

import React from 'react';
import { Card, Button, List, Space, Tag, Typography, Empty } from 'antd';
import {
  SettingOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { SystemSettings } from '../types/system-config.types';

const { Text } = Typography;

interface SettingsTabProps {
  systemSettings: SystemSettings[];
  onAddSetting: () => void;
  onEditSetting: (setting: SystemSettings) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  systemSettings,
  onAddSetting,
  onEditSetting,
}) => {
  return (
    <Card
      title="System Settings"
      extra={
        <Button
          icon={<SettingOutlined />}
          onClick={onAddSetting}
        >
          Add Setting
        </Button>
      }
    >
      <List
        dataSource={systemSettings}
        rowKey={(setting) => setting.key}
        locale={{
          emptyText: (
            <Empty
              description="No system settings have been configured yet."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
        renderItem={(setting) => (
          <List.Item
            actions={[
              <Button 
                key="edit"
                type="text" 
                icon={<EditOutlined />}
                onClick={() => onEditSetting(setting)}
              >
                Edit
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<SettingOutlined />}
              title={
                <Space>
                  <Text strong>{setting.key}</Text>
                  <Tag color="blue">{setting.category}</Tag>
                  <Tag color="green">{setting.type}</Tag>
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">{setting.description}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Value: {JSON.stringify(setting.value)} • 
                    Updated: {new Date(setting.updatedAt).toLocaleDateString()}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

