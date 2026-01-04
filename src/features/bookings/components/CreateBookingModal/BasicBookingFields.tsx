import React from 'react';
import { Form, Select, Input, InputNumber, DatePicker, Row, Col } from 'antd';
import dayjs from 'dayjs';
import type { User } from '@/types';
import { useBookingStore } from '../../stores/useBookingStore';

const { Option } = Select;
const { TextArea } = Input;

interface BasicBookingFieldsProps {
  form: any;
  clients: User[];
  sitters: User[];
  selectedClientId: string | undefined;
  availablePets: string[];
  petOptionsLoading: boolean;
  isLoadingUsers: boolean;
  authLoading: boolean;
  clientOptions: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const BasicBookingFields: React.FC<BasicBookingFieldsProps> = ({
  form,
  clients,
  sitters,
  selectedClientId,
  availablePets,
  petOptionsLoading,
  isLoadingUsers,
  authLoading,
  clientOptions,
}) => {
  const selectedPaymentMethod = useBookingStore(state => state.selectedPaymentMethod);
  const setSelectedPaymentMethod = useBookingStore(state => state.setSelectedPaymentMethod);
  const setAvailablePets = useBookingStore(state => state.setAvailablePets);

  return (
    <>
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

              setAvailablePets(Array.from(new Set([...availablePets, ...sanitized])));

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
            <Select onChange={setSelectedPaymentMethod}>
              <Option value="cash">💵 Cash (Received in Person)</Option>
              <Option value="check">📄 Check</Option>
              <Option value="invoice">📧 Send Invoice (Pay Later)</Option>
              <Option value="comp">🎁 Complimentary (No Charge)</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

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
        label="Price"
        name="price"
        rules={[{ required: true, message: 'Please enter price' }]}
      >
        <InputNumber
          prefix="$"
          min={0}
          precision={2}
          style={{ width: '100%' }}
          disabled={selectedPaymentMethod === 'comp'}
        />
      </Form.Item>

      <Form.Item label="Special Instructions" name="specialInstructions">
        <TextArea rows={2} placeholder="Any special requirements or notes for the sitter..." />
      </Form.Item>

      <Form.Item label="Admin Notes (Internal)" name="adminNotes">
        <TextArea
          rows={2}
          placeholder="Reason for manual booking, context, etc. (not visible to client)"
        />
      </Form.Item>
    </>
  );
};


