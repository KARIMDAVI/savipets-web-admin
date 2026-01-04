/**
 * Task List Component
 * 
 * List view of tasks with filtering and sorting.
 */

import React, { useMemo, useState } from 'react';
import { Card, Empty, Space, Select, Button, Typography } from 'antd';
import {
  PlusOutlined,
  FilterOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { Task, TaskFilters, TaskStatus, TaskPriority } from '../types/tasks.types';
import { TaskCard } from './TaskCard';
import {
  filterTasks,
  sortTasksByPriority,
  calculateTaskStats,
} from '../utils/taskHelpers';

const { Text } = Typography;
const { Option } = Select;

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  filters?: TaskFilters;
  onTaskComplete?: (taskId: string) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskView?: (task: Task) => void;
  onCreateTask?: () => void;
}

type ViewMode = 'list' | 'grid';

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading = false,
  filters,
  onTaskComplete,
  onTaskEdit,
  onTaskDelete,
  onTaskView,
  onCreateTask,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority[]>([]);

  // Apply filters
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((task) => statusFilter.includes(task.status));
    }

    // Apply priority filter
    if (priorityFilter.length > 0) {
      filtered = filtered.filter((task) => priorityFilter.includes(task.priority));
    }

    // Apply additional filters
    if (filters) {
      filtered = filterTasks(filtered, filters);
    }

    // Sort by priority
    return sortTasksByPriority(filtered);
  }, [tasks, statusFilter, priorityFilter, filters]);

  const stats = useMemo(() => calculateTaskStats(tasks), [tasks]);

  if (loading) {
    return <Card loading />;
  }

  return (
    <Card
      title={
        <Space>
          <UnorderedListOutlined />
          <span>Tasks ({filteredTasks.length})</span>
        </Space>
      }
      extra={
        <Space>
          <Select
            mode="multiple"
            placeholder="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="todo">To Do</Option>
            <Option value="in_progress">In Progress</Option>
            <Option value="completed">Completed</Option>
            <Option value="on_hold">On Hold</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
          <Select
            mode="multiple"
            placeholder="Filter by priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="urgent">Urgent</Option>
            <Option value="high">High</Option>
            <Option value="medium">Medium</Option>
            <Option value="low">Low</Option>
          </Select>
          <Button
            icon={viewMode === 'list' ? <AppstoreOutlined /> : <UnorderedListOutlined />}
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          />
          {onCreateTask && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreateTask}>
              New Task
            </Button>
          )}
        </Space>
      }
    >
      {/* Task Statistics */}
      <Space style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px', width: '100%' }} wrap>
        <Text strong>Stats:</Text>
        <Text>Total: {stats.total}</Text>
        <Text type="danger">Overdue: {stats.overdue}</Text>
        <Text type="warning">Due Today: {stats.dueToday}</Text>
        <Text>In Progress: {stats.inProgress}</Text>
        <Text type="success">Completed: {stats.completed}</Text>
      </Space>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Empty description="No tasks found" />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr',
            gap: '12px',
          }}
        >
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={onTaskComplete}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
              onView={onTaskView}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

