/**
 * Task Manager Component
 * 
 * Main component for managing tasks with filtering, sorting, and CRUD operations.
 */

import React, { useState } from 'react';
import { Tabs, Card, Space, Button, Typography } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useTasks } from '../hooks/useTasks';
import { TaskList } from './TaskList';
import { TaskModal } from './TaskModal';
import {
  getOverdueTasks,
  getTasksDueToday,
  getTasksAssignedToUser,
} from '../utils/taskHelpers';
import { useAuth } from '@/contexts/AuthContext';
import type { Task, TaskFormValues, TaskAssignment } from '../types/tasks.types';
import type { User } from '@/types';

const { Title } = Typography;

interface TaskManagerProps {
  clientId?: string;
  onTaskView?: (task: Task) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  clientId,
  onTaskView,
}) => {
  const { user } = useAuth();
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  const {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
  } = useTasks(clientId ? { clientId } : undefined);

  const overdueTasks = getOverdueTasks(tasks);
  const dueTodayTasks = getTasksDueToday(tasks);
  const myTasks = user ? getTasksAssignedToUser(tasks, user.id) : [];

  const handleCreateTask = async (values: TaskFormValues) => {
    await createTask.mutateAsync(values);
    setTaskModalVisible(false);
    setSelectedTask(null);
  };

  const handleUpdateTask = async (values: TaskFormValues) => {
    if (!selectedTask) return;
    const updates: Partial<Task> = {
      ...values,
      assignedTo: values.assignedTo?.map(userId => ({
        userId,
        assignedAt: new Date(),
        assignedBy: selectedTask.createdBy,
      })),
    };
    await updateTask.mutateAsync({
      taskId: selectedTask.id,
      updates,
    });
    setTaskModalVisible(false);
    setSelectedTask(null);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskModalVisible(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask.mutateAsync(taskId);
  };

  const handleCompleteTask = async (taskId: string) => {
    await completeTask.mutateAsync({ taskId });
  };

  const handleTaskFinish = async (values: TaskFormValues) => {
    if (selectedTask) {
      await handleUpdateTask(values);
    } else {
      await handleCreateTask(values);
    }
  };

  const tabItems = [
    {
      key: 'all',
      label: `All Tasks (${tasks.length})`,
      children: (
        <TaskList
          tasks={tasks}
          loading={isLoading}
          onTaskComplete={handleCompleteTask}
          onTaskEdit={handleEditTask}
          onTaskDelete={handleDeleteTask}
          onTaskView={onTaskView}
          onCreateTask={() => {
            setSelectedTask(null);
            setTaskModalVisible(true);
          }}
        />
      ),
    },
    {
      key: 'overdue',
      label: (
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>Overdue ({overdueTasks.length})</span>
        </Space>
      ),
      children: (
        <TaskList
          tasks={overdueTasks}
          loading={isLoading}
          onTaskComplete={handleCompleteTask}
          onTaskEdit={handleEditTask}
          onTaskDelete={handleDeleteTask}
          onTaskView={onTaskView}
        />
      ),
    },
    {
      key: 'due_today',
      label: (
        <Space>
          <ClockCircleOutlined style={{ color: '#faad14' }} />
          <span>Due Today ({dueTodayTasks.length})</span>
        </Space>
      ),
      children: (
        <TaskList
          tasks={dueTodayTasks}
          loading={isLoading}
          onTaskComplete={handleCompleteTask}
          onTaskEdit={handleEditTask}
          onTaskDelete={handleDeleteTask}
          onTaskView={onTaskView}
        />
      ),
    },
    {
      key: 'my_tasks',
      label: (
        <Space>
          <CheckCircleOutlined />
          <span>My Tasks ({myTasks.length})</span>
        </Space>
      ),
      children: (
        <TaskList
          tasks={myTasks}
          loading={isLoading}
          onTaskComplete={handleCompleteTask}
          onTaskEdit={handleEditTask}
          onTaskDelete={handleDeleteTask}
          onTaskView={onTaskView}
        />
      ),
    },
  ];

  return (
    <>
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      <TaskModal
        visible={taskModalVisible}
        task={selectedTask}
        onCancel={() => {
          setTaskModalVisible(false);
          setSelectedTask(null);
        }}
        onFinish={handleTaskFinish}
        loading={createTask.isPending || updateTask.isPending}
      />
    </>
  );
};

