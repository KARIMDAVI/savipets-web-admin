/**
 * Email Composer Component
 * 
 * Modal for composing and sending emails to clients.
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
  message,
} from 'antd';
import { MailOutlined, SendOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { emailService } from '../services/emailService';
import { useAuth } from '@/contexts/AuthContext';
import type { EmailComposeValues, EmailTemplate } from '../types/communication.types';
import type { User } from '@/types';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface EmailComposerProps {
  visible: boolean;
  client: User | null;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  visible,
  client,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>();

  // Fetch email templates
  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => emailService.getTemplates(),
    enabled: visible,
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (values: EmailComposeValues) => {
      if (!user || !client) throw new Error('User or client not available');

      let subject = values.subject;
      let body = values.body;

      // If using template, replace variables
      if (useTemplate && selectedTemplate) {
        const template = templates.find((t) => t.id === selectedTemplate);
        if (template) {
          const replaced = emailService.replaceTemplateVariables(template, {
            firstName: client.firstName || '',
            lastName: client.lastName || '',
            email: client.email || '',
            phoneNumber: client.phoneNumber || '',
          });
          subject = replaced.subject;
          body = replaced.body;
        }
      }

      return emailService.sendEmail({
        clientId: client.id,
        templateId: selectedTemplate,
        subject,
        body,
        to: values.to,
        from: user.email || 'noreply@savipets.com',
        createdBy: user.id,
      });
    },
    onSuccess: () => {
      message.success('Email sent successfully');
      form.resetFields();
      setUseTemplate(false);
      setSelectedTemplate(undefined);
      if (onSuccess) onSuccess();
      onCancel();
    },
    onError: (error) => {
      console.error('Email send error:', error);
      message.error('Failed to send email');
    },
  });

  // Load template when selected
  useEffect(() => {
    if (selectedTemplate && templates.length > 0) {
      const template = templates.find((t) => t.id === selectedTemplate);
      if (template) {
        const replaced = emailService.replaceTemplateVariables(template, {
          firstName: client?.firstName || '',
          lastName: client?.lastName || '',
          email: client?.email || '',
          phoneNumber: client?.phoneNumber || '',
        });
        form.setFieldsValue({
          subject: replaced.subject,
          body: replaced.body,
        });
      }
    }
  }, [selectedTemplate, templates, client, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await sendEmailMutation.mutateAsync(values);
    } catch (error) {
      // Validation errors handled by form
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setUseTemplate(true);
  };

  return (
    <Modal
      title={
        <Space>
          <MailOutlined />
          <span>Send Email{client ? ` to ${client.firstName} ${client.lastName}` : ''}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="send"
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSubmit}
          loading={sendEmailMutation.isPending}
        >
          Send Email
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          to: client?.email || '',
        }}
      >
        {templates.length > 0 && (
          <Form.Item label="Email Template">
            <Select
              placeholder="Select a template (optional)"
              allowClear
              onChange={handleTemplateChange}
              value={selectedTemplate}
            >
              {templates.map((template) => (
                <Option key={template.id} value={template.id}>
                  {template.name}
                  {template.category && (
                    <Text type="secondary" style={{ marginLeft: '8px' }}>
                      ({template.category})
                    </Text>
                  )}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="to"
          label="To"
          rules={[
            { required: true, message: 'Recipient email is required' },
            { type: 'email', message: 'Invalid email address' },
          ]}
        >
          <Input placeholder="recipient@example.com" />
        </Form.Item>

        <Form.Item
          name="subject"
          label="Subject"
          rules={[{ required: true, message: 'Email subject is required' }]}
        >
          <Input placeholder="Email subject" />
        </Form.Item>

        <Form.Item
          name="body"
          label="Message"
          rules={[{ required: true, message: 'Email body is required' }]}
        >
          <TextArea
            rows={10}
            placeholder="Email message..."
            showCount
            maxLength={5000}
          />
        </Form.Item>

        {useTemplate && selectedTemplate && (
          <Form.Item>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Template variables ({'{'}firstName{'}'}, {'{'}lastName{'}'}, etc.) have been replaced with client data.
            </Text>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

