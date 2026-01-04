/**
 * CreateBookingModal Component
 * 
 * Modal component for creating bookings on behalf of clients.
 * Extracted from BookingsPageRefactored for reusability and testability.
 */

import React, { useEffect, useMemo } from 'react';
import {
  Modal,
  Form,
  Select,
  Button,
  Space,
} from 'antd';
import type { User } from '@/types';
import { useBookingStore } from '../stores/useBookingStore';
import { useClientPets } from './CreateBookingModal/useClientPets';
import { useBookingFormSubmission } from './CreateBookingModal/useBookingFormSubmission';
import { RecurringBookingFields } from './CreateBookingModal/RecurringBookingFields';
import { BasicBookingFields } from './CreateBookingModal/BasicBookingFields';

const { Option } = Select;

interface CreateBookingModalProps {
  visible: boolean;
  onCancel: () => void;
  onCreateBooking: (data: AdminBookingCreate) => void;
  onCreateRecurringBooking: (data: AdminRecurringBookingCreate) => void;
  clients: User[];
  sitters: User[];
  isLoadingUsers?: boolean;
  authLoading?: boolean;
  isCreating?: boolean;
  isCreatingRecurring?: boolean;
}

export const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  visible,
  onCancel,
  onCreateBooking,
  onCreateRecurringBooking,
  clients,
  sitters,
  isLoadingUsers = false,
  authLoading = false,
  isCreating = false,
  isCreatingRecurring = false,
}) => {
  const [form] = Form.useForm();
  const selectedClientId = Form.useWatch('clientId', form);
  const formFrequency = Form.useWatch('frequency', form);

  // Store state
  const availablePets = useBookingStore(state => state.availablePets);
  const petOptionsLoading = useBookingStore(state => state.petOptionsLoading);
  const isRecurring = useBookingStore(state => state.isRecurring);
  const recurringFrequency = useBookingStore(state => state.recurringFrequency);

  // Store setters
  const setAvailablePets = useBookingStore(state => state.setAvailablePets);
  const setPetOptionsLoading = useBookingStore(state => state.setPetOptionsLoading);
  const setIsRecurring = useBookingStore(state => state.setIsRecurring);
  const setCreateBookingModalVisible = useBookingStore(state => state.setCreateBookingModalVisible);
  const resetCreateBookingForm = useBookingStore(state => state.resetCreateBookingForm);

  // Custom hooks
  const { previousSelectedClientRef } = useClientPets(selectedClientId, clients, authLoading, form);
  const { handleFinish } = useBookingFormSubmission(
    form,
    onCreateBooking,
    onCreateRecurringBooking,
    setAvailablePets,
    setPetOptionsLoading,
    previousSelectedClientRef
  );

  // Client options for select
  const clientOptions = useMemo(() => {
    return clients.map((client) => {
      const firstName = (client.firstName || '').trim();
      const lastName = (client.lastName || '').trim();
      const displayName = (client as any).displayName ? String((client as any).displayName).trim() : '';
      const computedName =
        [firstName, lastName].filter(Boolean).join(' ') ||
        displayName ||
        '';
      const email = (client.email || '').trim();
      const labelParts = [];
      if (computedName) {
        labelParts.push(computedName);
      }
      if (email) {
        labelParts.push(`(${email})`);
      }
      const label = labelParts.length > 0 ? labelParts.join(' ') : 'Unnamed Pet Owner';
      return {
        value: client.id,
        label,
        disabled: client.isActive === false,
      };
    });
  }, [clients]);

  // Sync form with store when modal opens
  useEffect(() => {
    if (visible) {
      if (recurringFrequency) {
        form.setFieldsValue({ frequency: recurringFrequency });
      }
      if (isRecurring !== undefined) {
        form.setFieldsValue({ isRecurring: isRecurring ? 'recurring' : 'single' });
      }
    }
  }, [visible, recurringFrequency, isRecurring, form]);

  const handleCancel = () => {
    setCreateBookingModalVisible(false);
    form.resetFields();
    resetCreateBookingForm();
    previousSelectedClientRef.current = null;
    onCancel();
  };

  return (
    <Modal
      title="Create Booking on Behalf of Client"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      loading={isCreating || isCreatingRecurring}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          paymentMethod: 'cash',
          duration: 30,
          frequency: recurringFrequency || 'weekly',
          isRecurring: isRecurring ? 'recurring' : 'single',
        }}
      >
        <BasicBookingFields
          form={form}
          clients={clients}
          sitters={sitters}
          selectedClientId={selectedClientId}
          availablePets={availablePets}
          petOptionsLoading={petOptionsLoading}
          isLoadingUsers={isLoadingUsers}
          authLoading={authLoading}
          clientOptions={clientOptions}
        />

        {/* Recurring Booking Option */}
        <Form.Item 
          label="Booking Type" 
          name="isRecurring"
          initialValue="single"
        >
          <Select 
            style={{ width: '100%' }}
            onChange={(value: 'single' | 'recurring') => {
              setIsRecurring(value === 'recurring');
              form.setFieldsValue({ isRecurring: value });
            }}
          >
            <Option value="single">Single Visit</Option>
            <Option value="recurring">Recurring Visits (Multiple Visits)</Option>
          </Select>
        </Form.Item>
        
        {(isRecurring || form.getFieldValue('isRecurring') === 'recurring') && (
          <RecurringBookingFields form={form} formFrequency={formFrequency} />
        )}

        {/* Submit */}
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={isCreating || isCreatingRecurring}>
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

