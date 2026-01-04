/**
 * Create Feature Flag Modal Component
 * 
 * Form for creating a new feature flag.
 */

import React from 'react';
import { Modal, Form, Input, Select, Switch, Slider, Space, Button, Row, Col } from 'antd';
import type { FormInstance } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

interface CreateFeatureFlagModalProps {
  open: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const CreateFeatureFlagModal: React.FC<CreateFeatureFlagModalProps> = ({
  open,
  form,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Create Feature Flag"
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
          label="Feature Name"
          rules={[{ required: true, message: 'Please enter feature name' }]}
        >
          <Input placeholder="e.g., AI Sitter Assignment" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea rows={3} placeholder="Describe the feature" />
        </Form.Item>
        
        <Form.Item
          name="key"
          label="Feature Key"
          rules={[{ required: true, message: 'Please enter feature key' }]}
        >
          <Input placeholder="e.g., ai_assignment" />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="isEnabled"
              label="Enabled"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="rolloutPercentage"
              label="Rollout Percentage"
              rules={[{ required: true, message: 'Please enter rollout percentage' }]}
            >
              <Slider min={0} max={100} />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="userRoles"
          label="Target User Roles"
        >
          <Select mode="multiple" placeholder="Select user roles">
            <Option value="admin">Admin</Option>
            <Option value="pet_owner">Pet Owner</Option>
            <Option value="pet_sitter">Pet Sitter</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="platforms"
          label="Target Platforms"
        >
          <Select mode="multiple" placeholder="Select platforms">
            <Option value="web">Web</Option>
            <Option value="ios">iOS</Option>
            <Option value="android">Android</Option>
          </Select>
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Create Feature Flag
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

