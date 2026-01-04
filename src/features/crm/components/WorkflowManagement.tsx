/**
 * Workflow Management Component
 * 
 * UI for creating and managing automated workflows and reminders.
 */

import React, { useState } from 'react';
import { Card, Button, Table, Space, Tag, Switch, Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import type { Workflow, WorkflowTrigger, WorkflowAction } from '../types/workflows';
import { useAuth } from '@/contexts/AuthContext';
import { canCreateSegment } from '../utils/crmPermissions'; // Reuse permission check

const { Option } = Select;
const { TextArea } = Input;

interface WorkflowManagementProps {
  workflows: Workflow[];
  onCreateWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'createdBy'>) => Promise<any>;
  onUpdateWorkflow: (workflowId: string, updates: Partial<Workflow>) => Promise<any>;
  onDeleteWorkflow: (workflowId: string) => Promise<any>;
  onToggleWorkflow: (workflowId: string, isActive: boolean) => Promise<any>;
}

export const WorkflowManagement: React.FC<WorkflowManagementProps> = ({
  workflows,
  onCreateWorkflow,
  onUpdateWorkflow,
  onDeleteWorkflow,
  onToggleWorkflow,
}) => {
  const { user } = useAuth();
  const canManage = canCreateSegment(user);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  if (!canManage) return null;

  const handleCreate = async (values: any) => {
    try {
      // Parse trigger
      let trigger: WorkflowTrigger;
      if (values.triggerType === 'days_since_last_booking') {
        trigger = { type: 'days_since_last_booking', days: values.triggerDays || 30 };
      } else if (values.triggerType === 'segment_assignment') {
        trigger = { type: 'segment_assignment', segmentName: values.triggerSegment };
      } else if (values.triggerType === 'churn_risk_high') {
        trigger = { type: 'churn_risk_high' };
      } else if (values.triggerType === 'no_bookings_days') {
        trigger = { type: 'no_bookings_days', days: values.triggerDays || 30 };
      } else {
        trigger = { type: 'first_booking_created' };
      }

      // Parse actions
      const actions: WorkflowAction[] = [];
      if (values.actionCreateNote) {
        actions.push({
          type: 'create_note',
          noteType: values.noteType || 'follow_up',
          content: values.noteContent || '',
          priority: values.notePriority || 'medium',
        });
      }
      if (values.actionAssignTag && values.tagId) {
        actions.push({
          type: 'assign_tag',
          tagId: values.tagId,
        });
      }

      await onCreateWorkflow({
        name: values.name,
        description: values.description || '',
        trigger,
        actions,
        isActive: values.isActive !== false,
      });

      setCreateModalVisible(false);
      form.resetFields();
      message.success('Workflow created successfully');
    } catch (error) {
      message.error('Failed to create workflow');
    }
  };

  const handleToggle = async (workflow: Workflow) => {
    try {
      await onToggleWorkflow(workflow.id, !workflow.isActive);
      message.success(`Workflow ${workflow.isActive ? 'paused' : 'activated'}`);
    } catch (error) {
      message.error('Failed to update workflow');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Trigger',
      key: 'trigger',
      render: (record: Workflow) => {
        const triggerLabels: Record<string, string> = {
          days_since_last_booking: `No booking for ${(record.trigger as any).days} days`,
          segment_assignment: `Assigned to ${(record.trigger as any).segmentName}`,
          churn_risk_high: 'High churn risk detected',
          no_bookings_days: `No bookings for ${(record.trigger as any).days} days`,
          first_booking_created: 'First booking created',
        };
        return triggerLabels[record.trigger.type] || record.trigger.type;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Workflow) => (
        <Space>
          {record.actions.map((action, idx) => (
            <Tag key={idx} color="blue">
              {action.type.replace('_', ' ')}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Workflow) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggle(record)}
          checkedChildren="Active"
          unCheckedChildren="Paused"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Workflow) => (
        <Space>
          <Button
            type="text"
            icon={record.isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => handleToggle(record)}
          />
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" icon={<DeleteOutlined />} danger />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Automated Workflows"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Create Workflow
          </Button>
        }
        style={{ marginBottom: '24px' }}
      >
        <Table
          dataSource={workflows}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create Workflow Modal */}
      <Modal
        title="Create Automated Workflow"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Workflow Name"
            rules={[{ required: true, message: 'Please enter workflow name' }]}
          >
            <Input placeholder="e.g., At-Risk Client Follow-up" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Describe what this workflow does..." />
          </Form.Item>

          <Form.Item
            name="triggerType"
            label="Trigger"
            rules={[{ required: true, message: 'Please select trigger' }]}
          >
            <Select placeholder="Select trigger condition">
              <Option value="days_since_last_booking">Days Since Last Booking</Option>
              <Option value="segment_assignment">Segment Assignment</Option>
              <Option value="churn_risk_high">High Churn Risk</Option>
              <Option value="no_bookings_days">No Bookings (Days)</Option>
              <Option value="first_booking_created">First Booking Created</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.triggerType !== currentValues.triggerType
            }
          >
            {({ getFieldValue }) =>
              ['days_since_last_booking', 'no_bookings_days'].includes(
                getFieldValue('triggerType')
              ) ? (
                <Form.Item
                  name="triggerDays"
                  label="Days"
                  rules={[{ required: true, message: 'Please enter days' }]}
                >
                  <InputNumber min={1} max={365} style={{ width: '100%' }} />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item name="actionCreateNote" valuePropName="checked">
            <Space>
              <input type="checkbox" />
              <span>Create Note</span>
            </Space>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.actionCreateNote !== currentValues.actionCreateNote
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('actionCreateNote') ? (
                <>
                  <Form.Item name="noteType" label="Note Type">
                    <Select>
                      <Option value="follow_up">Follow Up</Option>
                      <Option value="general">General</Option>
                      <Option value="issue">Issue</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="noteContent" label="Note Content">
                    <TextArea rows={3} placeholder="Default note content..." />
                  </Form.Item>
                  <Form.Item name="notePriority" label="Priority">
                    <Select defaultValue="medium">
                      <Option value="low">Low</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="high">High</Option>
                    </Select>
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Workflow
              </Button>
              <Button
                onClick={() => {
                  setCreateModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};












