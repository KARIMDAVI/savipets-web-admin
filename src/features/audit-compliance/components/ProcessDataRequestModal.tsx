/**
 * Process Data Request Modal Component
 * 
 * Form for processing data subject requests (GDPR/CCPA).
 */

import React from 'react';
import { Modal, Form, Input, Select, Space, Button } from 'antd';
import type { FormInstance } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

interface ProcessDataRequestModalProps {
  open: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const ProcessDataRequestModal: React.FC<ProcessDataRequestModalProps> = ({
  open,
  form,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Process Data Request"
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
          name="userId"
          label="User ID"
          rules={[{ required: true, message: 'Please enter user ID' }]}
        >
          <Input placeholder="Enter user ID" />
        </Form.Item>
        
        <Form.Item
          name="type"
          label="Request Type"
          rules={[{ required: true, message: 'Please select request type' }]}
        >
          <Select>
            <Option value="access">Data Access</Option>
            <Option value="portability">Data Portability</Option>
            <Option value="deletion">Data Deletion</Option>
            <Option value="rectification">Data Rectification</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="reason"
          label="Reason"
          rules={[{ required: true, message: 'Please enter reason' }]}
        >
          <TextArea rows={3} placeholder="Enter reason for the request" />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Process Request
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

