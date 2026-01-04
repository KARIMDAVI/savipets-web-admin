/**
 * Report Templates List Component
 * 
 * Displays list of report templates.
 */

import React from 'react';
import { Card, List, Button, Space, Tag, Avatar, Typography } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ReportTemplate } from '../types/reports.types';
import { getCategoryColor, getCategoryIcon } from '../utils/reportHelpers';

const { Text } = Typography;

interface ReportTemplatesListProps {
  templates: ReportTemplate[];
  loading: boolean;
  onGenerate: (template: ReportTemplate) => void;
  onCreate: () => void;
  onRefresh: () => void;
}

export const ReportTemplatesList: React.FC<ReportTemplatesListProps> = ({
  templates,
  loading,
  onGenerate,
  onCreate,
  onRefresh,
}) => {
  return (
    <Card
      title="Report Templates"
      extra={
        <Space>
          <Button
            icon={<PlusOutlined />}
            onClick={onCreate}
            type="primary"
          >
            Create Template
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
          />
        </Space>
      }
    >
      <List
        dataSource={templates}
        renderItem={(template) => (
          <List.Item
            actions={[
              <Button
                key="generate"
                type="text"
                icon={<EyeOutlined />}
                onClick={() => onGenerate(template)}
                loading={loading}
              >
                Generate
              </Button>,
              <Button
                key="edit"
                type="text"
                icon={<EditOutlined />}
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
              avatar={
                <Avatar
                  icon={getCategoryIcon(template.category)}
                  style={{ backgroundColor: getCategoryColor(template.category) }}
                />
              }
              title={
                <Space>
                  <Text strong>{template.name}</Text>
                  <Tag color={getCategoryColor(template.category)}>
                    {template.category}
                  </Tag>
                  {template.isPublic && <Tag color="green">Public</Tag>}
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">{template.description}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {template.fields.length} fields • Updated {dayjs(template.updatedAt).format('MMM DD, YYYY')}
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

