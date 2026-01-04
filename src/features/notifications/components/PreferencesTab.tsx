/**
 * Preferences Tab Component
 * 
 * Displays and manages user notification preferences.
 */

import React from 'react';
import { Card, Button, List, Space, Tag, Typography } from 'antd';
import {
  SettingOutlined,
  EditOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { NotificationPreference } from '../types/notifications.types';

const { Text } = Typography;

interface PreferencesTabProps {
  preferences: NotificationPreference[];
  onManagePreferences: () => void;
}

export const PreferencesTab: React.FC<PreferencesTabProps> = ({
  preferences,
  onManagePreferences,
}) => {
  return (
    <Card
      title="User Notification Preferences"
      extra={
        <Button
          icon={<SettingOutlined />}
          onClick={onManagePreferences}
        >
          Manage Preferences
        </Button>
      }
    >
      <List
        dataSource={preferences}
        renderItem={(preference) => (
          <List.Item
            actions={[
              <Button key="edit" type="text" icon={<EditOutlined />}>Edit</Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<UserOutlined />}
              title={
                <Space>
                  <Text strong>{preference.userName}</Text>
                  <Tag color={preference.pushEnabled ? 'green' : 'red'}>
                    Push {preference.pushEnabled ? 'ON' : 'OFF'}
                  </Tag>
                  <Tag color={preference.emailEnabled ? 'green' : 'red'}>
                    Email {preference.emailEnabled ? 'ON' : 'OFF'}
                  </Tag>
                  <Tag color={preference.smsEnabled ? 'green' : 'red'}>
                    SMS {preference.smsEnabled ? 'ON' : 'OFF'}
                  </Tag>
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">
                    Frequency: {preference.frequency} • 
                    Quiet Hours: {preference.quietHours.enabled ? `${preference.quietHours.startTime}-${preference.quietHours.endTime}` : 'Disabled'}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Categories: {Object.entries(preference.categories)
                      .filter(([_, enabled]) => enabled)
                      .map(([category, _]) => category)
                      .join(', ')}
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

