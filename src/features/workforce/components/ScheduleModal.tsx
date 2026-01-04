/**
 * Schedule Modal Component
 * 
 * Form for creating sitter schedules.
 */

import React from 'react';
import { Modal, Form, DatePicker, TimePicker, InputNumber, Space, Button } from 'antd';
import type { FormInstance } from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';

interface ScheduleModalProps {
  open: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  open,
  form,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Create Schedule"
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
          name="date"
          label="Date"
          rules={[{ required: true, message: 'Please select date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="shifts"
          label="Shifts"
          rules={[{ required: true, message: 'Please add at least one shift' }]}
        >
          <Form.List name="shifts">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'startTime']}
                      rules={[{ required: true, message: 'Missing start time' }]}
                    >
                      <TimePicker placeholder="Start" format="HH:mm" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'endTime']}
                      rules={[{ required: true, message: 'Missing end time' }]}
                    >
                      <TimePicker placeholder="End" format="HH:mm" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'maxBookings']}
                      rules={[{ required: true, message: 'Missing max bookings' }]}
                    >
                      <InputNumber placeholder="Max" min={1} max={20} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Shift
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Create Schedule
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

