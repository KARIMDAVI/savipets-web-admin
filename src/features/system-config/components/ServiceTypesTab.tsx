/**
 * Service Types Tab Component
 * 
 * Displays and manages service types configuration.
 */

import React from 'react';
import { Card, Row, Col, Input, Select, Button, Space, Table, Badge, Tag, Typography } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ServiceType } from '../types/system-config.types';
import { getCategoryColor, getCategoryIcon } from '../utils/configHelpers';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

interface ServiceTypesTabProps {
  services: ServiceType[];
  loading: boolean;
  searchTerm: string;
  categoryFilter: string;
  onSearchChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onAddService: () => void;
  onViewService: (service: ServiceType) => void;
  onRefresh: () => void;
}

export const ServiceTypesTab: React.FC<ServiceTypesTabProps> = ({
  services,
  loading,
  searchTerm,
  categoryFilter,
  onSearchChange,
  onCategoryFilterChange,
  onAddService,
  onViewService,
  onRefresh,
}) => {
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const serviceColumns = [
    {
      title: 'Service',
      key: 'service',
      render: (record: ServiceType) => (
        <Space>
          <span style={{ fontSize: '24px' }}>{record.icon}</span>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={getCategoryColor(category)}>
          {getCategoryIcon(category)} {category.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (record: ServiceType) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.duration} min</Text>
          {record.pricePerHour && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ${record.pricePerHour}/hour
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Price',
      key: 'price',
      render: (record: ServiceType) => (
        <Text strong>${record.basePrice}</Text>
      ),
    },
    {
      title: 'Max Pets',
      dataIndex: 'maxPets',
      key: 'maxPets',
      render: (maxPets: number) => (
        <Badge count={maxPets} showZero color="blue" />
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: ServiceType) => (
        <Badge 
          status={record.isActive ? 'success' : 'default'} 
          text={record.isActive ? 'Active' : 'Inactive'} 
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: ServiceType) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onViewService(record)}
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
            icon={<DeleteOutlined />}
            danger
          >
            Delete
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
              placeholder="Search services..."
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
              <Option value="walking">Walking</Option>
              <Option value="sitting">Sitting</Option>
              <Option value="grooming">Grooming</Option>
              <Option value="transport">Transport</Option>
              <Option value="overnight">Overnight</Option>
            </Select>
          </Col>
          <Col xs={24} sm={10}>
            <Space>
              <Button
                icon={<PlusOutlined />}
                onClick={onAddService}
                type="primary"
              >
                Add Service
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Services Table */}
      <Card>
        <Table
          columns={serviceColumns}
          dataSource={filteredServices}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} services`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </>
  );
};

