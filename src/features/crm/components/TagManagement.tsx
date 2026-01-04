/**
 * Tag Management Component
 * 
 * UI for managing client tags - create, edit, delete, and assign tags to clients.
 */

import React, { useState } from 'react';
import { Card, Button, Space, Tag, Popconfirm, Modal, Form, Input, Select, ColorPicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TagOutlined } from '@ant-design/icons';
import type { ClientTag } from '../types/crm.types';
import { useAuth } from '@/contexts/AuthContext';
import { canCreateTag } from '../utils/crmPermissions';

const { Option } = Select;

interface TagManagementProps {
  tags: ClientTag[];
  onCreateTag: (tag: Omit<ClientTag, 'id'>) => Promise<ClientTag | void>;
  onUpdateTag: (tagId: string, updates: Partial<ClientTag>) => Promise<any>;
  onDeleteTag: (tagId: string) => Promise<any>;
}

export const TagManagement: React.FC<TagManagementProps> = ({
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}) => {
  const { user } = useAuth();
  const canManage = canCreateTag(user); // Check tag creation permission
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<ClientTag | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      // Handle ColorPicker value - it can be a string or color object
      // The getValueFromEvent should handle this, but we'll double-check
      let colorValue = '#1890ff';
      if (values.color) {
        if (typeof values.color === 'string') {
          colorValue = values.color;
        } else if (values.color && typeof values.color === 'object') {
          if (typeof values.color.toHexString === 'function') {
            colorValue = values.color.toHexString();
          } else if (typeof values.color.toHex === 'function') {
            colorValue = values.color.toHex();
          } else if (typeof values.color.hex === 'string') {
            colorValue = values.color.hex;
          }
        }
      }

      console.log('Creating tag with data:', { name: values.name, color: colorValue, category: values.category });

      const result = await onCreateTag({
        name: values.name?.trim() || '',
        color: colorValue,
        category: values.category || 'custom',
      });

      console.log('Tag creation result:', result);

      setCreateModalVisible(false);
      form.resetFields();
      // Don't show success message here - it's handled by the mutation
    } catch (error) {
      console.error('Tag creation error:', error);
      message.error(`Failed to create tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (tag: ClientTag) => {
    setEditingTag(tag);
    editForm.setFieldsValue({
      name: tag.name,
      color: tag.color,
      category: tag.category,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async (values: any) => {
    if (!editingTag) return;
    try {
      // Handle ColorPicker value - it can be a string or color object
      let colorValue = editingTag.color;
      if (values.color) {
        if (typeof values.color === 'string') {
          colorValue = values.color;
        } else if (values.color.toHexString) {
          colorValue = values.color.toHexString();
        } else if (values.color.toHex) {
          colorValue = values.color.toHex();
        } else if (values.color.hex) {
          colorValue = values.color.hex;
        }
      }

      await onUpdateTag(editingTag.id, {
        name: values.name,
        color: colorValue,
        category: values.category,
      });
      setEditModalVisible(false);
      setEditingTag(null);
      editForm.resetFields();
      // Don't show success message here - it's handled by the mutation
    } catch (error) {
      console.error('Tag update error:', error);
      // Error message is handled by the mutation
    }
  };

  const handleDelete = async (tagId: string) => {
    try {
      await onDeleteTag(tagId);
      message.success('Tag deleted successfully');
    } catch (error) {
      message.error('Failed to delete tag');
    }
  };

  if (!canManage) return null;

  return (
    <>
      <Card
        title={
          <Space>
            <TagOutlined />
            <span>Client Tags</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Create Tag
          </Button>
        }
        style={{ marginBottom: '24px' }}
      >
        <Space wrap>
          {tags.length === 0 ? (
            <span style={{ color: '#999' }}>No tags created yet</span>
          ) : (
            tags.map((tag) => (
              <Tag
                key={tag.id}
                color={tag.color}
                style={{ marginBottom: '8px', padding: '4px 12px', cursor: 'default' }}
              >
                <Space>
                  <span>{tag.name}</span>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(tag)}
                    style={{ color: 'inherit' }}
                  />
                  <Popconfirm
                    title="Delete this tag?"
                    description="This will remove the tag from all clients. This action cannot be undone."
                    onConfirm={() => handleDelete(tag.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      danger
                      style={{ color: 'inherit' }}
                    />
                  </Popconfirm>
                </Space>
              </Tag>
            ))
          )}
        </Space>
      </Card>

      {/* Create Tag Modal */}
      <Modal
        title="Create Tag"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Tag Name"
            rules={[{ required: true, message: 'Please enter tag name' }]}
          >
            <Input placeholder="e.g., VIP, Morning Walker" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select>
              <Option value="preference">Preference</Option>
              <Option value="behavior">Behavior</Option>
              <Option value="status">Status</Option>
              <Option value="custom">Custom</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="color"
            label="Color"
            initialValue="#1890ff"
            getValueFromEvent={(color) => {
              // Extract hex string from ColorPicker
              if (typeof color === 'string') return color;
              if (color?.toHexString) return color.toHexString();
              if (color?.toHex) return color.toHex();
              if (color?.hex) return color.hex;
              return '#1890ff';
            }}
          >
            <ColorPicker showText format="hex" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Tag Modal */}
      <Modal
        title="Edit Tag"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingTag(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            name="name"
            label="Tag Name"
            rules={[{ required: true, message: 'Please enter tag name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select>
              <Option value="preference">Preference</Option>
              <Option value="behavior">Behavior</Option>
              <Option value="status">Status</Option>
              <Option value="custom">Custom</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="color"
            label="Color"
            getValueFromEvent={(color) => {
              // Return the hex string directly
              if (typeof color === 'string') return color;
              if (color?.toHexString) return color.toHexString();
              if (color?.toHex) return color.toHex();
              if (color?.hex) return color.hex;
              return editingTag?.color || '#1890ff';
            }}
          >
            <ColorPicker showText format="hex" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update
              </Button>
              <Button onClick={() => {
                setEditModalVisible(false);
                setEditingTag(null);
                editForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

