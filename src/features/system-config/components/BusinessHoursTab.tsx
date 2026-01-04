/**
 * Business Hours Tab Component
 * 
 * Displays and manages business hours configuration.
 */

import React from 'react';
import { Card, Form, Row, Col, Switch, TimePicker, Button, Typography } from 'antd';
import type { BusinessHours } from '../types/system-config.types';
import type { FormInstance } from 'antd';

const { Text } = Typography;

interface BusinessHoursTabProps {
  businessHours: BusinessHours[];
  form: FormInstance;
  onUpdateBusinessHours: (values: any) => Promise<void>;
}

export const BusinessHoursTab: React.FC<BusinessHoursTabProps> = ({
  businessHours,
  form,
  onUpdateBusinessHours,
}) => {
  return (
    <Card title="Business Hours Configuration">
      <Form
        form={form}
        layout="vertical"
        onFinish={onUpdateBusinessHours}
      >
        {businessHours.map((day) => (
          <Card key={day.id} size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col span={4}>
                <Text strong>{day.dayName}</Text>
              </Col>
              <Col span={4}>
                <Form.Item
                  name={`${day.id}_isOpen`}
                  valuePropName="checked"
                  initialValue={day.isOpen}
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name={`${day.id}_openTime`}
                  initialValue={day.openTime}
                >
                  <TimePicker 
                    format="HH:mm" 
                    style={{ width: '100%' }}
                    disabled={!day.isOpen}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name={`${day.id}_closeTime`}
                  initialValue={day.closeTime}
                >
                  <TimePicker 
                    format="HH:mm" 
                    style={{ width: '100%' }}
                    disabled={!day.isOpen}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Button type="primary" htmlType="submit" size="small">
                  Save
                </Button>
              </Col>
            </Row>
          </Card>
        ))}
      </Form>
    </Card>
  );
};

