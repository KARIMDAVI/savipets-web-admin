import React, { useState } from 'react';
import { Button, Descriptions, Form, Input, Select, Space, Tag } from 'antd';
import type { User } from '@/types';
import { getRoleColor, getRoleDisplayName } from '@/utils/roleUtils';

const { Option } = Select;
const { TextArea } = Input;

export interface RoleChangeFormProps {
  user: User;
  onCancel: () => void;
  onSave: (userId: string, newRole: string, reason: string) => void;
}

const RoleChangeForm: React.FC<RoleChangeFormProps> = ({ user, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const [newRole, setNewRole] = useState(user.role);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSave(user.id, values.role, values.reason);
    } catch (error) {
      // validation errors are already displayed via antd form
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ role: user.role, reason: '' }}
    >
      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="User">
          {user.firstName} {user.lastName}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {user.email}
        </Descriptions.Item>
        <Descriptions.Item label="Current Role">
          <Tag color={getRoleColor(user.role)}>
            {getRoleDisplayName(user.role)}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <Form.Item
        label="New Role"
        name="role"
        rules={[{ required: true, message: 'Please select a role' }]}
        style={{ marginTop: 20 }}
      >
        <Select
          value={newRole}
          onChange={setNewRole}
          placeholder="Select new role"
        >
          <Option value="petOwner">Pet Owner</Option>
          <Option value="petSitter">Pet Sitter</Option>
          <Option value="admin">Admin</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Reason for Change"
        name="reason"
        rules={[
          { required: true, message: 'Please provide a reason for the role change' },
          { min: 10, message: 'Reason must be at least 10 characters' }
        ]}
      >
        <TextArea
          rows={4}
          placeholder="Explain why you are changing this user's role. This will be logged for audit purposes."
        />
      </Form.Item>

      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" onClick={handleSubmit}>
          Change Role
        </Button>
      </Space>
    </Form>
  );
};

export default RoleChangeForm;
