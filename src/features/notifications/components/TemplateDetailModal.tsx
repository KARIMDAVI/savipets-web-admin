/**
 * Template Detail Modal Component
 * 
 * Displays detailed information about a notification template.
 */

import React from 'react';
import { Modal, Descriptions, Tag, Badge, Divider, Typography, Space } from 'antd';
import type { NotificationTemplate } from '../types/notifications.types';
import { getTypeIcon, getTypeColor, getCategoryColor } from '../utils/notificationHelpers';

const { Title, Text } = Typography;

interface TemplateDetailModalProps {
  template: NotificationTemplate | null;
  onClose: () => void;
}

export const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  template,
  onClose,
}) => {
  if (!template) return null;

  return (
    <Modal
      title={`Template: ${template.name}`}
      open={!!template}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Name">
          {template.name}
        </Descriptions.Item>
        <Descriptions.Item label="Type">
          <Tag color={getTypeColor(template.type)} icon={getTypeIcon(template.type)}>
            {template.type.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Category">
          <Tag color={getCategoryColor(template.category)}>
            {template.category.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Badge 
            status={template.isActive ? 'success' : 'default'} 
            text={template.isActive ? 'Active' : 'Inactive'} 
          />
        </Descriptions.Item>
        {template.subject && (
          <Descriptions.Item label="Subject" span={2}>
            {template.subject}
          </Descriptions.Item>
        )}
      </Descriptions>
      
      <Divider />
      
      <Title level={4}>Content</Title>
      <div style={{ 
        background: '#f5f5f5', 
        padding: '12px', 
        borderRadius: '4px',
        marginBottom: '16px'
      }}>
        <Text>{template.content}</Text>
      </div>
      
      <Title level={4}>Variables</Title>
      <Space wrap>
        {template.variables.map(variable => (
          <Tag key={variable} color="blue">
            {`{{${variable}}}`}
          </Tag>
        ))}
      </Space>
    </Modal>
  );
};

