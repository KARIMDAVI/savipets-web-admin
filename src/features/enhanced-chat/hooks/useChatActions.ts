/**
 * useChatActions Hook
 * 
 * Hook for handling chat-related mutations.
 */

import { message } from 'antd';
import dayjs from 'dayjs';
import { chatService } from '@/services/chat.service';
import type { Conversation, Attachment } from '@/types';
import type { ChatModerationSettings } from '../types/enhanced-chat.types';

interface UseChatActionsCallbacks {
  onMessageSent?: () => void;
  onMessageDeleted?: () => void;
  onConversationApproved?: () => void;
  onConversationRejected?: () => void;
}

export const useChatActions = (
  moderationSettings: ChatModerationSettings,
  callbacks?: UseChatActionsCallbacks
) => {
  const sendMessage = async (
    conversationId: string,
    content: string
  ): Promise<void> => {
    // Check message length
    if (content.length > moderationSettings.maxMessageLength) {
      message.error(`Message too long. Maximum ${moderationSettings.maxMessageLength} characters.`);
      throw new Error('Message too long');
    }

    // Check for banned words
    if (moderationSettings.keywordFiltering) {
      const containsBannedWord = moderationSettings.bannedWords.some(word =>
        content.toLowerCase().includes(word.toLowerCase())
      );
      if (containsBannedWord) {
        message.error('Message contains inappropriate content.');
        throw new Error('Banned word detected');
      }
    }

    try {
      await chatService.sendMessage(conversationId, {
        conversationId,
        content,
        senderId: 'admin',
        senderType: 'admin',
        timestamp: new Date(),
        type: 'text',
        isRead: false,
        readBy: [],
      });
      callbacks?.onMessageSent?.();
      message.success('Message sent successfully');
    } catch (error) {
      message.error('Failed to send message');
      throw error;
    }
  };

  const handleFileUpload = (file: File): void => {
    if (!moderationSettings.allowAttachments) {
      message.error('File attachments are not allowed');
      return;
    }

    if (file.size > moderationSettings.maxAttachmentSize * 1024 * 1024) {
      message.error(`File too large. Maximum ${moderationSettings.maxAttachmentSize}MB.`);
      return;
    }

    // TODO: Upload file to Firebase Storage and send message with attachment URL
    message.info('File upload functionality would be implemented here');
  };

  const approveConversation = async (conversationId: string): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      callbacks?.onConversationApproved?.();
      message.success('Conversation approved');
    } catch (error) {
      message.error('Failed to approve conversation');
      throw error;
    }
  };

  const rejectConversation = async (conversationId: string): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      callbacks?.onConversationRejected?.();
      message.success('Conversation rejected');
    } catch (error) {
      message.error('Failed to reject conversation');
      throw error;
    }
  };

  const deleteMessage = async (messageId: string): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      callbacks?.onMessageDeleted?.();
      message.success('Message deleted');
    } catch (error) {
      message.error('Failed to delete message');
      throw error;
    }
  };

  const exportConversation = (conversation: Conversation, messages: any[]): void => {
    const csvContent = [
      ['Timestamp', 'Sender', 'Message', 'Type'],
      ...messages.map(msg => [
        dayjs(msg.timestamp).format('YYYY-MM-DD HH:mm:ss'),
        msg.senderType,
        msg.content,
        msg.type,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conversation.id}-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    message.success('Conversation exported successfully');
  };

  return {
    sendMessage,
    handleFileUpload,
    approveConversation,
    rejectConversation,
    deleteMessage,
    exportConversation,
  };
};

