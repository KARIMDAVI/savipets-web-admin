/**
 * Feature Flags Tab Component
 * 
 * Displays and manages feature flags configuration.
 */

import React from 'react';
import { Card, Button, List, Space, Tag, Typography } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FlagOutlined,
} from '@ant-design/icons';
import type { FeatureFlag } from '../types/system-config.types';
import dayjs from 'dayjs';

const { Text } = Typography;

interface FeatureFlagsTabProps {
  featureFlags: FeatureFlag[];
  onAddFeatureFlag: () => void;
  onEditFeatureFlag: (flag: FeatureFlag) => void;
}

export const FeatureFlagsTab: React.FC<FeatureFlagsTabProps> = ({
  featureFlags,
  onAddFeatureFlag,
  onEditFeatureFlag,
}) => {
  return (
    <Card
      title="Feature Flags"
      extra={
        <Button
          icon={<PlusOutlined />}
          onClick={onAddFeatureFlag}
          type="primary"
        >
          Add Feature Flag
        </Button>
      }
    >
      <List
        dataSource={featureFlags}
        renderItem={(feature) => (
          <List.Item
            actions={[
              <Button 
                key="view"
                type="text" 
                icon={<EyeOutlined />}
              >
                View
              </Button>,
              <Button 
                key="edit"
                type="text" 
                icon={<EditOutlined />}
                onClick={() => onEditFeatureFlag(feature)}
              >
                Edit
              </Button>,
              <Button 
                key="delete"
                type="text" 
                icon={<DeleteOutlined />} 
                danger
              >
                Delete
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<FlagOutlined />}
              title={
                <Space>
                  <Text strong>{feature.name}</Text>
                  <Tag color={feature.isEnabled ? 'green' : 'red'}>
                    {feature.isEnabled ? 'ENABLED' : 'DISABLED'}
                  </Tag>
                  <Tag color="blue">{feature.rolloutPercentage}%</Tag>
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">{feature.description}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Key: {feature.key} • 
                    Rollout: {feature.rolloutPercentage}% • 
                    Updated: {dayjs(feature.updatedAt).format('MMM DD, YYYY')}
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

