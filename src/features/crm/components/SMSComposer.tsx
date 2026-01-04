/**
 * SMS Composer Component
 * 
 * Modal for composing and sending SMS messages to clients.
 */

import React from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  message,
} from 'antd';
import { MessageOutlined, SendOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { smsService } from '../services/smsService';
import { useAuth } from '@/contexts/AuthContext';
import type { SMSComposeValues } from '../types/communication.types';
import type { User } from '@/types';

const { TextArea } = Input;

interface SMSComposerProps {
  visible: boolean;
  client: User | null;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const SMSComposer: React.FC<SMSComposerProps> = ({
  visible,
  client,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { user } = useAuth();

  // Send SMS mutation
  const sendSMSMutation = useMutation({
    mutationFn: async (values: SMSComposeValues) => {
      if (!user || !client) throw new Error('User or client not available');

      return smsService.sendSMS({
        clientId: client.id,
        to: values.to,
        from: '+1234567890', // TODO: Replace with actual SMS provider number
        message: values.message,
        createdBy: user.id,
      });
    },
    onSuccess: () => {
      message.success('SMS sent successfully');
      form.resetFields();
      if (onSuccess) onSuccess();
      onCancel();
    },
    onError: (error) => {
      console.error('SMS send error:', error);
      message.error('Failed to send SMS');
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await sendSMSMutation.mutateAsync(values);
    } catch (error) {
      // Validation errors handled by form
    }
  };

  return (
    <Modal
      title={
        <Space>
          <MessageOutlined />
          <span>Send SMS{client ? ` to ${client.firstName} ${client.lastName}` : ''}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="send"
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSubmit}
          loading={sendSMSMutation.isPending}
        >
          Send SMS
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          to: client?.phoneNumber || '',
        }}
      >
        <Form.Item
          name="to"
          label="Phone Number"
          rules={[
            { required: true, message: 'Phone number is required' },
            {
              pattern: /^[\d\s\-\+\(\)]+$/,
              message: 'Invalid phone number format',
            },
          ]}
        >
          <Input placeholder="+1234567890" />
        </Form.Item>

        <Form.Item
          name="message"
          label="Message"
          rules={[
            { required: true, message: 'Message is required' },
            { max: 160, message: 'SMS messages are limited to 160 characters' },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="SMS message (max 160 characters)..."
            showCount
            maxLength={160}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

