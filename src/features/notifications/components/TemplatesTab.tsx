/**
 * Templates Tab Component
 * 
 * Displays and manages notification templates.
 */

import React from 'react';
import { Card, Row, Col, Input, Select, Button, Space, Table, Badge, Tag, Typography, message } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { NotificationTemplate } from '../types/notifications.types';
import { getTypeIcon, getTypeColor, getCategoryColor } from '../utils/notificationHelpers';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

interface TemplatesTabProps {
  templates: NotificationTemplate[];
  filteredTemplates: NotificationTemplate[];
  loading: boolean;
  searchTerm: string;
  typeFilter: string;
  categoryFilter: string;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onAddTemplate: () => void;
  onViewTemplate: (template: NotificationTemplate) => void;
  onTestTemplate: () => void;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  templates,
  filteredTemplates,
  loading,
  searchTerm,
  typeFilter,
  categoryFilter,
  onSearchChange,
  onTypeFilterChange,
  onCategoryFilterChange,
  onAddTemplate,
  onViewTemplate,
  onTestTemplate,
}) => {
  const templateColumns = [
    {
      title: 'Template',
      key: 'template',
      render: (record: NotificationTemplate) => (
        <Space>
          {getTypeIcon(record.type)}
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.type.toUpperCase()} • {record.category}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)} icon={getTypeIcon(type)}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={getCategoryColor(category)}>
          {category.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: NotificationTemplate) => (
        <Badge 
          status={record.isActive ? 'success' : 'default'} 
          text={record.isActive ? 'Active' : 'Inactive'} 
        />
      ),
    },
    {
      title: 'Variables',
      key: 'variables',
      render: (record: NotificationTemplate) => (
        <Text type="secondary">
          {record.variables.length} variables
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: NotificationTemplate) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onViewTemplate(record)}
          >
            View
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
          >
            Edit
          </Button>
          <Button
            type="text"
            icon={<SendOutlined />}
            onClick={onTestTemplate}
          >
            Test
          </Button>
        </Space>
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
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              value={typeFilter}
              onChange={onTypeFilterChange}
              style={{ width: '100%' }}
            >
              <Option value="all">All Types</Option>
              <Option value="push">Push</Option>
              <Option value="email">Email</Option>
              <Option value="sms">SMS</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              value={categoryFilter}
              onChange={onCategoryFilterChange}
              style={{ width: '100%' }}
            >
              <Option value="all">All Categories</Option>
              <Option value="booking">Booking</Option>
              <Option value="payment">Payment</Option>
              <Option value="system">System</Option>
              <Option value="marketing">Marketing</Option>
              <Option value="security">Security</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Space>
              <Button
                icon={<PlusOutlined />}
                onClick={onAddTemplate}
                type="primary"
              >
                Create
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => message.info('Refreshing templates...')}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Templates Table */}
      <Card>
        <Table
          columns={templateColumns}
          dataSource={filteredTemplates}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} templates`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </>
  );
};

