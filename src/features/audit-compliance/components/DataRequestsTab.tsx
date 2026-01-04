/**
 * Data Requests Tab Component
 * 
 * Displays and manages data subject requests (GDPR/CCPA).
 */

import React from 'react';
import { Card, Button, List, Space, Tag, Badge, Avatar, Typography } from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { DataRequest } from '../types/audit-compliance.types';

const { Text } = Typography;

interface DataRequestsTabProps {
  dataRequests: DataRequest[];
  onProcessRequest: () => void;
}

export const DataRequestsTab: React.FC<DataRequestsTabProps> = ({
  dataRequests,
  onProcessRequest,
}) => {
  return (
    <Card
      title="Data Subject Requests"
      extra={
        <Button
          icon={<PlusOutlined />}
          onClick={onProcessRequest}
          type="primary"
        >
          Process Request
        </Button>
      }
    >
      <List
        dataSource={dataRequests}
        renderItem={(request) => (
          <List.Item
            actions={[
              <Button key="view" type="text" icon={<EyeOutlined />}>View</Button>,
              <Button key="process" type="text" icon={<EditOutlined />}>Process</Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={
                <Space>
                  <Text strong>{request.userName}</Text>
                  <Tag color="blue">{request.type.toUpperCase()}</Tag>
                  <Badge 
                    status={request.status === 'completed' ? 'success' : 
                           request.status === 'in_progress' ? 'processing' : 'default'} 
                    text={request.status.replace('_', ' ').toUpperCase()} 
                  />
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">
                    Requested: {dayjs(request.requestedAt).format('MMM DD, YYYY HH:mm')}
                  </Text>
                  {request.completedAt && (
                    <Text type="secondary">
                      Completed: {dayjs(request.completedAt).format('MMM DD, YYYY HH:mm')}
                    </Text>
                  )}
                  {request.reason && (
                    <Text type="secondary">Reason: {request.reason}</Text>
                  )}
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

