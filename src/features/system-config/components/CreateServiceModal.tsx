/**
 * Create Service Modal Component
 * 
 * Form for creating a new service type.
 */

import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, Row, Col, Space, Button } from 'antd';
import type { FormInstance } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

interface CreateServiceModalProps {
  open: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const CreateServiceModal: React.FC<CreateServiceModalProps> = ({
  open,
  form,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Create Service Type"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Form.Item
          name="name"
          label="Service Name"
          rules={[{ required: true, message: 'Please enter service name' }]}
        >
          <Input placeholder="e.g., Dog Walking" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea rows={3} placeholder="Describe the service" />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select>
                <Option value="walking">Walking</Option>
                <Option value="sitting">Sitting</Option>
                <Option value="grooming">Grooming</Option>
                <Option value="transport">Transport</Option>
                <Option value="overnight">Overnight</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="duration"
              label="Duration (minutes)"
              rules={[{ required: true, message: 'Please enter duration' }]}
            >
              <InputNumber min={15} max={1440} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="basePrice"
              label="Base Price ($)"
              rules={[{ required: true, message: 'Please enter base price' }]}
            >
              <InputNumber min={0} precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="pricePerHour"
              label="Price Per Hour ($)"
            >
              <InputNumber min={0} precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="maxPets"
              label="Maximum Pets"
              rules={[{ required: true, message: 'Please enter max pets' }]}
            >
              <InputNumber min={1} max={10} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="icon"
              label="Icon"
              rules={[{ required: true, message: 'Please enter icon' }]}
            >
              <Input placeholder="e.g., 🐕" />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="requiresSpecialSkills"
          label="Requires Special Skills"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item
          name="isActive"
          label="Active"
          valuePropName="checked"
        >
          <Switch defaultChecked />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Create Service
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

