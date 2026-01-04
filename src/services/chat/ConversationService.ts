import { db } from '@/config/firebase.config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  getDocs as getDocsQuery,
  serverTimestamp,
} from 'firebase/firestore';
import type { Conversation, Message } from '@/types';
import {
  normalizeConversationType,
  ADMIN_INQUIRY_ALL_VALUES,
} from '@/features/chat/utils/chatType';
import {
  normalizeParticipants,
  normalizeTimestamp,
} from '@/features/chat/utils/dataNormalization';

/**
 * Service for handling conversation operations
 */
export class ConversationService {
  private conversationsRef = collection(db, 'conversations');

  /**
   * Get all conversations
   */
  async getAllConversations(): Promise<Conversation[]> {
    try {
      const q = query(
        this.conversationsRef,
        orderBy('lastMessageAt', 'desc')
      );
      const snapshot = await getDocsQuery(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const type = normalizeConversationType((data as any).type);
        const participants = normalizeParticipants(data.participants);
        
        let lastMessage = undefined as Conversation['lastMessage'] | undefined;
        if (typeof data.lastMessage === 'string' && data.lastMessageAt) {
          const timestamp = normalizeTimestamp(data.lastMessageAt);
          lastMessage = {
            id: data.lastMessageId || '',
            content: data.lastMessage,
            senderId: data.lastMessageSenderId || '',
            senderType: data.lastMessageSenderType || 'admin',
            timestamp: timestamp || new Date(),
            type: 'text',
            isRead: false,
            readBy: [],
          } as unknown as Message;
        } else if (data.lastMessage && typeof data.lastMessage === 'object') {
          const timestamp = normalizeTimestamp(data.lastMessage.timestamp);
          lastMessage = {
            ...data.lastMessage,
            timestamp: timestamp || new Date(),
          };
        }
        
        return {
          id: doc.id,
          participants,
          type,
          lastMessage,
          createdAt: normalizeTimestamp(data.createdAt) || undefined,
          updatedAt: normalizeTimestamp(data.updatedAt) || undefined,
          isActive: data.isActive !== false,
          requiresApproval: data.requiresApproval || false,
          unreadCount: typeof data.unreadCount === 'number' ? data.unreadCount : 0,
          messageCount: typeof data.messageCount === 'number' ? data.messageCount : 0,
        };
      }) as Conversation[];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(conversationId: string): Promise<Conversation | null> {
    try {
      const docRef = doc(this.conversationsRef, conversationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const type = normalizeConversationType((data as any).type);
        const participants = normalizeParticipants(data.participants);
        
        let lastMessage: Conversation['lastMessage'] | undefined;
        if (typeof data.lastMessage === 'string' && data.lastMessageAt) {
          const timestamp = normalizeTimestamp(data.lastMessageAt);
          lastMessage = {
            id: data.lastMessageId || '',
            content: data.lastMessage,
            senderId: data.lastMessageSenderId || '',
            senderType: data.lastMessageSenderType || 'admin',
            timestamp: timestamp || new Date(),
            type: 'text',
            isRead: false,
            readBy: [],
          } as unknown as Message;
        } else if (data.lastMessage && typeof data.lastMessage === 'object') {
          const timestamp = normalizeTimestamp(data.lastMessage.timestamp);
          lastMessage = {
            ...data.lastMessage,
            timestamp: timestamp || new Date(),
          };
        }
        
        return {
          id: docSnap.id,
          participants,
          type,
          lastMessage,
          createdAt: normalizeTimestamp(data.createdAt) || undefined,
          updatedAt: normalizeTimestamp(data.updatedAt) || undefined,
          isActive: data.isActive !== false,
          requiresApproval: data.requiresApproval || false,
          unreadCount: typeof data.unreadCount === 'number' ? data.unreadCount : 0,
          messageCount: typeof data.messageCount === 'number' ? data.messageCount : 0,
        } as Conversation;
      }
      return null;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(participants: string[]): Promise<string> {
    try {
      const conversationRef = await addDoc(this.conversationsRef, {
        participants,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messageCount: 0,
        unreadCount: 0,
      });

      return conversationRef.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Delete a conversation and all its messages
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const conversationRef = doc(this.conversationsRef, conversationId);
      
      // Get all messages in the conversation
      const messagesRef = collection(conversationRef, 'messages');
      const messagesSnapshot = await getDocsQuery(messagesRef);
      
      // Delete all messages
      const deletePromises = messagesSnapshot.docs.map(messageDoc =>
        deleteDoc(doc(messagesRef, messageDoc.id))
      );
      await Promise.all(deletePromises);
      
      // Delete the conversation
      await deleteDoc(conversationRef);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
}

export const conversationService = new ConversationService();


