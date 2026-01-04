/**
 * Recommendations Modal Component
 * 
 * Modal for displaying detailed AI recommendations.
 */

import React from 'react';
import { Modal, Card, Descriptions, Space, Typography, Tag, Button, Row, Col, Avatar, Progress, Divider } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { AISitterAssignment } from '../types/ai-assignment.types';
import { getConfidenceColor, getConfidenceIcon } from '../utils/aiAssignmentHelpers';

const { Title, Text } = Typography;

interface RecommendationsModalProps {
  visible: boolean;
  assignment: AISitterAssignment | null;
  onClose: () => void;
  onAssign: (bookingId: string, sitterId: string) => void;
  onOverride: (bookingId: string, sitterId: string) => void;
}

export const RecommendationsModal: React.FC<RecommendationsModalProps> = ({
  visible,
  assignment,
  onClose,
  onAssign,
  onOverride,
}) => {
  if (!assignment) return null;

  return (
    <Modal
      title="AI Sitter Recommendations"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <div>
        {/* Booking Details */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Booking ID">
              <Text code>{assignment.booking.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Service Type">
              <Tag color="blue">
                {assignment.booking.serviceType.replace('-', ' ')}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Scheduled Date">
              {dayjs(assignment.booking.scheduledDate).format('MMMM DD, YYYY [at] h:mm A')}
            </Descriptions.Item>
            <Descriptions.Item label="Duration">
              {assignment.booking.duration} minutes
            </Descriptions.Item>
            <Descriptions.Item label="Price">
              ${assignment.booking.price.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Current Assignment">
              {assignment.currentAssignment ? (
                <Text type="success">Assigned</Text>
              ) : (
                <Text type="secondary">Unassigned</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* AI Recommendations */}
        <Title level={5}>AI Recommendations</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          {assignment.recommendations.map((rec, index) => (
            <Card
              key={rec.sitter.id}
              size="small"
              style={{
                border: index === 0 ? '2px solid #1890ff' : '1px solid #d9d9d9',
                backgroundColor: index === 0 ? '#f0f8ff' : 'white',
              }}
            >
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={4}>
                  <Space direction="vertical" align="center">
                    <Avatar size="large" icon={<UserOutlined />} />
                    <Text strong>#{index + 1}</Text>
                  </Space>
                </Col>
                <Col xs={24} sm={8}>
                  <Space direction="vertical" size={0}>
                    <Text strong>{rec.sitter.firstName} {rec.sitter.lastName}</Text>
                    <Text type="secondary">{rec.sitter.email}</Text>
                    <Space>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {rec.sitter.rating?.toFixed(1)}⭐
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {rec.sitter.totalBookings || 0} bookings
                      </Text>
                    </Space>
                  </Space>
                </Col>
                <Col xs={24} sm={6}>
                  <Space direction="vertical" size={0}>
                    <div>
                      <Text strong>Score: {rec.score}</Text>
                      <Progress
                        percent={rec.score}
                        size="small"
                        strokeColor={rec.score >= 80 ? '#52c41a' : rec.score >= 60 ? '#faad14' : '#f5222d'}
                      />
                    </div>
                    <Tag
                      color={getConfidenceColor(rec.confidence)}
                      icon={getConfidenceIcon(rec.confidence)}
                    >
                      {rec.confidence} confidence
                    </Tag>
                  </Space>
                </Col>
                <Col xs={24} sm={6}>
                  <Space direction="vertical">
                    <Button
                      type={index === 0 ? 'primary' : 'default'}
                      onClick={() => onAssign(assignment.bookingId, rec.sitter.id)}
                      disabled={assignment.currentAssignment === rec.sitter.id}
                    >
                      {assignment.currentAssignment === rec.sitter.id ? 'Assigned' : 'Assign'}
                    </Button>
                    {assignment.currentAssignment && assignment.currentAssignment !== rec.sitter.id && (
                      <Button
                        type="dashed"
                        onClick={() => onOverride(assignment.bookingId, rec.sitter.id)}
                      >
                        Override
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
              
              {/* Reasons */}
              <Divider style={{ margin: '12px 0' }} />
              <div>
                <Text strong style={{ fontSize: '12px' }}>Why this sitter:</Text>
                <div style={{ marginTop: '4px' }}>
                  {rec.reasons.map((reason, reasonIndex) => (
                    <Tag key={reasonIndex} color="blue" style={{ marginBottom: '4px' }}>
                      {reason}
                    </Tag>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </Space>
      </div>
    </Modal>
  );
};

