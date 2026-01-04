import React, { useState, useMemo } from 'react';
import { Typography, Row, Col, Space, Popconfirm, Button, Tag } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import type { Conversation, Attachment } from '@/types';
import { useEnhancedChat, useChatActions } from '@/features/enhanced-chat/hooks';
import {
  ChatStatsCards,
  ConversationsList,
  ChatMessagesPanel,
  ModerationSettingsDrawer,
  AttachmentModal,
} from '@/features/enhanced-chat/components';
import { calculateChatStats, getConversationTitle } from '@/features/enhanced-chat/utils/chatHelpers';

const { Title, Text } = Typography;

const EnhancedChatPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

  // Use enhanced chat hook
  const {
    conversations,
    messages,
    users,
    moderationSettings,
    conversationsLoading,
    messagesLoading,
    messagesEndRef,
    fileInputRef,
    refetchConversations,
    refetchMessages,
    setModerationSettings,
  } = useEnhancedChat(selectedConversation?.id || null);

  // Use chat actions hook
  const {
    sendMessage,
    handleFileUpload,
    approveConversation,
    rejectConversation,
    deleteMessage,
    exportConversation,
  } = useChatActions(moderationSettings, {
    onMessageSent: () => {
      setNewMessage('');
      refetchMessages();
    },
    onMessageDeleted: () => {
      refetchMessages();
    },
    onConversationApproved: () => {
      refetchConversations();
    },
    onConversationRejected: () => {
      refetchConversations();
    },
  });

  // Calculate statistics
  const stats = useMemo(() => calculateChatStats(conversations), [conversations]);

  // Handlers
  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;
    try {
      await sendMessage(selectedConversation.id, newMessage);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleApproveConversation = async (conversationId: string) => {
    try {
      await approveConversation(conversationId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleRejectConversation = async (conversationId: string) => {
    try {
      await rejectConversation(conversationId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleExportConversation = () => {
    if (!selectedConversation) return;
    exportConversation(selectedConversation, messages);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <span style={{ marginRight: '8px' }}>
            <MessageOutlined />
          </span>
          Enhanced Chat Management
        </Title>
        <Text type="secondary">
          Advanced chat moderation, approval system, and attachment management
        </Text>
      </div>

      <ChatStatsCards
        totalConversations={stats.totalConversations}
        pendingApproval={stats.pendingApproval}
        activeConversations={stats.activeConversations}
        unreadMessages={stats.unreadMessages}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <ConversationsList
            conversations={conversations}
            selectedConversation={selectedConversation}
            searchTerm={searchTerm}
            users={users}
            loading={conversationsLoading}
            onSearchChange={setSearchTerm}
            onConversationSelect={setSelectedConversation}
            onRefresh={refetchConversations}
            onOpenSettings={() => setSettingsDrawerVisible(true)}
          />
        </Col>

        <Col xs={24} lg={16}>
          {selectedConversation && selectedConversation.requiresApproval && !selectedConversation.isActive && (
            <div style={{ marginBottom: '16px' }}>
              <Space>
                <Popconfirm
                  title="Approve this conversation?"
                  onConfirm={() => handleApproveConversation(selectedConversation.id)}
                >
                  <Button type="primary" size="small">Approve</Button>
                </Popconfirm>
                <Popconfirm
                  title="Reject this conversation?"
                  onConfirm={() => handleRejectConversation(selectedConversation.id)}
                >
                  <Button danger size="small">Reject</Button>
                </Popconfirm>
                <Tag color="orange">Pending Approval</Tag>
              </Space>
            </div>
          )}
          <ChatMessagesPanel
            conversation={selectedConversation}
            messages={messages}
            users={users}
            newMessage={newMessage}
            loading={messagesLoading}
            messagesEndRef={messagesEndRef}
            fileInputRef={fileInputRef}
            onMessageChange={setNewMessage}
            onSendMessage={handleSendMessage}
            onKeyPress={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleKeyPress(e)}
            onFileUpload={handleFileUpload}
            onDeleteMessage={handleDeleteMessage}
            onExportConversation={handleExportConversation}
            onAttachmentClick={(attachment) => {
              setSelectedAttachment(attachment);
              setAttachmentModalVisible(true);
            }}
          />
        </Col>
      </Row>

      <ModerationSettingsDrawer
        visible={settingsDrawerVisible}
        settings={moderationSettings}
        onClose={() => setSettingsDrawerVisible(false)}
        onSettingsChange={setModerationSettings}
      />

      <AttachmentModal
        visible={attachmentModalVisible}
        attachment={selectedAttachment}
        onClose={() => setAttachmentModalVisible(false)}
      />
    </div>
  );
};

export default EnhancedChatPage;
