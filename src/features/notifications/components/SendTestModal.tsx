/**
 * Send Test Modal Component
 * 
 * Form for sending a test notification.
 */

import React from 'react';
import { Modal, Form, Input, Select, Space, Button } from 'antd';
import type { FormInstance } from 'antd';
import type { NotificationTemplate } from '../types/notifications.types';

const { Option } = Select;

interface SendTestModalProps {
  open: boolean;
  form: FormInstance;
  templates: NotificationTemplate[];
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const SendTestModal: React.FC<SendTestModalProps> = ({
  open,
  form,
  templates,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Send Test Notification"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Form.Item
          name="templateId"
          label="Template"
          rules={[{ required: true, message: 'Please select template' }]}
        >
          <Select placeholder="Select a template">
            {templates.map(template => (
              <Option key={template.id} value={template.id}>
                {template.name} ({template.type})
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="testEmail"
          label="Test Email"
          rules={[{ required: true, message: 'Please enter test email' }]}
        >
          <Input placeholder="test@example.com" />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Send Test
            </Button>
            <Button onClick={onCancel}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

