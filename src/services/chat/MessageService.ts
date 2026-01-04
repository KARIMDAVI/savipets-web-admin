import { db } from '@/config/firebase.config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import type { Conversation, Message } from '@/types';
import {
  normalizeConversationType,
  ADMIN_INQUIRY_TYPE,
} from '@/features/chat/utils/chatType';
import {
  normalizeMessageText,
} from '@/features/chat/utils/dataNormalization';
import {
  validateMessageText,
  sanitizeMessageText,
} from '@/features/chat/utils/messageValidation';

/**
 * Service for handling message operations
 */
export class MessageService {
  private conversationsRef = collection(db, 'conversations');
  private messagesRef = collection(db, 'messages');

  /**
   * Get all messages for a conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const messagesRef = collection(
        doc(this.conversationsRef, conversationId),
        'messages'
      );
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const content = normalizeMessageText(data);
        const timestamp = data.timestamp?.toDate?.() || data.timestamp || new Date();
        return {
          id: doc.id,
          ...data,
          content,
          timestamp,
        } as Message;
      }) as Message[];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Send a message to a conversation
   */
  async sendMessage(conversationId: string, messageData: Omit<Message, 'id'>): Promise<string> {
    try {
      if (!conversationId || !conversationId.trim()) {
        throw new Error('Conversation ID is required');
      }
      if (!messageData.senderId) {
        throw new Error('Sender ID is required');
      }
      
      const rawMessageText = (messageData as any).content || (messageData as any).text || '';
      const messageText = sanitizeMessageText(rawMessageText);
      
      const validation = validateMessageText(messageText);
      if (!validation.isValid) {
        console.error('[MessageService] Message validation failed:', {
          conversationId,
          senderId: messageData.senderId,
          error: validation.error,
          messageLength: messageText.length,
        });
        throw new Error(validation.error || 'Invalid message');
      }

      const conversationRef = doc(this.conversationsRef, conversationId);
      const convSnap = await getDoc(conversationRef);
      if (!convSnap.exists()) {
        console.error('[MessageService] Conversation not found:', conversationId);
        throw new Error('Conversation not found');
      }
      const convData = convSnap.data();
      
      const convType = normalizeConversationType((convData as any).type);
      const isActive = convData.isActive !== false;
      
      if (!isActive && convType !== ADMIN_INQUIRY_TYPE) {
        console.warn('[MessageService] Attempted to send to inactive conversation:', {
          conversationId,
          type: convType,
          isActive,
        });
        throw new Error('Cannot send message to inactive conversation');
      }
      
      const currentParticipants: Array<string | { userId: string }> = convData.participants || [];
      let normalizedParticipants: string[] = Array.isArray(currentParticipants)
        ? (typeof currentParticipants[0] === 'string'
            ? (currentParticipants as string[])
            : (currentParticipants as Array<{ userId: string }>).map(p => p.userId))
        : [];
      const senderId = messageData.senderId;
      if (senderId && !normalizedParticipants.includes(senderId)) {
        normalizedParticipants = Array.from(new Set([...normalizedParticipants, senderId]));
        let updatedRoles: string[] | undefined = undefined;
        if (Array.isArray(convData.participantRoles)) {
          const roles = (convData.participantRoles as string[]) || [];
          updatedRoles = Array.from(new Set([...roles, 'admin']));
        } else if (!('participantRoles' in convData)) {
          updatedRoles = ['admin'];
        }
        const updates: Record<string, any> = { participants: normalizedParticipants, updatedAt: serverTimestamp() };
        if (updatedRoles) updates.participantRoles = updatedRoles;
        
        try {
          await updateDoc(conversationRef, updates as any);
        } catch (participantError: any) {
          console.warn('[MessageService] Failed to add sender to participants:', {
            conversationId,
            senderId,
            error: participantError.message,
          });
        }
      }

      const messagesRef = collection(conversationRef, 'messages');
      const text = messageText;
      const messageRef = await addDoc(messagesRef, {
        conversationId,
        senderId: messageData.senderId,
        text,
        timestamp: serverTimestamp(),
        type: messageData.type || 'text',
        isRead: false,
        readBy: [],
        read: false,
        status: 'sent',
        moderationType: 'none',
        isAutoResponse: false,
        deliveryStatus: 'delivered',
        retryCount: 0,
      });

      // Update conversation with last message
      await updateDoc(conversationRef, {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        lastMessageId: messageRef.id,
        lastMessageSenderId: messageData.senderId,
        lastMessageSenderType: messageData.senderType,
        updatedAt: serverTimestamp(),
        messageCount: await this.getMessageCount(conversationId),
      });

      console.log('[MessageService] Message sent successfully', {
        conversationId,
        messageId: messageRef.id,
        senderId: messageData.senderId,
      });

      return messageRef.id;
    } catch (error) {
      console.error('[MessageService] Error sending message:', {
        conversationId,
        senderId: messageData.senderId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get message count for a conversation
   */
  async getMessageCount(conversationId: string): Promise<number> {
    try {
      const messagesRef = collection(
        doc(this.conversationsRef, conversationId),
        'messages'
      );
      const snapshot = await getDocs(messagesRef);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  }

  /**
   * Mark all messages in a conversation as read
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const messagesRef = collection(
        doc(this.conversationsRef, conversationId),
        'messages'
      );
      const q = query(messagesRef);
      const snapshot = await getDocs(q);
      
      const updatePromises = snapshot.docs.map(doc => {
        const currentReadBy = doc.data().readBy || [];
        return updateDoc(doc.ref, {
          readBy: [...currentReadBy, userId],
        });
      });

      await Promise.all(updatePromises);

      const conversationRef = doc(this.conversationsRef, conversationId);
      await updateDoc(conversationRef, {
        unreadCount: 0,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Search messages across conversations or within a specific conversation
   */
  async searchMessages(searchTerm: string, conversationId?: string): Promise<Message[]> {
    try {
      let messagesRef = this.messagesRef;
      if (conversationId) {
        messagesRef = collection(
          doc(this.conversationsRef, conversationId),
          'messages'
        );
      }
      const q = query(
        messagesRef,
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const snapshot = await getDocs(q);
      
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as Message[];

      return messages.filter(message =>
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }
}

export const messageService = new MessageService();


