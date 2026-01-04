import React from 'react';
import { Button, Card, Col, Input, Row, Select, Space, Tooltip } from 'antd';
import {
  ExportOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';

const { Option } = Select;

interface UserFiltersBarProps {
  onSearch: (value: string) => void;
  onRoleFilter: (roles: string[]) => void;
  onStatusFilter: (status?: boolean) => void;
  onRefresh: () => void;
  onExport: () => void;
  onAddUser: () => void;
  isRefreshing: boolean;
}

const UserFiltersBar: React.FC<UserFiltersBarProps> = ({
  onSearch,
  onRoleFilter,
  onStatusFilter,
  onRefresh,
  onExport,
  onAddUser,
  isRefreshing,
}) => (
  <Card style={{ marginBottom: 16 }}>
    <Row gutter={[16, 16]} align="middle">
      <Col xs={24} sm={8}>
        <Input.Search
          placeholder="Search users..."
          onSearch={onSearch}
          allowClear
          prefix={<SearchOutlined />}
        />
      </Col>
      <Col xs={24} sm={6}>
        <Select
          placeholder="Filter by role"
          style={{ width: '100%' }}
          mode="multiple"
          onChange={onRoleFilter}
          allowClear
        >
          <Option value="admin">Admin</Option>
          <Option value="petSitter">Pet Sitter</Option>
          <Option value="petOwner">Pet Owner</Option>
        </Select>
      </Col>
      <Col xs={24} sm={6}>
        <Select
          placeholder="Filter by status"
          style={{ width: '100%' }}
          onChange={onStatusFilter}
          allowClear
        >
          <Option value={true}>Active</Option>
          <Option value={false}>Inactive</Option>
        </Select>
      </Col>
      <Col xs={24} sm={4}>
        <Space>
          <Tooltip title="Refresh list">
            <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={isRefreshing} />
          </Tooltip>
          <Tooltip title="Export to CSV">
            <Button icon={<ExportOutlined />} onClick={onExport} />
          </Tooltip>
          <Tooltip title="Advanced filters coming soon">
            <Button icon={<FilterOutlined />} disabled />
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAddUser}>
            Add User
          </Button>
        </Space>
      </Col>
    </Row>
  </Card>
);

export default UserFiltersBar;
