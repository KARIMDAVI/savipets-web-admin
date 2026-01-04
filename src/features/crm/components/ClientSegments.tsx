/**
 * Client Segments Component
 * 
 * Displays and manages client segments.
 */

import React from 'react';
import { Card, Row, Col, Typography, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ClientSegment } from '../types/crm.types';
import { useAuth } from '@/contexts/AuthContext';
import { canCreateSegment } from '../utils/crmPermissions';

const { Title, Text } = Typography;

interface ClientSegmentsProps {
  segments: ClientSegment[];
  selectedSegment: string;
  onSegmentSelect: (segmentName: string) => void;
  onCreateSegment: () => void;
}

export const ClientSegments: React.FC<ClientSegmentsProps> = ({
  segments,
  selectedSegment,
  onSegmentSelect,
  onCreateSegment,
}) => {
  const { user } = useAuth();
  const canCreate = canCreateSegment(user);

  return (
    <Card title="Client Segments" style={{ marginBottom: '24px' }}>
      <Row gutter={[16, 16]}>
        {segments.map((segment) => (
          <Col xs={24} sm={8} md={6} key={segment.id}>
            <Card
              size="small"
              hoverable
              onClick={() => onSegmentSelect(segment.name)}
              style={{
                border:
                  selectedSegment === segment.name
                    ? '2px solid #1890ff'
                    : '1px solid #d9d9d9',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                  {segment.clientCount}
                </Title>
                <Text type="secondary">{segment.name}</Text>
              </div>
            </Card>
          </Col>
        ))}
        {canCreate && (
          <Col xs={24} sm={8} md={6}>
            <Card
              size="small"
              hoverable
              onClick={onCreateSegment}
              style={{ border: '2px dashed #d9d9d9' }}
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <PlusOutlined style={{ fontSize: '24px', color: '#d9d9d9' }} />
                <br />
                <Text type="secondary">Create Segment</Text>
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </Card>
  );
};

