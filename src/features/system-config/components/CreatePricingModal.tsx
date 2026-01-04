/**
 * Create Pricing Modal Component
 * 
 * Form for creating a new pricing tier.
 */

import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, Space, Button, Row, Col } from 'antd';
import type { FormInstance } from 'antd';
import type { ServiceType } from '../types/system-config.types';

const { TextArea } = Input;
const { Option } = Select;

interface CreatePricingModalProps {
  open: boolean;
  form: FormInstance;
  serviceTypes: ServiceType[];
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export const CreatePricingModal: React.FC<CreatePricingModalProps> = ({
  open,
  form,
  serviceTypes,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Create Pricing Tier"
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
          name="name"
          label="Pricing Tier Name"
          rules={[{ required: true, message: 'Please enter pricing tier name' }]}
        >
          <Input placeholder="e.g., Standard Walking" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea rows={3} placeholder="Describe the pricing tier" />
        </Form.Item>
        
        <Form.Item
          name="serviceTypeId"
          label="Service Type"
          rules={[{ required: true, message: 'Please select service type' }]}
        >
          <Select placeholder="Select a service type">
            {serviceTypes.map((service) => (
              <Option key={service.id} value={service.id}>
                {service.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="duration"
              label="Duration (minutes)"
              rules={[{ required: true, message: 'Please enter duration' }]}
            >
              <InputNumber min={15} max={1440} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="price"
              label="Price ($)"
              rules={[{ required: true, message: 'Please enter price' }]}
            >
              <InputNumber min={0} precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="minPets"
              label="Minimum Pets"
            >
              <InputNumber min={1} max={10} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maxPets"
              label="Maximum Pets"
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="timeOfDay"
          label="Time of Day"
        >
          <Select placeholder="Select time of day">
            <Option value="morning">Morning</Option>
            <Option value="afternoon">Afternoon</Option>
            <Option value="evening">Evening</Option>
            <Option value="night">Night</Option>
          </Select>
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
              Create Pricing Tier
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

