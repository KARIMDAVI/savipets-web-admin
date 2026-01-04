/**
 * Workflow List Component
 * 
 * List view of workflows with filtering and actions.
 */

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Switch,
  Popconfirm,
  Typography,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import type { WorkflowRule } from '../types/workflows.types';

const { Text } = Typography;

interface WorkflowListProps {
  workflows: WorkflowRule[];
  loading?: boolean;
  onEdit?: (workflow: WorkflowRule) => void;
  onDelete?: (workflowId: string) => void;
  onToggle?: (workflowId: string, enabled: boolean) => void;
  onCreate?: () => void;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({
  workflows,
  loading = false,
  onEdit,
  onDelete,
  onToggle,
  onCreate,
}) => {
  const getTriggerColor = (trigger: WorkflowRule['trigger']) => {
    if (trigger.includes('created')) return 'green';
    if (trigger.includes('completed')) return 'blue';
    if (trigger.includes('cancelled')) return 'red';
    return 'default';
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: WorkflowRule) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Trigger',
      dataIndex: 'trigger',
      key: 'trigger',
      render: (trigger: WorkflowRule['trigger']) => (
        <Tag color={getTriggerColor(trigger)}>
          {trigger.replace(/_/g, ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (actions: WorkflowRule['actions']) => (
        <Text type="secondary">{actions.length} action(s)</Text>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: number) => (
        <Tag color={priority >= 10 ? 'red' : priority >= 5 ? 'orange' : 'blue'}>
          {priority}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: WorkflowRule) => (
        <Switch
          checked={enabled}
          onChange={(checked) => onToggle && onToggle(record.id, checked)}
          checkedChildren={<PlayCircleOutlined />}
          unCheckedChildren={<PauseCircleOutlined />}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: WorkflowRule) => (
        <Space>
          {onEdit && (
            <Tooltip title="Edit Workflow">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
              />
            </Tooltip>
          )}
          {onDelete && (
            <Popconfirm
              title="Are you sure you want to delete this workflow?"
              onConfirm={() => onDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete Workflow">
                <Button type="link" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Workflows"
      extra={
        onCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            New Workflow
          </Button>
        )
      }
    >
      <Table
        columns={columns}
        dataSource={workflows}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

