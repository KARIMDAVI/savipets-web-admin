/**
 * Send Message Modal Component
 * 
 * Allows admin to send in-app messages to clients.
 */

import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import type { User } from '@/types';
import { crmClientsService } from '@/services/crm/CRMClientsService';
import { useAuth } from '@/contexts/AuthContext';

const { TextArea } = Input;

interface SendMessageModalProps {
  visible: boolean;
  client: User | null;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  visible,
  client,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!client || !user?.id) {
      message.error('Client or admin information is missing');
      return;
    }

    try {
      const values = await form.validateFields();
      setLoading(true);

      await crmClientsService.sendMessageToClient(
        user.id,
        client.id,
        values.message
      );

      message.success('Message sent successfully');
      form.resetFields();
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('Error sending message:', error);
      message.error(
        error instanceof Error
          ? error.message
          : 'Failed to send message. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <span>
          <MessageOutlined /> Send Message to {client?.firstName}{' '}
          {client?.lastName}
        </span>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="send"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Send Message
        </Button>,
      ]}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="message"
          label="Message"
          rules={[
            { required: true, message: 'Please enter a message' },
            {
              max: 2000,
              message: 'Message must be 2000 characters or less',
            },
          ]}
        >
          <TextArea
            rows={6}
            placeholder="Type your message here..."
            showCount
            maxLength={2000}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

