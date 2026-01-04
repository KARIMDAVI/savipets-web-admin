/**
 * Conversations List Component
 * 
 * Displays list of conversations with search.
 */

import React from 'react';
import { Card, List, Input, Button, Space, Avatar, Badge, Typography, Popconfirm } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Conversation, User } from '@/types';
import { getConversationTitle, getLastMessagePreview, getParticipantInfo } from '../utils/chatHelpers';
import { ConversationTypeBadge } from './ConversationTypeBadge';
import { ParticipantRoleBadge } from './ParticipantRoleBadge';
import { CHAT_ORGANIZATION_ENABLED } from '../utils/chatFeatureFlags';
import { getConversationCategory } from '../utils/conversationTypeDetection';

const { Text } = Typography;
const { Search } = Input;

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  searchTerm: string;
  users: User[];
  loading: boolean;
  onSearchChange: (value: string) => void;
  onConversationSelect: (conversation: Conversation) => void;
  onRefresh: () => void;
  onDeleteConversation?: (conversationId: string) => Promise<void>;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedConversation,
  searchTerm,
  users,
  loading,
  onSearchChange,
  onConversationSelect,
  onRefresh,
  onDeleteConversation,
}) => {
  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true;
    const title = getConversationTitle(conversation, users).toLowerCase();
    return title.includes(searchTerm.toLowerCase());
  });

  return (
    <Card
      title={
        <Text strong style={{ fontSize: '16px' }}>
          Conversations
        </Text>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={loading}
          size="small"
          type="text"
        />
      }
      styles={{
        body: {
          padding: '16px',
        },
      }}
    >
      <Search
        placeholder="Search conversations..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ marginBottom: '16px' }}
        prefix={<SearchOutlined />}
        allowClear
      />
      
      {filteredConversations.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <UserOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Text type="secondary" style={{ fontSize: '14px', display: 'block' }}>
            {searchTerm ? 'No conversations found' : 'No conversations yet'}
          </Text>
        </div>
      ) : (
        <List
          loading={loading}
          dataSource={filteredConversations}
          renderItem={(conversation) => {
            const isSelected = selectedConversation?.id === conversation.id;
            const lastMessage = conversation.lastMessage;
            const hasUnread = conversation.unreadCount && conversation.unreadCount > 0;
            
            return (
              <List.Item
                style={{
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#e6f7ff' : '#ffffff',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '8px',
                  border: isSelected ? '1px solid #1890ff' : '1px solid #f0f0f0',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => onConversationSelect(conversation)}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#fafafa';
                    e.currentTarget.style.borderColor = '#d9d9d9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#f0f0f0';
                  }
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Badge count={hasUnread ? conversation.unreadCount : 0} size="small" offset={[-5, 5]}>
                      <Avatar
                        size={48}
                        icon={<UserOutlined />}
                        style={{
                          backgroundColor: isSelected ? '#1890ff' : '#1890ff',
                          color: '#ffffff',
                        }}
                      />
                    </Badge>
                  }
                  title={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                          <Text
                            strong
                            style={{
                              fontSize: '14px',
                              color: hasUnread ? '#262626' : '#595959',
                              fontWeight: hasUnread ? 600 : 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {getConversationTitle(conversation, users)}
                          </Text>
                          {CHAT_ORGANIZATION_ENABLED && (
                            <ConversationTypeBadge
                              category={getConversationCategory(conversation, users)}
                              size="small"
                            />
                          )}
                        </div>
                        <Space size="small" style={{ marginLeft: '8px', flexShrink: 0 }}>
                          {lastMessage && (
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              {dayjs(lastMessage.timestamp).format('MMM DD')}
                            </Text>
                          )}
                          {onDeleteConversation && (
                            <Popconfirm
                              title="Delete conversation"
                              description="Are you sure you want to delete this conversation? This action cannot be undone."
                              onConfirm={(e) => {
                                e?.stopPropagation();
                                onDeleteConversation(conversation.id);
                              }}
                              onCancel={(e) => {
                                e?.stopPropagation();
                              }}
                              okText="Delete"
                              okType="danger"
                              cancelText="Cancel"
                            >
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                style={{ 
                                  opacity: 0.7,
                                  transition: 'opacity 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = '0.7';
                                }}
                              />
                            </Popconfirm>
                          )}
                        </Space>
                      </div>
                      {CHAT_ORGANIZATION_ENABLED && conversation.participants.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {conversation.participants.slice(0, 3).map((participant) => {
                            const user = getParticipantInfo(participant.userId, users);
                            if (!user) return null;
                            return (
                              <ParticipantRoleBadge
                                key={participant.userId}
                                role={user.role}
                                size="small"
                              />
                            );
                          })}
                          {conversation.participants.length > 3 && (
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              +{conversation.participants.length - 3} more
                            </Text>
                          )}
                        </div>
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: '13px',
                          display: 'block',
                          marginTop: '4px',
                          color: hasUnread ? '#262626' : '#8c8c8c',
                          fontWeight: hasUnread ? 500 : 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {getLastMessagePreview(conversation)}
                      </Text>
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

