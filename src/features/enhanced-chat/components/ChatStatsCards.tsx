/**
 * Chat Stats Cards Component
 * 
 * Displays chat statistics.
 */

import React from 'react';
import { Row, Col, Card, Typography } from 'antd';

const { Title, Text } = Typography;

interface ChatStatsCardsProps {
  totalConversations: number;
  pendingApproval: number;
  activeConversations: number;
  unreadMessages: number;
}

export const ChatStatsCards: React.FC<ChatStatsCardsProps> = ({
  totalConversations,
  pendingApproval,
  activeConversations,
  unreadMessages,
}) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              {totalConversations}
            </Title>
            <Text type="secondary">Total Conversations</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#faad14' }}>
              {pendingApproval}
            </Title>
            <Text type="secondary">Pending Approval</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
              {activeConversations}
            </Title>
            <Text type="secondary">Active Conversations</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#722ed1' }}>
              {unreadMessages}
            </Title>
            <Text type="secondary">Unread Messages</Text>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

