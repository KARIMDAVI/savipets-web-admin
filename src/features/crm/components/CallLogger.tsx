/**
 * Call Logger Component
 * 
 * Modal for logging phone calls with clients.
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  InputNumber,
  DatePicker,
  TimePicker,
  message,
} from 'antd';
import { PhoneOutlined, SaveOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { callService } from '../services/callService';
import { useAuth } from '@/contexts/AuthContext';
import dayjs, { type Dayjs } from 'dayjs';
import type { CallLogValues } from '../types/communication.types';
import type { User } from '@/types';

const { TextArea } = Input;
const { Option } = Select;

interface CallLoggerProps {
  visible: boolean;
  client: User | null;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const CallLogger: React.FC<CallLoggerProps> = ({
  visible,
  client,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [callStarted, setCallStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Log call mutation
  const logCallMutation = useMutation({
    mutationFn: async (values: CallLogValues) => {
      if (!user || !client) throw new Error('User or client not available');

      return callService.logCall({
        clientId: client.id,
        phoneNumber: values.phoneNumber,
        direction: values.direction,
        duration: values.duration,
        status: values.status,
        notes: values.notes,
        startedAt: values.startedAt,
        endedAt: values.endedAt,
        createdBy: user.id,
      });
    },
    onSuccess: () => {
      message.success('Call logged successfully');
      form.resetFields();
      setCallStarted(false);
      setStartTime(null);
      if (onSuccess) onSuccess();
      onCancel();
    },
    onError: (error) => {
      console.error('Call log error:', error);
      message.error('Failed to log call');
    },
  });

  const handleStartCall = () => {
    setCallStarted(true);
    setStartTime(new Date());
    form.setFieldsValue({
      startedAt: new Date(),
      status: 'completed',
    });
  };

  const handleEndCall = () => {
    if (startTime) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      form.setFieldsValue({
        endedAt: endTime,
        duration,
      });
    }
    setCallStarted(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const callValues: CallLogValues = {
        ...values,
        startedAt: values.startedAt instanceof dayjs
          ? values.startedAt.toDate()
          : values.startedAt instanceof Date
          ? values.startedAt
          : new Date(),
        endedAt: values.endedAt
          ? values.endedAt instanceof dayjs
            ? values.endedAt.toDate()
            : values.endedAt instanceof Date
            ? values.endedAt
            : new Date()
          : undefined,
      };
      await logCallMutation.mutateAsync(callValues);
    } catch (error) {
      // Validation errors handled by form
    }
  };

  useEffect(() => {
    if (visible && client) {
      form.setFieldsValue({
        phoneNumber: client.phoneNumber || '',
        direction: 'outbound',
        status: 'completed',
        startedAt: dayjs(),
      });
    }
  }, [visible, client, form]);

  return (
    <Modal
      title={
        <Space>
          <PhoneOutlined />
          <span>Log Call{client ? ` with ${client.firstName} ${client.lastName}` : ''}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        !callStarted ? (
          <Button key="start" type="primary" onClick={handleStartCall}>
            Start Call Timer
          </Button>
        ) : (
          <Button key="end" onClick={handleEndCall}>
            End Call
          </Button>
        ),
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSubmit}
          loading={logCallMutation.isPending}
        >
          Log Call
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="phoneNumber"
          label="Phone Number"
          rules={[{ required: true, message: 'Phone number is required' }]}
        >
          <Input placeholder="+1234567890" />
        </Form.Item>

        <Form.Item
          name="direction"
          label="Call Direction"
          rules={[{ required: true, message: 'Call direction is required' }]}
        >
          <Select>
            <Option value="inbound">Inbound</Option>
            <Option value="outbound">Outbound</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Call Status"
          rules={[{ required: true, message: 'Call status is required' }]}
        >
          <Select>
            <Option value="completed">Completed</Option>
            <Option value="missed">Missed</Option>
            <Option value="voicemail">Voicemail</Option>
            <Option value="busy">Busy</Option>
            <Option value="failed">Failed</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="startedAt"
          label="Call Started"
          rules={[{ required: true, message: 'Start time is required' }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
            disabled={callStarted}
          />
        </Form.Item>

        <Form.Item name="endedAt" label="Call Ended">
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
            disabled={callStarted}
          />
        </Form.Item>

        <Form.Item name="duration" label="Duration (seconds)">
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            placeholder="Call duration in seconds"
            disabled={callStarted}
          />
        </Form.Item>

        <Form.Item name="notes" label="Call Notes">
          <TextArea
            rows={4}
            placeholder="Notes about the call..."
            maxLength={1000}
            showCount
          />
        </Form.Item>

        {callStarted && startTime && (
          <Form.Item>
            <Space>
              <span>Call in progress...</span>
              <span style={{ fontWeight: 'bold' }}>
                Duration: {Math.floor((Date.now() - startTime.getTime()) / 1000)}s
              </span>
            </Space>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

