/**
 * Conversations List Component
 * 
 * Displays list of conversations with search and selection.
 */

import React from 'react';
import { Card, List, Input, Button, Space, Avatar, Badge, Typography } from 'antd';
import {
  SearchOutlined,
  SettingOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Conversation } from '@/types';
import { getConversationTitle, getParticipantInfo } from '../utils/chatHelpers';

const { Text } = Typography;
const { Search } = Input;

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  searchTerm: string;
  users: any[];
  loading: boolean;
  onSearchChange: (value: string) => void;
  onConversationSelect: (conversation: Conversation) => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
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
  onOpenSettings,
}) => {
  const getLastMessagePreview = (conversation: Conversation): string => {
    if (!conversation.lastMessage) return 'No messages yet';
    return conversation.lastMessage.content.length > 50
      ? `${conversation.lastMessage.content.substring(0, 50)}...`
      : conversation.lastMessage.content;
  };

  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true;
    const title = getConversationTitle(conversation, users).toLowerCase();
    return title.includes(searchTerm.toLowerCase());
  });

  return (
    <Card
      title="Conversations"
      extra={
        <Space>
          <Button
            icon={<SettingOutlined />}
            onClick={onOpenSettings}
            size="small"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
            size="small"
          />
        </Space>
      }
    >
      <Search
        placeholder="Search conversations..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ marginBottom: '16px' }}
        prefix={<SearchOutlined />}
      />
      
      <List
        loading={loading}
        dataSource={filteredConversations}
        renderItem={(conversation) => {
          const isSelected = selectedConversation?.id === conversation.id;
          const lastMessage = conversation.lastMessage;
          
          return (
            <List.Item
              style={{
                cursor: 'pointer',
                backgroundColor: isSelected ? '#f0f8ff' : 'transparent',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px',
              }}
              onClick={() => onConversationSelect(conversation)}
            >
              <List.Item.Meta
                avatar={
                  <Space direction="vertical" align="center">
                    <Avatar
                      size="large"
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: isSelected ? '#1890ff' : '#d9d9d9',
                      }}
                    />
                    {conversation.requiresApproval && !conversation.isActive && (
                      <Badge status="warning" />
                    )}
                  </Space>
                }
                title={
                  <Space>
                    <Text strong>{getConversationTitle(conversation, users)}</Text>
                    {conversation.unreadCount && conversation.unreadCount > 0 && (
                      <Badge count={conversation.unreadCount} />
                    )}
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {getLastMessagePreview(conversation)}
                    </Text>
                    {lastMessage && (
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {dayjs(lastMessage.timestamp).format('MMM DD, h:mm A')}
                      </Text>
                    )}
                  </Space>
                }
              />
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

