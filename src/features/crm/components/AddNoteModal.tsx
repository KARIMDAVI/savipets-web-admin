/**
 * Add Note Modal Component
 * 
 * Modal form for adding a note to a client.
 */

import React, { useMemo } from 'react';
import { Modal, Form, Select, Input, Button, Space } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { AddNoteFormValues } from '../types/crm.types';
import type { User, Pet } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

interface AddNoteModalProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: AddNoteFormValues) => void;
  form: FormInstance<AddNoteFormValues>;
  client?: User | null; // NEW: Client to get pets list
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  visible,
  onCancel,
  onFinish,
  form,
  client,
}) => {
  const clientPets = useMemo(() => client?.pets || [], [client?.pets]);
  const hasPets = clientPets.length > 0;
  return (
    <Modal
      title="Add Client Note"
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
          name="type"
          label="Note Type"
          rules={[{ required: true, message: 'Please select note type' }]}
        >
          <Select>
            <Option value="general">General</Option>
            <Option value="preference">Preference</Option>
            <Option value="issue">Issue</Option>
            <Option value="follow_up">Follow Up</Option>
            {hasPets && (
              <>
                <Option value="medical">Medical</Option>
                <Option value="behavior">Behavior</Option>
                <Option value="diet">Diet</Option>
              </>
            )}
          </Select>
        </Form.Item>

        {hasPets && (
          <Form.Item
            name="petId"
            label="Pet (optional - leave blank for client-level note)"
            tooltip="Select a pet to create a pet-specific note, or leave blank for a general client note"
          >
            <Select placeholder="Select a pet or leave blank" allowClear>
              {clientPets.map((pet: Pet) => (
                <Option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.species} {pet.breed ? `- ${pet.breed}` : ''})
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
        
        <Form.Item
          name="priority"
          label="Priority"
          rules={[{ required: true, message: 'Please select priority' }]}
        >
          <Select>
            <Option value="low">Low</Option>
            <Option value="medium">Medium</Option>
            <Option value="high">High</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="content"
          label="Note Content"
          rules={[
            { required: true, message: 'Please enter note content' },
            { max: 5000, message: 'Note content cannot exceed 5000 characters' },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Enter your note here..."
            maxLength={5000}
            showCount
          />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Add Note
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

