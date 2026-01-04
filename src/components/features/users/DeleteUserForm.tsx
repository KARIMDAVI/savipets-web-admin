import React from 'react';
import { Button, Form, Input, Space, Typography } from 'antd';
import type { User } from '@/types';

const { Text } = Typography;
const { TextArea } = Input;

export interface DeleteUserFormProps {
  user: User;
  onCancel: () => void;
  onConfirm: (userId: string, reason: string) => void;
}

const DeleteUserForm: React.FC<DeleteUserFormProps> = ({ user, onCancel, onConfirm }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onConfirm(user.id, values.reason);
    } catch (error) {
      // validation errors already displayed by antd form
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Text>
        Are you sure you want to delete <strong>{user.firstName} {user.lastName}</strong> ({user.email})?
      </Text>
      <br />
      <br />
      <Text type="warning">
        This action cannot be undone. This will permanently delete the user's account and all associated data.
      </Text>

      <Form.Item
        label="Reason for Deletion"
        name="reason"
        rules={[
          { required: true, message: 'Please provide a reason for deletion' },
          { min: 10, message: 'Reason must be at least 10 characters' }
        ]}
        style={{ marginTop: 20 }}
      >
        <TextArea
          rows={4}
          placeholder="Explain why you are deleting this user. This will be logged for audit purposes."
        />
      </Form.Item>

      <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 20 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" danger onClick={handleSubmit}>
          Delete User
        </Button>
      </Space>
    </Form>
  );
};

export default DeleteUserForm;
