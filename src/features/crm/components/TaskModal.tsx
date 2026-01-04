/**
 * Task Modal Component
 * 
 * Modal for creating and editing tasks.
 */

import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
  message,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Task, TaskFormValues } from '../types/tasks.types';
import type { User } from '@/types';

const { TextArea } = Input;
const { Option } = Select;

interface TaskModalProps {
  visible: boolean;
  task?: Task | null;
  client?: User | null;
  onCancel: () => void;
  onFinish: (values: TaskFormValues) => Promise<void>;
  loading?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  task,
  client,
  onCancel,
  onFinish,
  loading = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (task) {
        // Edit mode
        form.setFieldsValue({
          title: task.title,
          description: task.description,
          type: task.type,
          priority: task.priority,
          status: task.status,
          clientId: task.clientId,
          assignedTo: task.assignedTo?.map((a) => a.userId),
          dueDate: task.dueDate ? dayjs(task.dueDate) : undefined,
          startDate: task.startDate ? dayjs(task.startDate) : undefined,
          tags: task.tags,
          estimatedDuration: task.estimatedDuration,
        });
      } else {
        // Create mode
        form.resetFields();
        if (client) {
          form.setFieldsValue({
            clientId: client.id,
          });
        }
      }
    }
  }, [visible, task, client, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formValues: TaskFormValues = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toDate() : undefined,
        startDate: values.startDate ? values.startDate.toDate() : undefined,
      };
      await onFinish(formValues);
      form.resetFields();
    } catch (error) {
      // Validation errors handled by form
    }
  };

  return (
    <Modal
      title={task ? 'Edit Task' : 'Create New Task'}
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSubmit}
          loading={loading}
        >
          {task ? 'Update Task' : 'Create Task'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Task Title"
          rules={[{ required: true, message: 'Task title is required' }]}
        >
          <Input placeholder="Enter task title" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={4} placeholder="Task description..." maxLength={1000} showCount />
        </Form.Item>

        <Form.Item
          name="type"
          label="Task Type"
          rules={[{ required: true, message: 'Task type is required' }]}
          initialValue="follow_up"
        >
          <Select>
            <Option value="follow_up">Follow Up</Option>
            <Option value="call">Call</Option>
            <Option value="email">Email</Option>
            <Option value="meeting">Meeting</Option>
            <Option value="note">Note</Option>
            <Option value="booking">Booking</Option>
            <Option value="custom">Custom</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
          rules={[{ required: true, message: 'Priority is required' }]}
          initialValue="medium"
        >
          <Select>
            <Option value="low">Low</Option>
            <Option value="medium">Medium</Option>
            <Option value="high">High</Option>
            <Option value="urgent">Urgent</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Status is required' }]}
          initialValue="todo"
        >
          <Select>
            <Option value="todo">To Do</Option>
            <Option value="in_progress">In Progress</Option>
            <Option value="completed">Completed</Option>
            <Option value="on_hold">On Hold</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </Form.Item>

        {client && (
          <Form.Item name="clientId" label="Client" initialValue={client.id}>
            <Input disabled value={`${client.firstName} ${client.lastName}`} />
          </Form.Item>
        )}

        <Form.Item name="dueDate" label="Due Date">
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
            placeholder="Select due date"
          />
        </Form.Item>

        <Form.Item name="startDate" label="Start Date">
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
            placeholder="Select start date"
          />
        </Form.Item>

        <Form.Item name="estimatedDuration" label="Estimated Duration (minutes)">
          <InputNumber min={0} style={{ width: '100%' }} placeholder="Duration in minutes" />
        </Form.Item>

        <Form.Item name="tags" label="Tags">
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Add tags"
            tokenSeparators={[',']}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

