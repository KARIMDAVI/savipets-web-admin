/**
 * Schedule Report Modal Component
 * 
 * Modal form for scheduling a report.
 */

import React from 'react';
import { Modal, Form, Select, TimePicker, Button, Space } from 'antd';
import dayjs from 'dayjs';
import type { ReportTemplate } from '../types/reports.types';

const { Option } = Select;

interface ScheduleReportModalProps {
  visible: boolean;
  templates: ReportTemplate[];
  onCancel: () => void;
  onFinish: (values: any) => void;
  form: any;
}

export const ScheduleReportModal: React.FC<ScheduleReportModalProps> = ({
  visible,
  templates,
  onCancel,
  onFinish,
  form,
}) => {
  return (
    <Modal
      title="Schedule Report"
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
          name="template"
          label="Report Template"
          rules={[{ required: true, message: 'Please select template' }]}
        >
          <Select placeholder="Select a report template">
            {templates.map(template => (
              <Option key={template.id} value={template.id}>
                {template.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="frequency"
          label="Frequency"
          rules={[{ required: true, message: 'Please select frequency' }]}
        >
          <Select>
            <Option value="daily">Daily</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="monthly">Monthly</Option>
            <Option value="quarterly">Quarterly</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="time"
          label="Time"
          rules={[{ required: true, message: 'Please select time' }]}
        >
          <TimePicker style={{ width: '100%' }} format="HH:mm" />
        </Form.Item>
        
        <Form.Item
          name="format"
          label="Export Format"
          rules={[{ required: true, message: 'Please select format' }]}
        >
          <Select>
            <Option value="pdf">PDF</Option>
            <Option value="csv">CSV</Option>
            <Option value="excel">Excel</Option>
          </Select>
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Schedule Report
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

