/**
 * AssignSitterModal Component
 * 
 * Modal for assigning a sitter to a booking.
 * Extracted from BookingsPageRefactored for reusability and testability.
 */

import React from 'react';
import { Modal, Form, Select, Button, Space, Typography, Popconfirm } from 'antd';
import type { User } from '@/types';

const { Option } = Select;
const { Text } = Typography;

interface AssignSitterModalProps {
  visible: boolean;
  onCancel: () => void;
  onAssign: (sitterId: string) => void;
  sitters: User[];
  loading?: boolean;
  initialSitterId?: string | null;
  onUnassign?: () => void;
}

export const AssignSitterModal: React.FC<AssignSitterModalProps> = ({
  visible,
  onCancel,
  onAssign,
  sitters,
  loading = false,
  initialSitterId = null,
  onUnassign,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        sitterId: initialSitterId ?? undefined,
      });
    } else {
      form.resetFields();
    }
  }, [visible, initialSitterId, form]);

  const handleFinish = (values: { sitterId: string }) => {
    onAssign(values.sitterId);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Assign Sitter"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
    >
      {sitters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Text type="secondary">No sitters available. Please add sitters first.</Text>
        </div>
      ) : (
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="sitterId"
            label="Select Sitter"
            rules={[{ required: true, message: 'Please select a sitter' }]}
          >
            <Select
              placeholder="Choose a sitter"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children).toLowerCase().includes(input.toLowerCase())
              }
              loading={loading}
            >
              {sitters.map(sitter => (
                <Option key={sitter.id} value={sitter.id}>
                  {`${sitter.firstName} ${sitter.lastName}`.trim()}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Assign Sitter
              </Button>
              {initialSitterId && onUnassign && (
                <Popconfirm
                  title="Remove sitter assignment?"
                  description="This booking will no longer have a sitter assigned."
                  okText="Yes, remove"
                  cancelText="No"
                  onConfirm={() => {
                    onUnassign();
                    form.resetFields();
                  }}
                >
                  <Button danger loading={loading}>
                    Unassign Sitter
                  </Button>
                </Popconfirm>
              )}
              <Button onClick={handleCancel}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

