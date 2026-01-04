import React from 'react';
import { Row, Col, Input, Select, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ClientFilters } from '../../types/filters.types';
import type { ClientSegment, ClientTag } from '../../types/crm.types';

const { Search } = Input;
const { Option } = Select;

interface BasicFilterControlsProps {
  filters: ClientFilters;
  segments: ClientSegment[];
  tags: ClientTag[];
  onSearchChange: (value: string) => void;
  onSegmentChange: (value: string[]) => void;
  onTagChange: (value: string[]) => void;
}

export const BasicFilterControls: React.FC<BasicFilterControlsProps> = ({
  filters,
  segments,
  tags,
  onSearchChange,
  onSegmentChange,
  onTagChange,
}) => {
  return (
    <Row gutter={[16, 16]} align="middle">
      <Col xs={24} sm={12} md={8}>
        <Search
          placeholder="Search by name, email..."
          value={filters.searchTerm || ''}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ width: '100%' }}
          prefix={<SearchOutlined />}
          allowClear
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Select
          mode="multiple"
          placeholder="Select segments"
          value={filters.segmentIds || []}
          onChange={onSegmentChange}
          style={{ width: '100%' }}
          allowClear
        >
          {segments.map((segment) => (
            <Option key={segment.id} value={segment.id}>
              {segment.name}
            </Option>
          ))}
        </Select>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Select
          mode="multiple"
          placeholder="Select tags"
          value={filters.tagIds || []}
          onChange={onTagChange}
          style={{ width: '100%' }}
          allowClear
        >
          {tags.map((tag) => (
            <Option key={tag.id} value={tag.id}>
              <Tag color={tag.color}>{tag.name}</Tag>
            </Option>
          ))}
        </Select>
      </Col>
    </Row>
  );
};


