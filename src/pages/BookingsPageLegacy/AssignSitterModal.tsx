/**
 * Assign Sitter Modal Component
 * 
 * Modal for assigning or updating sitter assignments for bookings.
 */

import React from 'react';
import { Modal, Form, Select, Button, Space, Popconfirm, Typography } from 'antd';
import type { Booking } from '@/types';

const { Option } = Select;
const { Text } = Typography;

interface AssignSitterModalProps {
  visible: boolean;
  booking: Booking | null;
  sitters: Array<{ id: string; firstName: string; lastName: string }>;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: { sitterId: string }) => Promise<void>;
  onUnassign: (bookingId: string) => Promise<void>;
}

export const AssignSitterModal: React.FC<AssignSitterModalProps> = ({
  visible,
  booking,
  sitters,
  loading,
  onCancel,
  onSubmit,
  onUnassign,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible && booking) {
      form.setFieldsValue({
        sitterId: booking.sitterId ?? undefined,
      });
    } else if (!visible) {
      form.resetFields();
    }
  }, [visible, booking, form]);

  return (
    <Modal
      title={booking?.sitterId ? 'Update Sitter Assignment' : 'Assign Sitter'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      {sitters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Text type="secondary" ellipsis={false}>No sitters available. Please add sitters first.</Text>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
        >
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
                {booking?.sitterId ? 'Update Sitter' : 'Assign Sitter'}
              </Button>
              {booking?.sitterId && (
                <Popconfirm
                  title="Remove sitter assignment?"
                  description="This booking will no longer have a sitter assigned."
                  okText="Yes, remove"
                  cancelText="No"
                  onConfirm={() => booking && onUnassign(booking.id)}
                >
                  <Button danger loading={loading}>
                    Unassign Sitter
                  </Button>
                </Popconfirm>
              )}
              <Button onClick={onCancel}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};


