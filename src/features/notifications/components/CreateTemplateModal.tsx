/**
 * Create Template Modal Component
 * 
 * Form for creating a new notification template.
 */

import React from 'react';
import { Modal, Form, Input, Select, Switch, Row, Col, Space, Button } from 'antd';
import type { FormInstance } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

interface CreateTemplateModalProps {
  open: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  open,
  form,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Create Notification Template"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Form.Item
          name="name"
          label="Template Name"
          rules={[{ required: true, message: 'Please enter template name' }]}
        >
          <Input placeholder="e.g., Booking Confirmation" />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Please select type' }]}
            >
              <Select>
                <Option value="push">Push Notification</Option>
                <Option value="email">Email</Option>
                <Option value="sms">SMS</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select>
                <Option value="booking">Booking</Option>
                <Option value="payment">Payment</Option>
                <Option value="system">System</Option>
                <Option value="marketing">Marketing</Option>
                <Option value="security">Security</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="subject"
          label="Subject (Email only)"
          dependencies={['type']}
        >
          {({ getFieldValue }) => 
            getFieldValue('type') === 'email' ? (
              <Input placeholder="Email subject line" />
            ) : null
          }
        </Form.Item>
        
        <Form.Item
          name="content"
          label="Content"
          rules={[{ required: true, message: 'Please enter content' }]}
        >
          <TextArea rows={6} placeholder="Enter notification content. Use {{variableName}} for dynamic content." />
        </Form.Item>
        
        <Form.Item
          name="variables"
          label="Variables"
        >
          <Select mode="tags" placeholder="Add variables (e.g., userName, amount)">
            <Option value="userName">userName</Option>
            <Option value="serviceType">serviceType</Option>
            <Option value="petName">petName</Option>
            <Option value="sitterName">sitterName</Option>
            <Option value="date">date</Option>
            <Option value="time">time</Option>
            <Option value="amount">amount</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="isActive"
          label="Active"
          valuePropName="checked"
        >
          <Switch defaultChecked />
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

