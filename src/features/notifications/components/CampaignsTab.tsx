/**
 * Campaigns Tab Component
 * 
 * Displays and manages notification campaigns.
 */

import React from 'react';
import { Card, Button, List, Space, Tag, Typography } from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  SendOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { NotificationCampaign } from '../types/notifications.types';
import { getStatusColor } from '../utils/notificationHelpers';

const { Text } = Typography;

interface CampaignsTabProps {
  campaigns: NotificationCampaign[];
  onAddCampaign: () => void;
}

export const CampaignsTab: React.FC<CampaignsTabProps> = ({
  campaigns,
  onAddCampaign,
}) => {
  return (
    <Card
      title="Notification Campaigns"
      extra={
        <Button
          icon={<PlusOutlined />}
          onClick={onAddCampaign}
          type="primary"
        >
          Create Campaign
        </Button>
      }
    >
      <List
        dataSource={campaigns}
        renderItem={(campaign) => (
          <List.Item
            actions={[
              <Button key="view" type="text" icon={<EyeOutlined />}>View</Button>,
              <Button key="edit" type="text" icon={<EditOutlined />}>Edit</Button>,
              <Button key="send" type="text" icon={<SendOutlined />}>Send</Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<TeamOutlined />}
              title={
                <Space>
                  <Text strong>{campaign.name}</Text>
                  <Tag color={getStatusColor(campaign.status)}>
                    {campaign.status.toUpperCase()}
                  </Tag>
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">
                    Target: {campaign.targetAudience.replace('_', ' ')} • 
                    Sent: {campaign.sentCount} • 
                    Delivered: {campaign.deliveredCount} • 
                    Opened: {campaign.openedCount}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Created: {dayjs(campaign.createdAt).format('MMM DD, YYYY')}
                    {campaign.scheduledAt && ` • Scheduled: ${dayjs(campaign.scheduledAt).format('MMM DD, YYYY HH:mm')}`}
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

