/**
 * Pending Inquiries List Component
 * 
 * Displays list of pending support inquiries with ability to accept them.
 */

import React from 'react';
import { Card, List, Button, Space, Avatar, Badge, Typography, Tag } from 'antd';
import {
  ReloadOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Inquiry } from '../hooks/useInquiries';
import { getParticipantInfo } from '../utils/chatHelpers';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface PendingInquiriesListProps {
  inquiries: Inquiry[];
  users: any[];
  loading: boolean;
  onAccept?: (inquiry: Inquiry) => void;
  onRefresh: () => void;
}

export const PendingInquiriesList: React.FC<PendingInquiriesListProps> = ({
  inquiries,
  users,
  loading,
  onAccept,
  onRefresh,
}) => {
  return (
    <Card
      title={
        <Space>
          <Text strong>Pending Support Requests</Text>
          {inquiries.length > 0 && (
            <Badge count={inquiries.length} showZero={false} />
          )}
        </Space>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={loading}
          size="small"
        />
      }
    >
      {inquiries.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
          <Text type="secondary" style={{ fontSize: '14px', display: 'block' }}>
            All caught up!
          </Text>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
            No pending support requests
          </Text>
        </div>
      ) : (
        <List
          loading={loading}
          dataSource={inquiries}
          renderItem={(inquiry) => {
            const user = getParticipantInfo(inquiry.fromUserId, users);
            const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
            const timeAgo = inquiry.createdAt ? dayjs(inquiry.createdAt).fromNow() : '';
            
            return (
              <List.Item
                style={{
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  border: '1px solid #ffe7ba',
                  backgroundColor: '#fff7e6',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ffd591';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(255,152,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#ffe7ba';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size={48}
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: '#ff9800',
                        color: '#ffffff',
                      }}
                    />
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <Space>
                          <Text strong style={{ fontSize: '15px' }}>
                            {inquiry.subject || 'Support Request'}
                          </Text>
                          <Tag color="orange" style={{ margin: 0 }}>
                            Pending
                          </Tag>
                        </Space>
                      </div>
                      {onAccept && (
                        <Button
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          onClick={() => onAccept(inquiry)}
                          size="small"
                          style={{
                            borderRadius: '6px',
                            marginLeft: '12px',
                          }}
                        >
                          Accept
                        </Button>
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: '12px',
                          display: 'block',
                          marginBottom: '8px',
                          color: '#8c8c8c',
                        }}
                      >
                        From: <Text strong style={{ color: '#262626' }}>{userName}</Text> ({inquiry.fromUserRole})
                      </Text>
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          padding: '12px',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          border: '1px solid #f0f0f0',
                        }}
                      >
                        <Text style={{ fontSize: '14px', lineHeight: '1.6', color: '#262626' }}>
                          {inquiry.initialMessage}
                        </Text>
                      </div>
                      {inquiry.createdAt && (
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {timeAgo} • {dayjs(inquiry.createdAt).format('MMM DD, h:mm A')}
                        </Text>
                      )}
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};

