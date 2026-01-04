/**
 * Pricing Tab Component
 * 
 * Displays and manages pricing tiers configuration.
 */

import React from 'react';
import { Card, Button, List, Space, Tag, Badge, Typography } from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import type { PricingTier } from '../types/system-config.types';

const { Text } = Typography;

interface PricingTabProps {
  pricingTiers: PricingTier[];
  onAddPricing: () => void;
  onViewPricing: (pricing: PricingTier) => void;
}

export const PricingTab: React.FC<PricingTabProps> = ({
  pricingTiers,
  onAddPricing,
  onViewPricing,
}) => {
  return (
    <Card
      title="Pricing Tiers"
      extra={
        <Button
          icon={<PlusOutlined />}
          onClick={onAddPricing}
          type="primary"
        >
          Add Pricing Tier
        </Button>
      }
    >
      <List
        dataSource={pricingTiers}
        renderItem={(pricing) => (
          <List.Item
            actions={[
              <Button 
                key="view"
                type="text" 
                icon={<EyeOutlined />}
                onClick={() => onViewPricing(pricing)}
              >
                View
              </Button>,
              <Button key="edit" type="text" icon={<EditOutlined />}>
                Edit
              </Button>,
              <Button key="delete" type="text" icon={<DeleteOutlined />} danger>
                Delete
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<DollarOutlined />}
              title={
                <Space>
                  <Text strong>{pricing.name}</Text>
                  <Tag color="blue">${pricing.price}</Tag>
                  <Badge 
                    status={pricing.isActive ? 'success' : 'default'} 
                    text={pricing.isActive ? 'Active' : 'Inactive'} 
                  />
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">{pricing.description}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Duration: {pricing.duration} min • 
                    Min Pets: {pricing.conditions.minPets || 'N/A'} • 
                    Max Pets: {pricing.conditions.maxPets || 'N/A'}
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

