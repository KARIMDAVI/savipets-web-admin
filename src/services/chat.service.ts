import { db } from '@/config/firebase.config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  writeBatch,
  type DocumentData,
  type QuerySnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import type { Conversation, Message } from '@/types';
import {
  normalizeConversationType,
  ADMIN_INQUIRY_TYPE,
  ADMIN_INQUIRY_ALL_VALUES,
  CLIENT_SITTER_TYPE,
  SITTER_TO_CLIENT_TYPE,
} from '@/features/chat/utils/chatType';
import {
  normalizeParticipants,
  normalizeTimestamp,
  normalizeMessageText,
} from '@/features/chat/utils/dataNormalization';
import {
  validateMessageText,
  sanitizeMessageText,
} from '@/features/chat/utils/messageValidation';
import { conversationService } from './chat/ConversationService';
import { messageService } from './chat/MessageService';
import { supportInquiryService } from './chat/SupportInquiryService';

class ChatService {
  private conversationsRef = collection(db, 'conversations');
  // Note: Messages are stored in conversations/{conversationId}/messages/{messageId}
  // This top-level messagesRef is only used for search across all conversations
  private messagesRef = collection(db, 'messages');

  async getAllConversations(): Promise<Conversation[]> {
    return conversationService.getAllConversations();
  }

  async getConversationById(conversationId: string): Promise<Conversation | null> {
    return conversationService.getConversationById(conversationId);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return messageService.getMessages(conversationId);
  }

  async sendMessage(conversationId: string, messageData: Omit<Message, 'id'>): Promise<string> {
    return messageService.sendMessage(conversationId, messageData);
  }

  async getMessageCount(conversationId: string): Promise<number> {
    return messageService.getMessageCount(conversationId);
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    return messageService.markMessagesAsRead(conversationId, userId);
  }

  // Real-time listeners
  subscribeToConversations(
    callback: (conversations: Conversation[]) => void
  ): () => void {
    const q = query(
      this.conversationsRef,
      orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
      const conversations = snapshot.docs.map(doc => {
        const data = doc.data();
        const type = normalizeConversationType((data as any).type);
        const participants = normalizeParticipants(data.participants);
        
        // Map lastMessage summary to UI object
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
      
      callback(conversations);
      },
      (error) => {
        console.error('[ChatService] Error in conversations listener:', {
          error: error.message,
          code: error.code,
        });
        // Call callback with empty array on error to prevent UI from breaking
        callback([]);
      }
    );
  }

  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    // Messages are stored in conversations/{conversationId}/messages/{messageId}
    const messagesRef = collection(
      doc(this.conversationsRef, conversationId),
      'messages'
    );
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        const content = normalizeMessageText(data);
        const timestamp = normalizeTimestamp(data.timestamp) || new Date();
        return {
          id: doc.id,
          ...data,
          content,
          timestamp,
        } as Message;
      }) as Message[];
      
      callback(messages);
      },
      (error) => {
        console.error('[ChatService] Error in messages listener:', {
          conversationId,
          error: error.message,
          code: error.code,
        });
        // Call callback with empty array on error to prevent UI from breaking
        callback([]);
      }
    );
  }

  async getSupportConversations(): Promise<Conversation[]> {
    return supportInquiryService.getSupportConversations();
  }

  subscribeToSupportConversations(
    callback: (conversations: Conversation[]) => void
  ): () => void {
    return supportInquiryService.subscribeToSupportConversations(callback);
  }

  async createConversation(participants: string[]): Promise<string> {
    return conversationService.createConversation(participants);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    return conversationService.deleteConversation(conversationId);
  }

  async searchMessages(searchTerm: string, conversationId?: string): Promise<Message[]> {
    return messageService.searchMessages(searchTerm, conversationId);
  }

  async getPendingInquiries(): Promise<Array<{
    id: string;
    fromUserId: string;
    fromUserRole: string;
    toUserId: string;
    subject: string;
    initialMessage: string;
    status: string;
    createdAt: Date | null;
    conversationId?: string;
  }>> {
    return supportInquiryService.getPendingInquiries();
  }

  subscribeToInquiries(
    callback: (inquiries: Array<{
      id: string;
      fromUserId: string;
      fromUserRole: string;
      toUserId: string;
      subject: string;
      initialMessage: string;
      status: string;
      createdAt: Date | null;
      conversationId?: string;
    }>) => void
  ): () => void {
    return supportInquiryService.subscribeToInquiries(callback);
  }

  async acceptInquiry(
    inquiryId: string,
    inquiry: {
      fromUserId: string;
      fromUserRole: string;
      subject: string;
      initialMessage: string;
    },
    adminId: string
  ): Promise<string> {
    return supportInquiryService.acceptInquiry(inquiryId, inquiry, adminId);
  }
}

export const chatService = new ChatService();
