import { useState, useRef } from 'react';
import { message } from 'antd';
import type { Conversation } from '@/types';
import { USE_CHAT_SEND_GUARD } from '@/features/chat/utils/chatFeatureFlags';
import { evaluateAdminSendPermission } from '@/features/chat/utils/chatPermissions';

interface UseMessageSendingProps {
  selectedConversation: Conversation | null;
  newMessage: string;
  listConversations: Conversation[];
  sendMessage: (conversationId: string, messageText: string) => Promise<void>;
  onMessageSent: () => void;
}

export const useMessageSending = ({
  selectedConversation,
  newMessage,
  listConversations,
  sendMessage,
  onMessageSent,
}: UseMessageSendingProps) => {
  const [isSending, setIsSending] = useState(false);
  const lastSentMessageRef = useRef<{ text: string; timestamp: number } | null>(null);

  const handleSendMessage = async () => {
    if (isSending) {
      message.warning('Please wait for the current message to send');
      return;
    }

    if (!selectedConversation) {
      message.warning('Please select a conversation first');
      return;
    }

    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage) {
      message.warning('Message cannot be empty');
      return;
    }

    const now = Date.now();
    if (
      lastSentMessageRef.current &&
      lastSentMessageRef.current.text === trimmedMessage &&
      now - lastSentMessageRef.current.timestamp < 2000
    ) {
      message.warning('Please wait before sending the same message again');
      return;
    }

    if (!selectedConversation.id) {
      message.error('Invalid conversation. Please refresh and try again.');
      return;
    }

    const conversationExists = listConversations.some(
      (c) => c.id === selectedConversation.id
    );
    if (!conversationExists && USE_CHAT_SEND_GUARD) {
      console.warn('[Chat] Selected conversation not in current list:', selectedConversation.id);
    }

    if (USE_CHAT_SEND_GUARD) {
      const permission = evaluateAdminSendPermission(selectedConversation);
      if (!permission.canSend) {
        if (permission.reason === 'inactive-conversation') {
          message.warning('This conversation is inactive. You cannot send new messages.');
        } else if (permission.reason === 'no-conversation') {
          message.warning('Conversation is not available. Please re-open the chat and try again.');
        }
        return;
      }
    }

    setIsSending(true);
    try {
      await sendMessage(selectedConversation.id, trimmedMessage);
      lastSentMessageRef.current = {
        text: trimmedMessage,
        timestamp: now,
      };
      onMessageSent();
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return {
    isSending,
    handleSendMessage,
    handleKeyPress,
  };
};


