/**
 * Add TOTP Modal Component
 * 
 * Modal for adding a TOTP device.
 */

import React from 'react';
import { Modal, Alert, Form, Input, Button, Space } from 'antd';

interface AddTOTPModalProps {
  visible: boolean;
  loading: boolean;
  onCancel: () => void;
  onFinish: () => void;
  form: any;
}

export const AddTOTPModal: React.FC<AddTOTPModalProps> = ({
  visible,
  loading,
  onCancel,
  onFinish,
  form,
}) => {
  return (
    <Modal
      title="Add TOTP"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="TOTP Setup"
          description="Use an authenticator app like Google Authenticator or Authy to generate time-based codes."
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
            <Input placeholder="e.g., Google Authenticator" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Setup TOTP
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

