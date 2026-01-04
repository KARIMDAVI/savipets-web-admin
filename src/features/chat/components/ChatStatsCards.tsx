/**
 * Chat Stats Cards Component
 * 
 * Displays chat statistics with optional category breakdown.
 */

import React, { useState } from 'react';
import { Row, Col, Card, Typography, Collapse, Space, Tag } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import type { ConversationCategoryStats } from '../types/conversation.types';
import { CHAT_ORGANIZATION_ENABLED } from '../utils/chatFeatureFlags';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface ChatStatsCardsProps {
  totalConversations: number;
  unreadMessages: number;
  activeConversations: number;
  categoryStats?: Record<string, ConversationCategoryStats>;
}

export const ChatStatsCards: React.FC<ChatStatsCardsProps> = ({
  totalConversations,
  unreadMessages,
  activeConversations,
  categoryStats,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const hasCategoryStats = CHAT_ORGANIZATION_ENABLED && categoryStats;

  return (
    <div style={{ marginBottom: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                {totalConversations}
              </Title>
              <Text type="secondary">Total Conversations</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ margin: 0, color: '#faad14' }}>
                {unreadMessages}
              </Title>
              <Text type="secondary">Unread Messages</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                {activeConversations}
              </Title>
              <Text type="secondary">Active Today</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {hasCategoryStats && (
        <Card
          style={{ marginTop: '16px' }}
          extra={
            <Text
              type="secondary"
              style={{ cursor: 'pointer', fontSize: '12px' }}
              onClick={() => setShowBreakdown(!showBreakdown)}
            >
              {showBreakdown ? (
                <Space>
                  <UpOutlined /> Hide Breakdown
                </Space>
              ) : (
                <Space>
                  <DownOutlined /> Show Breakdown
                </Space>
              )}
            </Text>
          }
        >
          {showBreakdown && (
            <Row gutter={[16, 16]}>
              {Object.entries(categoryStats).map(([category, stats]) => {
                const categoryLabels: Record<string, string> = {
                  'admin-sitter': 'Admin ↔ Sitter',
                  'admin-owner': 'Admin ↔ Owner',
                  'sitter-owner': 'Sitter ↔ Owner',
                  'unknown': 'Unknown',
                };

                const categoryColors: Record<string, string> = {
                  'admin-sitter': 'blue',
                  'admin-owner': 'green',
                  'sitter-owner': 'orange',
                  'unknown': 'default',
                };

                return (
                  <Col xs={24} sm={12} lg={6} key={category}>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <Tag color={categoryColors[category] || 'default'} style={{ marginBottom: '8px' }}>
                        {categoryLabels[category] || category}
                      </Tag>
                      <div>
                        <Text strong style={{ display: 'block', fontSize: '16px' }}>
                          {stats.total}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                          Total
                        </Text>
                        <Space size="small" style={{ marginTop: '4px' }}>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {stats.unread} unread
                          </Text>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {stats.active} active
                          </Text>
                        </Space>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}
        </Card>
      )}
    </div>
  );
};

