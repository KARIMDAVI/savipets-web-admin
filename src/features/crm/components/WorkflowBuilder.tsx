/**
 * Workflow Builder Component
 * 
 * Modal for creating and editing workflow automation rules.
 */

import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Card,
  Divider,
  InputNumber,
  Switch,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import type {
  WorkflowRule,
  WorkflowFormValues,
  WorkflowCondition,
  WorkflowActionConfig,
} from '../types/workflows.types';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface WorkflowBuilderProps {
  visible: boolean;
  workflow?: WorkflowRule | null;
  onCancel: () => void;
  onFinish: (values: WorkflowFormValues) => Promise<void>;
  loading?: boolean;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  visible,
  workflow,
  onCancel,
  onFinish,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [conditions, setConditions] = useState<WorkflowCondition[]>([]);
  const [actions, setActions] = useState<WorkflowActionConfig[]>([]);

  useEffect(() => {
    if (visible) {
      if (workflow) {
        // Edit mode
        form.setFieldsValue({
          name: workflow.name,
          description: workflow.description,
          trigger: workflow.trigger,
          enabled: workflow.enabled,
          priority: workflow.priority,
        });
        setConditions(workflow.conditions || []);
        setActions(workflow.actions || []);
      } else {
        // Create mode
        form.resetFields();
        form.setFieldsValue({
          enabled: true,
          priority: 5,
        });
        setConditions([]);
        setActions([]);
      }
    }
  }, [visible, workflow, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formValues: WorkflowFormValues = {
        ...values,
        conditions: conditions.length > 0 ? conditions : undefined,
        actions,
      };
      await onFinish(formValues);
      form.resetFields();
      setConditions([]);
      setActions([]);
    } catch (error) {
      // Validation errors handled by form
    }
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      { field: '', operator: 'equals', value: '' },
    ]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<WorkflowCondition>) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], ...updates };
    setConditions(updated);
  };

  const addAction = () => {
    setActions([
      ...actions,
      { type: 'send_email', params: {} },
    ]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, updates: Partial<WorkflowActionConfig>) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], ...updates };
    setActions(updated);
  };

  return (
    <Modal
      title={workflow ? 'Edit Workflow' : 'Create New Workflow'}
      open={visible}
      onCancel={onCancel}
      width={900}
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
          disabled={actions.length === 0}
        >
          {workflow ? 'Update Workflow' : 'Create Workflow'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Workflow Name"
          rules={[{ required: true, message: 'Workflow name is required' }]}
        >
          <Input placeholder="Enter workflow name" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={2} placeholder="Workflow description..." />
        </Form.Item>

        <Form.Item
          name="trigger"
          label="Trigger"
          rules={[{ required: true, message: 'Trigger is required' }]}
        >
          <Select placeholder="Select trigger">
            <Option value="client_created">Client Created</Option>
            <Option value="client_updated">Client Updated</Option>
            <Option value="booking_created">Booking Created</Option>
            <Option value="booking_completed">Booking Completed</Option>
            <Option value="booking_cancelled">Booking Cancelled</Option>
            <Option value="note_added">Note Added</Option>
            <Option value="task_completed">Task Completed</Option>
            <Option value="email_sent">Email Sent</Option>
            <Option value="call_logged">Call Logged</Option>
            <Option value="segment_assigned">Segment Assigned</Option>
            <Option value="tag_added">Tag Added</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
          rules={[{ required: true, message: 'Priority is required' }]}
        >
          <InputNumber min={1} max={100} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="enabled" valuePropName="checked">
          <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
        </Form.Item>

        <Divider>Conditions (Optional)</Divider>

        {conditions.map((condition, index) => (
          <Card key={index} size="small" style={{ marginBottom: '8px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space style={{ width: '100%' }}>
                <Input
                  placeholder="Field (e.g., client.segment)"
                  value={condition.field}
                  onChange={(e) => updateCondition(index, { field: e.target.value })}
                  style={{ width: '200px' }}
                />
                <Select
                  value={condition.operator}
                  onChange={(value) => updateCondition(index, { operator: value })}
                  style={{ width: '150px' }}
                >
                  <Option value="equals">Equals</Option>
                  <Option value="not_equals">Not Equals</Option>
                  <Option value="contains">Contains</Option>
                  <Option value="greater_than">Greater Than</Option>
                  <Option value="less_than">Less Than</Option>
                  <Option value="is_empty">Is Empty</Option>
                  <Option value="is_not_empty">Is Not Empty</Option>
                </Select>
                <Input
                  placeholder="Value"
                  value={String(condition.value || '')}
                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                  style={{ flex: 1 }}
                />
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeCondition(index)}
                />
              </Space>
            </Space>
          </Card>
        ))}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addCondition}
          block
          style={{ marginBottom: '16px' }}
        >
          Add Condition
        </Button>

        <Divider>Actions</Divider>

        {actions.map((action, index) => (
          <Card key={index} size="small" style={{ marginBottom: '8px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space style={{ width: '100%' }}>
                <Select
                  value={action.type}
                  onChange={(value) => updateAction(index, { type: value })}
                  style={{ width: '200px' }}
                >
                  <Option value="send_email">Send Email</Option>
                  <Option value="send_sms">Send SMS</Option>
                  <Option value="create_task">Create Task</Option>
                  <Option value="assign_segment">Assign Segment</Option>
                  <Option value="add_tag">Add Tag</Option>
                  <Option value="remove_tag">Remove Tag</Option>
                  <Option value="create_note">Create Note</Option>
                  <Option value="update_field">Update Field</Option>
                  <Option value="webhook">Webhook</Option>
                </Select>
                <InputNumber
                  placeholder="Delay (seconds)"
                  value={action.delay}
                  onChange={(value) => updateAction(index, { delay: value || undefined })}
                  min={0}
                  style={{ width: '150px' }}
                />
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeAction(index)}
                />
              </Space>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Configure action parameters in the workflow execution
              </Text>
            </Space>
          </Card>
        ))}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addAction}
          block
        >
          Add Action
        </Button>

        {actions.length === 0 && (
          <Text type="danger" style={{ display: 'block', marginTop: '8px' }}>
            At least one action is required
          </Text>
        )}
      </Form>
    </Modal>
  );
};

