/**
 * Security Settings Modal Component
 * 
 * Modal for updating security settings.
 */

import React from 'react';
import { Modal, Form, InputNumber, Switch, Button, Space } from 'antd';
import type { SecuritySettings } from '../types/security.types';

interface SecuritySettingsModalProps {
  visible: boolean;
  loading: boolean;
  settings: SecuritySettings;
  onCancel: () => void;
  onFinish: (values: SecuritySettings) => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  visible,
  loading,
  settings,
  onCancel,
  onFinish,
}) => {
  return (
    <Modal
      title="Security Settings"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        layout="vertical"
        initialValues={settings}
        onFinish={onFinish}
      >
        <Form.Item
          name="sessionTimeout"
          label="Session Timeout (minutes)"
          rules={[{ required: true, message: 'Please enter session timeout' }]}
        >
          <InputNumber min={5} max={480} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="requireReauthForSensitive"
          label="Require Re-authentication for Sensitive Operations"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item
          name="maxConcurrentSessions"
          label="Maximum Concurrent Sessions"
          rules={[{ required: true, message: 'Please enter max sessions' }]}
        >
          <InputNumber min={1} max={10} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="allowRememberDevice"
          label="Allow Remember Device"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item
          name="loginNotifications"
          label="Login Notifications"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item
          name="suspiciousActivityAlerts"
          label="Suspicious Activity Alerts"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Settings
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

