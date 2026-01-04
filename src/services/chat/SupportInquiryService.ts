import { db } from '@/config/firebase.config';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  type DocumentData,
  type QuerySnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import type { Conversation, Message } from '@/types';
import {
  normalizeConversationType,
  ADMIN_INQUIRY_TYPE,
  ADMIN_INQUIRY_ALL_VALUES,
} from '@/features/chat/utils/chatType';
import {
  normalizeParticipants,
  normalizeTimestamp,
} from '@/features/chat/utils/dataNormalization';

/**
 * Service for handling support inquiries and admin conversations
 */
export class SupportInquiryService {
  private conversationsRef = collection(db, 'conversations');

  /**
   * Get all support conversations (admin inquiries)
   */
  async getSupportConversations(): Promise<Conversation[]> {
    try {
      const q = query(
        this.conversationsRef,
        where('type', 'in', ADMIN_INQUIRY_ALL_VALUES as string[]),
        where('isPinned', '==', true),
        orderBy('lastMessageAt', 'desc')
      );
      const snapshot = await getDocs(q);
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
        } as Conversation;
      });
    } catch (error) {
      console.error('Error fetching support conversations:', error);
      throw error;
    }
  }

  /**
   * Subscribe to support conversations in real-time
   */
  subscribeToSupportConversations(
    callback: (conversations: Conversation[]) => void
  ): () => void {
    const q = query(
      this.conversationsRef,
      where('type', 'in', ADMIN_INQUIRY_ALL_VALUES as string[]),
      where('isPinned', '==', true),
      orderBy('lastMessageAt', 'desc')
    );
    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const conversations = snapshot.docs.map(doc => {
          const data = doc.data();
          const type = normalizeConversationType((data as any).type);
          let participants: { userId: string }[] = [];
          if (Array.isArray(data.participants)) {
            if (data.participants.length > 0 && typeof data.participants[0] === 'string') {
              participants = (data.participants as string[]).map(userId => ({ userId }));
            } else if (typeof data.participants[0]?.userId === 'string') {
              participants = (data.participants as Array<{ userId: string }>).map(p => ({ userId: p.userId }));
            }
          }
          let lastMessage = undefined as Conversation['lastMessage'] | undefined;
          if (typeof data.lastMessage === 'string' && data.lastMessageAt) {
            lastMessage = {
              id: data.lastMessageId || '',
              content: data.lastMessage,
              senderId: data.lastMessageSenderId || '',
              senderType: data.lastMessageSenderType || 'admin',
              timestamp: data.lastMessageAt?.toDate?.() || data.lastMessageAt,
              type: 'text',
              isRead: false,
              readBy: [],
            } as unknown as Message;
          } else if (data.lastMessage && typeof data.lastMessage === 'object') {
            lastMessage = {
              ...data.lastMessage,
              timestamp: data.lastMessage.timestamp?.toDate?.() || data.lastMessage.timestamp,
            };
          }
          return {
            id: doc.id,
            participants,
            type,
            lastMessage,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            isActive: data.isActive !== false,
            requiresApproval: data.requiresApproval || false,
            unreadCount: data.unreadCount || 0,
            messageCount: data.messageCount || 0,
          } as Conversation;
        }) as Conversation[];
        callback(conversations);
      },
      (error) => {
        console.error('[SupportInquiryService] Error in support conversations listener:', {
          error: error.message,
          code: error.code,
        });
        callback([]);
      }
    );
  }

  /**
   * Get pending inquiries
   */
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
    try {
      const inquiriesRef = collection(db, 'inquiries');
      const q = query(
        inquiriesRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fromUserId: data.fromUserId || '',
          fromUserRole: data.fromUserRole || '',
          toUserId: data.toUserId || '',
          subject: data.subject || '',
          initialMessage: data.initialMessage || '',
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
          conversationId: data.conversationId,
        };
      });
    } catch (error: any) {
      // Handle missing index error gracefully
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        console.warn(
          '[SupportInquiryService] Firestore index missing for inquiries query. ' +
          'Please deploy indexes: firebase deploy --only firestore:indexes',
          error
        );
        // Return empty array instead of throwing to prevent app crash
        // The index will be created automatically via the error link, or can be deployed manually
        return [];
      }
      console.error('[SupportInquiryService] Error fetching pending inquiries:', error);
      throw error;
    }
  }

  /**
   * Subscribe to inquiries in real-time
   */
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
    const inquiriesRef = collection(db, 'inquiries');
    const q = query(
      inquiriesRef,
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const inquiries = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            fromUserId: data.fromUserId || '',
            fromUserRole: data.fromUserRole || '',
            toUserId: data.toUserId || '',
            subject: data.subject || '',
            initialMessage: data.initialMessage || '',
            status: data.status || 'pending',
            createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
            conversationId: data.conversationId,
          };
        });
        callback(inquiries);
      },
      (error: any) => {
        // Handle missing index error gracefully
        if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
          console.warn(
            '[SupportInquiryService] Firestore index missing for inquiries query. ' +
            'Please deploy indexes: firebase deploy --only firestore:indexes. ' +
            'Returning empty array until index is deployed.',
            error
          );
          callback([]);
          return;
        }
        console.error('[SupportInquiryService] Error in inquiries listener:', error);
        callback([]);
      }
    );
  }

  /**
   * Accept an inquiry and create a conversation
   */
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
    try {
      console.log('[SupportInquiryService] Accepting inquiry', {
        inquiryId,
        fromUserId: inquiry.fromUserId,
        fromUserRole: inquiry.fromUserRole,
        adminId,
        subject: inquiry.subject,
      });

      // Create admin inquiry conversation (matches iOS pattern)
      const conversationRef = doc(this.conversationsRef);
      const conversationId = conversationRef.id;

      // Build participants: owner + admin
      const participants = [inquiry.fromUserId, adminId];
      const participantRoles = [inquiry.fromUserRole, 'admin'];

      // Create conversation with admin-inquiry type
      await setDoc(conversationRef, {
        participants,
        participantRoles,
        type: ADMIN_INQUIRY_TYPE,
        isPinned: true,
        pinnedName: 'SaviPets-Admin',
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        status: 'active',
        autoResponderSent: false,
        adminReplied: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messageCount: 0,
        unreadCount: 0,
      });

      // Seed initial message from inquiry
      const messagesRef = collection(conversationRef, 'messages');
      await addDoc(messagesRef, {
        conversationId,
        senderId: inquiry.fromUserId,
        text: inquiry.initialMessage,
        timestamp: serverTimestamp(),
        type: 'text',
        isRead: false,
        readBy: [],
      });

      // Update conversation with last message
      await updateDoc(conversationRef, {
        lastMessage: inquiry.initialMessage,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: inquiry.fromUserId,
        lastMessageSenderType: inquiry.fromUserRole,
        messageCount: 1,
        updatedAt: serverTimestamp(),
      });

      // Update inquiry: mark as accepted and link to conversation
      const inquiryRef = doc(collection(db, 'inquiries'), inquiryId);
      await updateDoc(inquiryRef, {
        status: 'accepted',
        conversationId,
        updatedAt: serverTimestamp(),
      });

      console.log('[SupportInquiryService] Inquiry accepted successfully', {
        inquiryId,
        conversationId,
        fromUserId: inquiry.fromUserId,
      });

      return conversationId;
    } catch (error) {
      console.error('[SupportInquiryService] Error accepting inquiry:', {
        inquiryId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

export const supportInquiryService = new SupportInquiryService();

