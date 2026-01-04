/**
 * Bulk Actions Toolbar Component
 * 
 * Toolbar for performing bulk operations on selected clients.
 */

import React, { useState } from 'react';
import {
  Space,
  Button,
  Dropdown,
  Modal,
  Form,
  Input,
  Select,
  message,
  Badge,
  Popconfirm,
} from 'antd';
import {
  TagOutlined,
  FileTextOutlined,
  UserOutlined,
  ExportOutlined,
  DeleteOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ClientTag, ClientSegment } from '../types/crm.types';
import type { ClientNote } from '../types/crm.types';
import { useBulkActions } from '../hooks/useBulkActions';

const { TextArea } = Input;

interface BulkActionsToolbarProps {
  selectedCount: number;
  selectedClientIds: string[];
  tags: ClientTag[];
  segments: ClientSegment[];
  onBulkExport?: (clientIds: string[]) => void;
  onClearSelection: () => void;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  selectedClientIds,
  tags,
  segments,
  onBulkExport,
  onClearSelection,
}) => {
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [segmentModalVisible, setSegmentModalVisible] = useState(false);
  const [tagForm] = Form.useForm();
  const [noteForm] = Form.useForm();
  const [segmentForm] = Form.useForm();

  const {
    bulkTagClients,
    bulkCreateNotes,
    bulkAssignSegment,
    bulkRemoveTags,
    isLoading,
  } = useBulkActions();

  const handleBulkTag = async (values: { tagIds: string[] }) => {
    try {
      await bulkTagClients.mutateAsync({
        clientIds: selectedClientIds,
        tagIds: values.tagIds,
      });
      setTagModalVisible(false);
      tagForm.resetFields();
      onClearSelection();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleBulkNote = async (values: {
    content: string;
    type: ClientNote['type'];
    priority: ClientNote['priority'];
  }) => {
    try {
      await bulkCreateNotes.mutateAsync({
        clientIds: selectedClientIds,
        ...values,
      });
      setNoteModalVisible(false);
      noteForm.resetFields();
      onClearSelection();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleBulkSegment = async (values: { segmentId: string }) => {
    try {
      await bulkAssignSegment.mutateAsync({
        clientIds: selectedClientIds,
        segmentId: values.segmentId,
      });
      setSegmentModalVisible(false);
      segmentForm.resetFields();
      onClearSelection();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleBulkExport = () => {
    if (onBulkExport) {
      onBulkExport(selectedClientIds);
    }
  };

  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'remove-tags',
      label: 'Remove Tags',
      icon: <DeleteOutlined />,
      onClick: () => {
        Modal.confirm({
          title: 'Remove Tags',
          content: (
            <Form form={tagForm} layout="vertical">
              <Form.Item
                name="tagIds"
                label="Select tags to remove"
                rules={[{ required: true, message: 'Please select at least one tag' }]}
              >
                <Select mode="multiple" placeholder="Select tags">
                  {tags.map((tag) => (
                    <Select.Option key={tag.id} value={tag.id}>
                      <span style={{ color: tag.color }}>{tag.name}</span>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          ),
          onOk: async () => {
            const values = await tagForm.validateFields();
            try {
              await bulkRemoveTags.mutateAsync({
                clientIds: selectedClientIds,
                tagIds: values.tagIds,
              });
              tagForm.resetFields();
              onClearSelection();
            } catch (error) {
              // Error handled by hook
            }
          },
        });
      },
    },
  ];

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#e6f7ff',
          border: '1px solid #91d5ff',
          borderRadius: '4px',
          marginBottom: '16px',
        }}
      >
        <Space>
          <Badge count={selectedCount} showZero>
            <span style={{ fontWeight: 500 }}>Selected: {selectedCount} client(s)</span>
          </Badge>
          <Button
            type="link"
            size="small"
            onClick={onClearSelection}
            style={{ padding: 0 }}
          >
            Clear selection
          </Button>
        </Space>
        <div style={{ marginTop: '8px' }}>
          <Space wrap>
            <Button
              icon={<TagOutlined />}
              onClick={() => setTagModalVisible(true)}
              loading={isLoading}
            >
              Add Tags
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => setNoteModalVisible(true)}
              loading={isLoading}
            >
              Add Note
            </Button>
            <Button
              icon={<UserOutlined />}
              onClick={() => setSegmentModalVisible(true)}
              loading={isLoading}
            >
              Assign Segment
            </Button>
            {onBulkExport && (
              <Button
                icon={<ExportOutlined />}
                onClick={handleBulkExport}
              >
                Export Selected
              </Button>
            )}
            <Dropdown menu={{ items: moreMenuItems }} trigger={['click']}>
              <Button icon={<MoreOutlined />}>More</Button>
            </Dropdown>
          </Space>
        </div>
      </div>

      {/* Bulk Tag Modal */}
      <Modal
        title={`Add Tags to ${selectedCount} Client(s)`}
        open={tagModalVisible}
        onCancel={() => {
          setTagModalVisible(false);
          tagForm.resetFields();
        }}
        onOk={() => tagForm.submit()}
        confirmLoading={bulkTagClients.isPending}
      >
        <Form form={tagForm} onFinish={handleBulkTag} layout="vertical">
          <Form.Item
            name="tagIds"
            label="Select tags to apply"
            rules={[{ required: true, message: 'Please select at least one tag' }]}
          >
            <Select mode="multiple" placeholder="Select tags">
              {tags.map((tag) => (
                <Select.Option key={tag.id} value={tag.id}>
                  <span style={{ color: tag.color }}>{tag.name}</span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Note Modal */}
      <Modal
        title={`Add Note to ${selectedCount} Client(s)`}
        open={noteModalVisible}
        onCancel={() => {
          setNoteModalVisible(false);
          noteForm.resetFields();
        }}
        onOk={() => noteForm.submit()}
        confirmLoading={bulkCreateNotes.isPending}
        width={600}
      >
        <Form form={noteForm} onFinish={handleBulkNote} layout="vertical">
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
              placeholder="Enter note content..."
              showCount
              maxLength={5000}
            />
          </Form.Item>
          <Form.Item
            name="type"
            label="Note Type"
            rules={[{ required: true, message: 'Please select note type' }]}
            initialValue="general"
          >
            <Select>
              <Select.Option value="general">General</Select.Option>
              <Select.Option value="preference">Preference</Select.Option>
              <Select.Option value="issue">Issue</Select.Option>
              <Select.Option value="follow_up">Follow Up</Select.Option>
              <Select.Option value="medical">Medical</Select.Option>
              <Select.Option value="behavior">Behavior</Select.Option>
              <Select.Option value="diet">Diet</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority' }]}
            initialValue="medium"
          >
            <Select>
              <Select.Option value="low">Low</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="high">High</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Segment Modal */}
      <Modal
        title={`Assign Segment to ${selectedCount} Client(s)`}
        open={segmentModalVisible}
        onCancel={() => {
          setSegmentModalVisible(false);
          segmentForm.resetFields();
        }}
        onOk={() => segmentForm.submit()}
        confirmLoading={bulkAssignSegment.isPending}
      >
        <Form form={segmentForm} onFinish={handleBulkSegment} layout="vertical">
          <Form.Item
            name="segmentId"
            label="Select Segment"
            rules={[{ required: true, message: 'Please select a segment' }]}
          >
            <Select placeholder="Select segment">
              {segments.map((segment) => (
                <Select.Option key={segment.id} value={segment.id}>
                  {segment.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

