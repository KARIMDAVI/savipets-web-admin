/**
 * Create Template Modal Component
 * 
 * Modal form for creating a new report template.
 */

import React from 'react';
import { Modal, Form, Input, Select, Switch, Button, Space } from 'antd';

const { Option } = Select;

interface CreateTemplateModalProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  form: any;
}

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  visible,
  onCancel,
  onFinish,
  form,
}) => {
  return (
    <Modal
      title="Create Report Template"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="name"
          label="Template Name"
          rules={[{ required: true, message: 'Please enter template name' }]}
        >
          <Input placeholder="e.g., Monthly Revenue Report" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <Input.TextArea rows={3} placeholder="Describe what this report contains" />
        </Form.Item>
        
        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please select category' }]}
        >
          <Select>
            <Option value="revenue">Revenue</Option>
            <Option value="bookings">Bookings</Option>
            <Option value="sitters">Sitters</Option>
            <Option value="clients">Clients</Option>
            <Option value="custom">Custom</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="isPublic"
          label="Public Template"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Create Template
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

