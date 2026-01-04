/**
 * Data Retention Tab Component
 * 
 * Displays and manages data retention policies.
 */

import React from 'react';
import { Card, Button, List, Space, Tag, Typography } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import type { DataRetentionPolicy } from '../types/audit-compliance.types';

const { Text } = Typography;

interface DataRetentionTabProps {
  retentionPolicies: DataRetentionPolicy[];
  onAddPolicy: () => void;
}

export const DataRetentionTab: React.FC<DataRetentionTabProps> = ({
  retentionPolicies,
  onAddPolicy,
}) => {
  return (
    <Card
      title="Data Retention Policies"
      extra={
        <Button
          icon={<PlusOutlined />}
          onClick={onAddPolicy}
          type="primary"
        >
          Add Policy
        </Button>
      }
    >
      <List
        dataSource={retentionPolicies}
        renderItem={(policy) => (
          <List.Item
            actions={[
              <Button key="edit" type="text" icon={<EditOutlined />}>Edit</Button>,
              <Button key="delete" type="text" icon={<DeleteOutlined />} danger>Delete</Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<DatabaseOutlined />}
              title={
                <Space>
                  <Text strong>{policy.dataType}</Text>
                  <Tag color={policy.autoDelete ? 'green' : 'orange'}>
                    {policy.autoDelete ? 'Auto Delete' : 'Manual Review'}
                  </Tag>
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">{policy.description}</Text>
                  <Text type="secondary">
                    Retention: {policy.retentionPeriod} days • Legal Basis: {policy.legalBasis}
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

