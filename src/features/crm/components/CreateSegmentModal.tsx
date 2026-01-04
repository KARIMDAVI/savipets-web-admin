/**
 * Create Segment Modal Component
 * 
 * Modal form for creating a new client segment.
 */

import React from 'react';
import { Modal, Form, Input, InputNumber, Button, Space } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { CreateSegmentFormValues } from '../types/crm.types';

interface CreateSegmentModalProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: CreateSegmentFormValues) => void; // FIXED: Changed from any
  form: FormInstance<CreateSegmentFormValues>; // FIXED: Changed from any
}

export const CreateSegmentModal: React.FC<CreateSegmentModalProps> = ({
  visible,
  onCancel,
  onFinish,
  form,
}) => {
  return (
    <Modal
      title="Create Client Segment"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="name"
          label="Segment Name"
          rules={[{ required: true, message: 'Please enter segment name' }]}
        >
          <Input placeholder="e.g., VIP Clients" />
        </Form.Item>
        
        <Form.Item
          name="minBookings"
          label="Minimum Bookings"
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="minSpent"
          label="Minimum Amount Spent"
        >
          <InputNumber min={0} precision={2} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="maxDaysSinceLastBooking"
          label="Days Since Last Booking"
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="rating"
          label="Minimum Rating"
        >
          <InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Create Segment
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

