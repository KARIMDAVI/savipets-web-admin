/**
 * Task Card Component
 * 
 * Individual task card display component.
 */

import React from 'react';
import { Card, Tag, Space, Typography, Button, Tooltip, Progress, Avatar } from 'antd';
import {
  CheckOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Task } from '../types/tasks.types';
import { isTaskOverdue, isTaskDueToday, getTaskUrgencyScore } from '../utils/taskHelpers';

const { Text } = Typography;

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onView?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onEdit,
  onDelete,
  onView,
}) => {
  const isOverdue = isTaskOverdue(task);
  const isDueToday = isTaskDueToday(task);
  const urgencyScore = getTaskUrgencyScore(task);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'blue';
      case 'low':
        return 'default';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in_progress':
        return 'blue';
      case 'on_hold':
        return 'orange';
      case 'cancelled':
        return 'default';
      default:
        return 'gray';
    }
  };

  return (
    <Card
      hoverable
      style={{
        marginBottom: '12px',
        borderLeft: `4px solid ${
          isOverdue ? '#ff4d4f' : isDueToday ? '#faad14' : 'transparent'
        }`,
      }}
      actions={[
        task.status !== 'completed' && onComplete ? (
          <Tooltip title="Mark as Complete">
            <Button
              type="text"
              icon={<CheckOutlined />}
              onClick={() => onComplete(task.id)}
            />
          </Tooltip>
        ) : null,
        onEdit ? (
          <Tooltip title="Edit Task">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(task)}
            />
          </Tooltip>
        ) : null,
        onDelete ? (
          <Tooltip title="Delete Task">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(task.id)}
            />
          </Tooltip>
        ) : null,
      ].filter(Boolean)}
      onClick={() => onView && onView(task)}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text strong style={{ fontSize: '16px' }}>
            {task.title}
          </Text>
          <Space>
            <Tag color={getPriorityColor(task.priority)}>{task.priority}</Tag>
            <Tag color={getStatusColor(task.status)}>
              {task.status.replace('_', ' ').toUpperCase()}
            </Tag>
          </Space>
        </div>

        {task.description && (
          <Text type="secondary" ellipsis>
            {task.description}
          </Text>
        )}

        <Space wrap>
          {task.dueDate && (
            <Space>
              <ClockCircleOutlined />
              <Text
                type={isOverdue ? 'danger' : isDueToday ? 'warning' : 'secondary'}
                style={{ fontSize: '12px' }}
              >
                {isOverdue
                  ? `Overdue: ${dayjs(task.dueDate).fromNow()}`
                  : isDueToday
                  ? 'Due today'
                  : `Due: ${dayjs(task.dueDate).format('MMM DD, YYYY')}`}
              </Text>
            </Space>
          )}

          {task.assignedTo && task.assignedTo.length > 0 && (
            <Space>
              <UserOutlined />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {task.assignedTo.length} assignee{task.assignedTo.length > 1 ? 's' : ''}
              </Text>
            </Space>
          )}

          {task.completionPercentage !== undefined && (
            <Progress
              percent={task.completionPercentage}
              size="small"
              style={{ width: '100px' }}
            />
          )}
        </Space>

        {task.tags && task.tags.length > 0 && (
          <Space wrap>
            {task.tags.map((tag) => (
              <Tag key={tag}>
                {tag}
              </Tag>
            ))}
          </Space>
        )}

        {urgencyScore > 70 && task.status !== 'completed' && (
          <Tag color="red" style={{ marginTop: '8px' }}>
            High Urgency ({urgencyScore}/100)
          </Tag>
        )}
      </Space>
    </Card>
  );
};

