/**
 * Client Filters Component
 * 
 * Search and filter controls for clients.
 */

import React from 'react';
import { Card, Row, Col, Input, Select, Button, Space } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ClientSegment } from '../types/crm.types';
import type { ExportFormat } from '../utils/exportUtils';
import { ExportMenu } from './ExportMenu';

const { Search } = Input;
const { Option } = Select;

interface ClientFiltersProps {
  searchTerm: string;
  selectedSegment: string;
  segments: ClientSegment[];
  loading: boolean;
  hasResults: boolean;
  onSearchChange: (value: string) => void;
  onSegmentChange: (value: string) => void;
  onRefresh: () => void;
  onExport: (format: ExportFormat) => void;
}

export const ClientFilters: React.FC<ClientFiltersProps> = ({
  searchTerm,
  selectedSegment,
  segments,
  loading,
  hasResults,
  onSearchChange,
  onSegmentChange,
  onRefresh,
  onExport,
}) => {
  return (
    <Card style={{ marginBottom: '16px' }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={8}>
          <Search
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: '100%' }}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col xs={24} sm={6}>
          <Select
            value={selectedSegment}
            onChange={onSegmentChange}
            style={{ width: '100%' }}
          >
            <Option value="all">All Clients</Option>
            {segments.map(segment => (
              <Option key={segment.id} value={segment.name}>
                {segment.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={10}>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
            >
              Refresh
            </Button>
            <ExportMenu
              onExport={onExport}
              disabled={!hasResults}
            />
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

