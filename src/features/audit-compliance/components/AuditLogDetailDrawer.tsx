/**
 * Audit Log Detail Drawer Component
 * 
 * Displays detailed information about an audit log entry.
 */

import React from 'react';
import { Drawer, Descriptions, Tag, Badge, Space, Typography, Divider } from 'antd';
import dayjs from 'dayjs';
import type { AuditLog } from '../types/audit-compliance.types';
import { getSeverityColor, getCategoryIcon } from '../utils/auditHelpers';

const { Title, Text } = Typography;

interface AuditLogDetailDrawerProps {
  log: AuditLog | null;
  visible: boolean;
  onClose: () => void;
}

export const AuditLogDetailDrawer: React.FC<AuditLogDetailDrawerProps> = ({
  log,
  visible,
  onClose,
}) => {
  if (!log) return null;

  return (
    <Drawer
      title="Audit Log Details"
      placement="right"
      onClose={onClose}
      open={visible}
      width={600}
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Timestamp">
          {dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>
        <Descriptions.Item label="User">
          {log.userName} ({log.userId})
        </Descriptions.Item>
        <Descriptions.Item label="Action">
          <Space>
            {getCategoryIcon(log.category)}
            <Text strong>{log.action}</Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Resource">
          {log.resource} ({log.resourceId})
        </Descriptions.Item>
        <Descriptions.Item label="Severity">
          <Tag color={getSeverityColor(log.severity)}>
            {log.severity.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Badge 
            status={log.success ? 'success' : 'error'} 
            text={log.success ? 'Success' : 'Failed'} 
          />
        </Descriptions.Item>
        <Descriptions.Item label="IP Address">
          {log.ipAddress}
        </Descriptions.Item>
        <Descriptions.Item label="User Agent">
          <Text code style={{ fontSize: '12px' }}>
            {log.userAgent}
          </Text>
        </Descriptions.Item>
        {log.errorMessage && (
          <Descriptions.Item label="Error Message">
            <Text type="danger">{log.errorMessage}</Text>
          </Descriptions.Item>
        )}
      </Descriptions>
      
      <Divider />
      
      <Title level={4}>Action Details</Title>
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '12px', 
        borderRadius: '4px',
        fontSize: '12px',
        overflow: 'auto'
      }}>
        {JSON.stringify(log.details, null, 2)}
      </pre>
    </Drawer>
  );
};

