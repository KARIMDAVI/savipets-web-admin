/**
 * Add Passkey Modal Component
 * 
 * Modal for adding a passkey device.
 */

import React from 'react';
import { Modal, Alert, Form, Input, Button, Space } from 'antd';

interface AddPasskeyModalProps {
  visible: boolean;
  loading: boolean;
  onCancel: () => void;
  onFinish: () => void;
  form: any;
}

export const AddPasskeyModal: React.FC<AddPasskeyModalProps> = ({
  visible,
  loading,
  onCancel,
  onFinish,
  form,
}) => {
  return (
    <Modal
      title="Add Passkey"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="Passkey Setup"
          description="Use your device's biometric authentication or security key to create a passkey."
          type="info"
          showIcon
        />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="deviceName"
            label="Device Name"
            rules={[{ required: true, message: 'Please enter device name' }]}
          >
            <Input placeholder="e.g., iPhone 14 Pro" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Add Passkey
              </Button>
              <Button onClick={onCancel}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
};

