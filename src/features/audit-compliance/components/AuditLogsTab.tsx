/**
 * Audit Logs Tab Component
 * 
 * Displays and filters audit logs.
 */

import React from 'react';
import { Card, Row, Col, Input, Select, Button, Space, Table, Tag, Avatar, Typography, Badge, message } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { AuditLog } from '../types/audit-compliance.types';
import { getSeverityColor, getCategoryIcon } from '../utils/auditHelpers';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

interface AuditLogsTabProps {
  auditLogs: AuditLog[];
  filteredLogs: AuditLog[];
  loading: boolean;
  searchTerm: string;
  categoryFilter: string;
  severityFilter: string;
  onSearchChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onSeverityFilterChange: (value: string) => void;
  onViewLog: (log: AuditLog) => void;
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({
  auditLogs,
  filteredLogs,
  loading,
  searchTerm,
  categoryFilter,
  severityFilter,
  onSearchChange,
  onCategoryFilterChange,
  onSeverityFilterChange,
  onViewLog,
}) => {
  const auditColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: Date) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a: AuditLog, b: AuditLog) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: 'User',
      key: 'user',
      render: (record: AuditLog) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <Text>{record.userName}</Text>
        </Space>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: AuditLog) => (
        <Space>
          {getCategoryIcon(record.category)}
          <Text strong>{record.action}</Text>
        </Space>
      ),
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag>{category.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: AuditLog) => (
        <Badge 
          status={record.success ? 'success' : 'error'} 
          text={record.success ? 'Success' : 'Failed'} 
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: AuditLog) => (
        <Button
          type="text"
          icon={<ExportOutlined />}
          onClick={() => onViewLog(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      {/* Controls */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              value={categoryFilter}
              onChange={onCategoryFilterChange}
              style={{ width: '100%' }}
            >
              <Option value="all">All Categories</Option>
              <Option value="auth">Authentication</Option>
              <Option value="data_access">Data Access</Option>
              <Option value="data_modification">Data Modification</Option>
              <Option value="system">System</Option>
              <Option value="security">Security</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              value={severityFilter}
              onChange={onSeverityFilterChange}
              style={{ width: '100%' }}
            >
              <Option value="all">All Severities</Option>
              <Option value="critical">Critical</Option>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => message.info('Refreshing audit logs...')}
              >
                Refresh
              </Button>
              <Button
                icon={<ExportOutlined />}
                disabled={filteredLogs.length === 0}
              >
                Export
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <Table
          columns={auditColumns}
          dataSource={filteredLogs}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} logs`,
          }}
          scroll={{ x: 'max-content' }} // Mobile-friendly horizontal scroll
        />
      </Card>
    </>
  );
};

