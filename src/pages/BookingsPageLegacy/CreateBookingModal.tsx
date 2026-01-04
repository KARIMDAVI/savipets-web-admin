/**
 * Create Booking Modal Component
 * 
 * Modal for creating bookings on behalf of clients (both single and recurring).
 */

import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Select, InputNumber, Input, DatePicker, Card, Button, Space } from 'antd';
import type { FormInstance } from 'antd';
import dayjs from 'dayjs';
import type { DayScheduleConfig } from '@/features/bookings/types/bookings.types';
import { DayScheduleConfigurator } from './DayScheduleConfigurator';

const { Option } = Select;

// Helper function to get day name
const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || 'Unknown';
};

interface CreateBookingModalProps {
  visible: boolean;
  loading: boolean;
  form: FormInstance;
  clientOptions: Array<{ value: string; label: string; disabled?: boolean }>;
  availablePets: string[];
  petOptionsLoading: boolean;
  selectedClientId: string | undefined;
  sitters: Array<{ id: string; firstName: string; lastName: string; rating?: number }>;
  isLoadingUsers: boolean;
  authLoading: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  onClientChange: (clientId: string) => void;
  onPetsChange: (pets: string[]) => void;
}

export const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  visible,
  loading,
  form,
  clientOptions,
  availablePets,
  petOptionsLoading,
  selectedClientId,
  sitters,
  isLoadingUsers,
  authLoading,
  onCancel,
  onSubmit,
  onClientChange,
  onPetsChange,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
  const [isRecurring, setIsRecurring] = useState(false);
  const [numberOfVisits, setNumberOfVisits] = useState(1);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    if (!visible) {
      setIsRecurring(false);
      setSelectedPaymentMethod('cash');
      setNumberOfVisits(1);
      setRecurringFrequency('weekly');
    }
  }, [visible]);

  const handleCancel = () => {
    setIsRecurring(false);
    setSelectedPaymentMethod('cash');
    setNumberOfVisits(1);
    setRecurringFrequency('weekly');
    onCancel();
  };

  return (
    <Modal
      title="Create Booking on Behalf of Client"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      loading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          paymentMethod: 'cash',
          duration: 30,
        }}
      >
        <Form.Item
          label="Select Client (Pet Owner)"
          name="clientId"
          rules={[{ required: true, message: 'Please select a client' }]}
        >
          <Select
            showSearch
            placeholder="Search for pet owner by name or email"
            options={clientOptions}
            filterOption={(input, option) => {
              const query = input.toLowerCase();
              const labelText = String(option?.label ?? '').toLowerCase();
              const valueText = String(option?.value ?? '').toLowerCase();
              return labelText.includes(query) || valueText.includes(query);
            }}
            allowClear
            loading={isLoadingUsers || authLoading}
            notFoundContent={
              isLoadingUsers || authLoading
                ? 'Loading pet owners...'
                : 'No pet owners available'
            }
            onChange={onClientChange}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Service Type"
              name="serviceType"
              rules={[{ required: true, message: 'Please select service type' }]}
            >
              <Select>
                <Option value="dog-walking">Dog Walking</Option>
                <Option value="pet-sitting">Pet Sitting</Option>
                <Option value="overnight-care">Overnight Care</Option>
                <Option value="drop-in-visit">Drop-in Visit</Option>
                <Option value="transport">Transport</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Duration (minutes)"
              name="duration"
              rules={[{ required: true, message: 'Please enter duration' }]}
            >
              <InputNumber min={15} step={15} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Pets"
              name="pets"
              getValueFromEvent={(...args: unknown[]) => {
                const [rawValues] = args;
                if (!Array.isArray(rawValues)) {
                  return [];
                }
                const sanitized = (rawValues as unknown[])
                  .map(value => (typeof value === 'string' ? value.trim() : ''))
                  .filter(value => value.length > 0);

                onPetsChange(Array.from(new Set(sanitized)));

                return Array.from(new Set(sanitized));
              }}
            >
              <Select
                mode="tags"
                placeholder={
                  selectedClientId
                    ? 'Select or add pets for this booking'
                    : 'Select a client to load their pets'
                }
                style={{ width: '100%' }}
                tokenSeparators={[',']}
                options={availablePets.map(petName => ({
                  value: petName,
                  label: petName,
                }))}
                loading={petOptionsLoading}
                disabled={!selectedClientId}
                notFoundContent={
                  petOptionsLoading
                    ? 'Loading pets...'
                    : selectedClientId
                    ? 'No pets on file. Type to add new pets.'
                    : 'Select a client first'
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Payment Method"
              name="paymentMethod"
              rules={[{ required: true, message: 'Please select payment method' }]}
            >
              <Select
                onChange={(value) => {
                  setSelectedPaymentMethod(value);
                  if (value === 'comp') {
                    form.setFieldsValue({ price: 0 });
                  }
                }}
              >
                <Option value="cash">💵 Cash (Received in Person)</Option>
                <Option value="check">📄 Check</Option>
                <Option value="invoice">📧 Send Invoice (Pay Later)</Option>
                <Option value="comp">🎁 Complimentary (No Charge)</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item 
          label="Booking Type" 
          name="isRecurring"
          initialValue="single"
        >
          <Select 
            style={{ width: '100%' }}
            onChange={(value) => {
              setIsRecurring(value === 'recurring');
              form.setFieldsValue({ isRecurring: value });
            }}
          >
            <Option value="single">Single Visit</Option>
            <Option value="recurring">Recurring Visits (Multiple Visits)</Option>
          </Select>
        </Form.Item>
        
        {isRecurring && (
          <Card style={{ marginBottom: '16px', background: '#f9f9f9' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Number of Visits"
                  name="numberOfVisits"
                  rules={[{ required: true, message: 'Please enter number of visits' }]}
                  initialValue={5}
                >
                  <InputNumber 
                    min={2} 
                    max={30} 
                    style={{ width: '100%' }}
                    onChange={(val) => setNumberOfVisits(val || 5)}
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label="Frequency"
                  name="frequency"
                  rules={[{ required: true, message: 'Please select frequency' }]}
                  initialValue="weekly"
                >
                  <Select onChange={(val) => {
                    console.log('🔍 [DEBUG] Frequency changed in Legacy:', val);
                    setRecurringFrequency(val as 'daily' | 'weekly' | 'monthly');
                    form.setFieldsValue({ frequency: val });
                  }}>
                    <Option value="daily">Daily</Option>
                    <Option value="weekly">Weekly</Option>
                    <Option value="monthly">Monthly</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            {recurringFrequency === 'weekly' && (
              <Form.Item
                label="Weekly Schedule Configuration"
                name="daySchedules"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value || !Array.isArray(value)) {
                        return Promise.reject(new Error('Please configure at least one day'));
                      }
                      const enabledDays = value.filter((day: DayScheduleConfig) => day.enabled);
                      if (enabledDays.length === 0) {
                        return Promise.reject(new Error('Please enable at least one day'));
                      }
                      for (const day of enabledDays) {
                        if (!day.visitTimes || day.visitTimes.length !== day.numberOfVisits) {
                          return Promise.reject(new Error(`Please set all visit times for ${getDayName(day.dayOfWeek)}`));
                        }
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                initialValue={[
                  { dayOfWeek: 0, enabled: false, numberOfVisits: 1, visitTimes: [] },
                  { dayOfWeek: 1, enabled: false, numberOfVisits: 1, visitTimes: [] },
                  { dayOfWeek: 2, enabled: false, numberOfVisits: 1, visitTimes: [] },
                  { dayOfWeek: 3, enabled: false, numberOfVisits: 1, visitTimes: [] },
                  { dayOfWeek: 4, enabled: false, numberOfVisits: 1, visitTimes: [] },
                  { dayOfWeek: 5, enabled: false, numberOfVisits: 1, visitTimes: [] },
                  { dayOfWeek: 6, enabled: false, numberOfVisits: 1, visitTimes: [] },
                ]}
              >
                <DayScheduleConfigurator />
              </Form.Item>
            )}
            
            {recurringFrequency === 'monthly' && (
              <Form.Item 
                label="Days of Month"
                name="preferredDays"
              >
                <Select
                  mode="multiple"
                  placeholder="Select days of month (e.g., 1st, 15th, 30th) - Leave empty for same day each month"
                  style={{ width: '100%' }}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <Option key={day} value={day}>
                      {day}{day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </Card>
        )}

        <Form.Item
          label="Scheduled Date & Time"
          name="scheduledDate"
          rules={[{ required: true, message: 'Please select date and time' }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD h:mm A"
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
          />
        </Form.Item>

        <Form.Item label="Assign Sitter (Optional)" name="sitterId">
          <Select placeholder="Leave blank for later assignment" allowClear>
            {sitters.map(sitter => (
              <Option key={sitter.id} value={sitter.id}>
                {sitter.firstName} {sitter.lastName} - Rating: {sitter.rating || 'N/A'}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.paymentMethod !== currentValues.paymentMethod
          }
        >
          {({ getFieldValue }) => {
            const paymentMethod = getFieldValue('paymentMethod') || selectedPaymentMethod;
            const isComp = paymentMethod === 'comp';
            return (
              <Form.Item
                label="Price"
                name="price"
                rules={[
                  {
                    required: !isComp,
                    message: 'Please enter price',
                  },
                ]}
                initialValue={0}
              >
                <InputNumber
                  prefix="$"
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  disabled={isComp}
                />
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item label="Special Instructions" name="specialInstructions">
          <Input.TextArea rows={2} placeholder="Any special requirements or notes for the sitter..." />
        </Form.Item>

        <Form.Item label="Admin Notes (Internal)" name="adminNotes">
          <Input.TextArea
            rows={2}
            placeholder="Reason for manual booking, context, etc. (not visible to client)"
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Booking
            </Button>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

