/**
 * Availability Modal Component
 * 
 * Form for managing sitter availability.
 */

import React from 'react';
import { Modal, Form, Select, Switch, TimePicker, InputNumber, Space, Button } from 'antd';
import type { FormInstance } from 'antd';

const { Option } = Select;

interface AvailabilityModalProps {
  open: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const AvailabilityModal: React.FC<AvailabilityModalProps> = ({
  open,
  form,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Manage Availability"
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
          name="dayOfWeek"
          label="Day of Week"
          rules={[{ required: true, message: 'Please select day' }]}
        >
          <Select>
            <Option value={0}>Sunday</Option>
            <Option value={1}>Monday</Option>
            <Option value={2}>Tuesday</Option>
            <Option value={3}>Wednesday</Option>
            <Option value={4}>Thursday</Option>
            <Option value={5}>Friday</Option>
            <Option value={6}>Saturday</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="isAvailable"
          label="Available"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item
          name="startTime"
          label="Start Time"
          rules={[{ required: true, message: 'Please select start time' }]}
        >
          <TimePicker style={{ width: '100%' }} format="HH:mm" />
        </Form.Item>
        
        <Form.Item
          name="endTime"
          label="End Time"
          rules={[{ required: true, message: 'Please select end time' }]}
        >
          <TimePicker style={{ width: '100%' }} format="HH:mm" />
        </Form.Item>
        
        <Form.Item
          name="maxBookings"
          label="Maximum Bookings"
          rules={[{ required: true, message: 'Please enter max bookings' }]}
        >
          <InputNumber min={1} max={20} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="serviceTypes"
          label="Service Types"
          rules={[{ required: true, message: 'Please select service types' }]}
        >
          <Select mode="multiple">
            <Option value="dog-walking">Dog Walking</Option>
            <Option value="pet-sitting">Pet Sitting</Option>
            <Option value="overnight-care">Overnight Care</Option>
            <Option value="drop-in-visit">Drop-in Visit</Option>
            <Option value="transport">Transport</Option>
          </Select>
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Update Availability
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

