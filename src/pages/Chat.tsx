import React, { useState, useMemo } from 'react';
import { Typography, Tabs } from 'antd';
import type { Conversation } from '@/types';
import { useChat, useChatActions, useInquiries } from '@/features/chat/hooks';
import {
  ChatStatsCards,
  ConversationsList,
  ChatMessagesPanel,
  ConversationDetailsModal,
  PendingInquiriesList,
  ConversationTypeFilter,
} from '@/features/chat/components';
import { calculateChatStats } from '@/features/chat/utils/chatHelpers';
import { chatService } from '@/services/chat.service';
import { CHAT_ORGANIZATION_ENABLED } from '@/features/chat/utils/chatFeatureFlags';
import { useConversationDeduplication } from './Chat/useConversationDeduplication';
import { useMessageSending } from './Chat/useMessageSending';
import { useInquiryHandling } from './Chat/useInquiryHandling';
import { useConversationManagement } from './Chat/useConversationManagement';

const { Title, Text } = Typography;

const ChatPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('conversations');

  const chatHookResult = useChat(selectedConversation?.id || null);
  const {
    conversations,
    messages,
    users,
    newMessage,
    searchTerm,
    messagesEndRef,
    conversationsLoading,
    messagesLoading,
    setNewMessage,
    setSearchTerm,
    refetchConversations,
    refetchMessages,
    // Category organization features (optional, feature-flagged)
    activeCategoryFilter = 'all',
    setActiveCategoryFilter,
    categoryStats,
    categoryCounts,
    filteredConversations,
  } = chatHookResult;

  const {
    inquiries,
    loading: inquiriesLoading,
    refetch: refetchInquiries,
  } = useInquiries();

  const {
    sendMessage,
  } = useChatActions({
    onMessageSent: () => {
      setNewMessage('');
      refetchMessages();
    },
  });

  // Use filtered conversations if feature is enabled, otherwise use all conversations
  const conversationsToUse = CHAT_ORGANIZATION_ENABLED && filteredConversations
    ? filteredConversations
    : conversations;

  const stats = useMemo(
    () => calculateChatStats(conversationsToUse),
    [conversationsToUse]
  );

  const listConversations = useConversationDeduplication(conversationsToUse);

  const {
    isSending,
    handleSendMessage,
    handleKeyPress,
  } = useMessageSending({
    selectedConversation,
    newMessage,
    listConversations,
    sendMessage,
    onMessageSent: () => {
      setNewMessage('');
      refetchMessages();
    },
  });

  const { handleAcceptInquiry } = useInquiryHandling({
    onInquiryAccepted: async (conversationId) => {
      const newConversation = await chatService.getConversationById(conversationId);
      if (newConversation) {
        setSelectedConversation(newConversation);
        setActiveTab('conversations');
      }
    },
    refetchInquiries,
    refetchConversations,
  });

  const { handleDeleteConversation } = useConversationManagement({
    selectedConversationId: selectedConversation?.id || null,
    onConversationDeleted: () => setSelectedConversation(null),
    refetchConversations,
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Chat Management</Title>
        <Text type="secondary">
          Monitor and participate in conversations between users
        </Text>
      </div>

      <ChatStatsCards
        totalConversations={stats.totalConversations}
        unreadMessages={stats.unreadMessages}
        activeConversations={stats.activeConversations}
        categoryStats={CHAT_ORGANIZATION_ENABLED && categoryStats ? categoryStats : undefined}
      />

      {CHAT_ORGANIZATION_ENABLED && activeCategoryFilter && setActiveCategoryFilter && categoryCounts && (
        <ConversationTypeFilter
          activeFilter={activeCategoryFilter}
          onFilterChange={setActiveCategoryFilter}
          categoryCounts={categoryCounts}
          totalCount={conversations.length}
        />
      )}

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: '0 0 33.333%' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'conversations',
                label: `Active Chats (${listConversations.length})`,
                children: (
                  <ConversationsList
                    conversations={listConversations}
                    selectedConversation={selectedConversation}
                    searchTerm={searchTerm}
                    users={users}
                    loading={conversationsLoading}
                    onSearchChange={setSearchTerm}
                    onConversationSelect={(conversation) => {
                      setSelectedConversation(conversation);
                      setDetailsModalVisible(false);
                    }}
                    onRefresh={refetchConversations}
                    onDeleteConversation={handleDeleteConversation}
                  />
                ),
              },
              {
                key: 'inquiries',
                label: `Pending Requests (${inquiries.length})`,
                children: (
                  <PendingInquiriesList
                    inquiries={inquiries}
                    users={users}
                    loading={inquiriesLoading}
                    onRefresh={refetchInquiries}
                    onAccept={handleAcceptInquiry}
                  />
                ),
              },
            ]}
          />
        </div>

        <div style={{ flex: '1' }}>
          <ChatMessagesPanel
            conversation={selectedConversation}
            messages={messages}
            users={users}
            newMessage={newMessage}
            loading={messagesLoading || conversationsLoading}
            messagesEndRef={messagesEndRef}
            onMessageChange={setNewMessage}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            onRefresh={refetchMessages}
            isSending={isSending}
          />
        </div>
      </div>

      <ConversationDetailsModal
        visible={detailsModalVisible}
        conversation={selectedConversation}
        users={users}
        onClose={() => setDetailsModalVisible(false)}
      />
    </div>
  );
};

export default ChatPage;
