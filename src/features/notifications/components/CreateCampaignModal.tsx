/**
 * Create Campaign Modal Component
 * 
 * Form for creating a new notification campaign.
 */

import React from 'react';
import { Modal, Form, Input, Select, Radio, DatePicker, Space, Button } from 'antd';
import type { FormInstance } from 'antd';
import type { NotificationTemplate } from '../types/notifications.types';
import type { User } from '@/types';

const { Option } = Select;

interface CreateCampaignModalProps {
  open: boolean;
  form: FormInstance;
  templates: NotificationTemplate[];
  users: User[];
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  open,
  form,
  templates,
  users,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Create Notification Campaign"
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
          name="name"
          label="Campaign Name"
          rules={[{ required: true, message: 'Please enter campaign name' }]}
        >
          <Input placeholder="e.g., Welcome New Users" />
        </Form.Item>
        
        <Form.Item
          name="templateId"
          label="Template"
          rules={[{ required: true, message: 'Please select template' }]}
        >
          <Select placeholder="Select a template">
            {templates.map(template => (
              <Option key={template.id} value={template.id}>
                {template.name} ({template.type})
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="targetAudience"
          label="Target Audience"
          rules={[{ required: true, message: 'Please select target audience' }]}
        >
          <Radio.Group>
            <Radio value="all">All Users</Radio>
            <Radio value="pet_owners">Pet Owners</Radio>
            <Radio value="pet_sitters">Pet Sitters</Radio>
            <Radio value="custom">Custom List</Radio>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item
          name="targetUsers"
          label="Target Users (Custom only)"
          dependencies={['targetAudience']}
        >
          {({ getFieldValue }) => 
            getFieldValue('targetAudience') === 'custom' ? (
              <Select mode="multiple" placeholder="Select users">
                {users.map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </Option>
                ))}
              </Select>
            ) : null
          }
        </Form.Item>
        
        <Form.Item
          name="scheduledAt"
          label="Schedule (Optional)"
        >
          <DatePicker 
            showTime 
            style={{ width: '100%' }} 
            placeholder="Select date and time"
          />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Create Campaign
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

