/**
 * useChatActions Hook
 * 
 * Hook for handling chat-related mutations.
 */

import { message } from 'antd';
import { chatService } from '@/services/chat.service';
import { auth } from '@/config/firebase.config';

interface UseChatActionsCallbacks {
  onMessageSent?: () => void;
}

export const useChatActions = (
  callbacks?: UseChatActionsCallbacks
) => {
  const sendMessage = async (
    conversationId: string,
    content: string
  ): Promise<void> => {
    try {
      // Validate input
      const trimmedContent = content?.trim();
      if (!trimmedContent) {
        message.warning('Message cannot be empty');
        return;
      }

      if (!conversationId) {
        message.error('Conversation ID is required');
        throw new Error('Conversation ID missing');
      }

      const currentUser = auth.currentUser;
      if (!currentUser?.uid) {
        message.error('You must be signed in as admin to send messages.');
        throw new Error('Not authenticated');
      }

      await chatService.sendMessage(conversationId, {
        conversationId,
        content: trimmedContent, // UI field; service maps to Firestore 'text'
        senderId: currentUser.uid,
        senderType: 'admin',
        timestamp: new Date(), // Not persisted; service uses serverTimestamp
        type: 'text',
        isRead: false,
        readBy: [],
      });
      callbacks?.onMessageSent?.();
      message.success('Message sent successfully');
    } catch (error: any) {
      // Provide more specific error messages
      const errorMessage = error?.message || 'Unknown error';
      if (errorMessage.includes('not found') || errorMessage.includes('Conversation not found')) {
        message.error('Conversation not found. Please refresh and try again.');
      } else if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
        message.error('You do not have permission to send messages in this conversation.');
      } else if (errorMessage.includes('Not authenticated')) {
        message.error('You must be signed in to send messages.');
      } else {
        console.error('Error sending message:', error);
        message.error(`Failed to send message: ${errorMessage}`);
      }
      throw error;
    }
  };

  return {
    sendMessage,
  };
};

