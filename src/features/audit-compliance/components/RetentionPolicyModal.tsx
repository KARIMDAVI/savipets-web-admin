/**
 * Retention Policy Modal Component
 * 
 * Form for creating/updating data retention policies.
 */

import React from 'react';
import { Modal, Form, Input, Select, Switch, InputNumber, Space, Button } from 'antd';
import type { FormInstance } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

interface RetentionPolicyModalProps {
  open: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const RetentionPolicyModal: React.FC<RetentionPolicyModalProps> = ({
  open,
  form,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Data Retention Policy"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Form.Item
          name="dataType"
          label="Data Type"
          rules={[{ required: true, message: 'Please enter data type' }]}
        >
          <Input placeholder="e.g., Location Data, Chat Messages" />
        </Form.Item>
        
        <Form.Item
          name="retentionPeriod"
          label="Retention Period (days)"
          rules={[{ required: true, message: 'Please enter retention period' }]}
        >
          <InputNumber min={1} max={3650} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="autoDelete"
          label="Automatic Deletion"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item
          name="legalBasis"
          label="Legal Basis"
          rules={[{ required: true, message: 'Please enter legal basis' }]}
        >
          <Select>
            <Option value="Consent">Consent</Option>
            <Option value="Contract Performance">Contract Performance</Option>
            <Option value="Legal Obligation">Legal Obligation</Option>
            <Option value="Legitimate Interest">Legitimate Interest</Option>
            <Option value="Vital Interests">Vital Interests</Option>
            <Option value="Public Task">Public Task</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea rows={3} placeholder="Describe what data this policy covers" />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Save Policy
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

