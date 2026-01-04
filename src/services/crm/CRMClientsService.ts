import { db } from '@/config/firebase.config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
  Timestamp,
  setDoc,
  serverTimestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import type { User } from '@/types';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/features/crm/types/pagination.types';
import {
  validatePaginationParams,
  createPaginatedResponse,
  calculateOffset,
} from '@/features/crm/utils/paginationUtils';
import { withErrorHandling } from '@/features/crm/utils/errorHandler';
import { messageService } from '../chat/MessageService';
import { conversationService } from '../chat/ConversationService';

/**
 * Service for CRM clients operations
 */
export class CRMClientsService {
  /**
   * Get clients with pagination and filtering
   */
  async getClientsPaginated(
    params: PaginationParams & {
      searchTerm?: string;
      segmentId?: string;
      tagIds?: string[];
      dateRange?: { start: Date; end: Date; field: 'createdAt' | 'lastBooking' };
      role?: string;
    }
  ): Promise<PaginatedResponse<User>> {
    return (
      (await withErrorHandling(async () => {
        const validatedParams = validatePaginationParams(params);
        const usersCollection = collection(db, 'users');

        let q = query(usersCollection);

        const roleFilter = params.role || 'petOwner';
        q = query(q, where('role', '==', roleFilter));

        if (params.dateRange) {
          const { start, end, field } = params.dateRange;
          if (field === 'createdAt') {
            q = query(q, where('createdAt', '>=', Timestamp.fromDate(start)));
            q = query(q, where('createdAt', '<=', Timestamp.fromDate(end)));
          }
        }

        const sortField = validatedParams.sortBy || 'createdAt';
        const sortOrder = validatedParams.sortOrder === 'asc' ? 'asc' : 'desc';
        q = query(q, orderBy(sortField, sortOrder));

        const countSnapshot = await getCountFromServer(q);
        const total = countSnapshot.data().count;

        const offset = calculateOffset(validatedParams.page, validatedParams.pageSize);
        if (offset > 0) {
          const allDocs = await getDocs(q);
          const allUsers = allDocs.docs.map((doc) => this.mapUserDocument(doc));
          
          const startIndex = offset;
          const endIndex = startIndex + validatedParams.pageSize;
          const paginatedUsers = allUsers.slice(startIndex, endIndex);

          let filteredUsers = paginatedUsers;
          if (params.searchTerm) {
            const searchLower = params.searchTerm.toLowerCase();
            filteredUsers = paginatedUsers.filter(
              (user) =>
                (user.firstName || '').toLowerCase().includes(searchLower) ||
                (user.lastName || '').toLowerCase().includes(searchLower) ||
                (user.email || '').toLowerCase().includes(searchLower)
            );
          }

          return createPaginatedResponse(filteredUsers, total, validatedParams);
        } else {
          q = query(q, limit(validatedParams.pageSize));
          const snapshot = await getDocs(q);
          const users = snapshot.docs.map((doc) => this.mapUserDocument(doc));

          let filteredUsers = users;
          if (params.searchTerm) {
            const searchLower = params.searchTerm.toLowerCase();
            filteredUsers = users.filter(
              (user) =>
                (user.firstName || '').toLowerCase().includes(searchLower) ||
                (user.lastName || '').toLowerCase().includes(searchLower) ||
                (user.email || '').toLowerCase().includes(searchLower)
            );
          }

          return createPaginatedResponse(filteredUsers, total, validatedParams);
        }
      })) || createPaginatedResponse([], 0, params)
    );
  }

  /**
   * Map Firestore document to User type
   */
  private mapUserDocument(doc: QueryDocumentSnapshot<DocumentData>): User {
    const data = doc.data();
    return {
      id: doc.id,
      email: data.email || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      role: data.role,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      profileImage: data.profileImage,
      phoneNumber: data.phoneNumber,
      address: data.address,
      pets: data.pets,
      certifications: data.certifications,
      rating: data.rating,
      totalBookings: data.totalBookings,
      directMessaging: data.directMessaging,
      petNames: data.petNames,
    } as User;
  }

  /**
   * Get or create a conversation between admin and client
   * Returns conversation ID for messaging
   * 
   * Decision: Query by adminId first, then filter in memory
   * Why: Firestore doesn't easily support querying for arrays containing multiple specific values
   * Alternative considered: Query by both (would require composite index and still need filtering)
   * Breaks if: Too many conversations per admin (would need pagination)
   */
  async getOrCreateAdminClientConversation(
    adminId: string,
    clientId: string
  ): Promise<string> {
    return (
      (await withErrorHandling(async () => {
        const conversationsRef = collection(db, 'conversations');
        
        // Search for existing conversations where admin is a participant
        // Query by adminId, then filter in memory for clientId
        const existingQuery = query(
          conversationsRef,
          where('participants', 'array-contains', adminId)
        );
        const existingSnapshot = await getDocs(existingQuery);
        
        // Find conversation that includes both admin and client
        // Handle both string[] and { userId: string }[] formats
        for (const docSnap of existingSnapshot.docs) {
          const data = docSnap.data();
          const participants = Array.isArray(data.participants)
            ? data.participants.map((p: any) => 
                typeof p === 'string' ? p : p?.userId || p
              ).filter((id): id is string => Boolean(id))
            : [];
          
          // Check if both admin and client are participants
          if (participants.includes(adminId) && participants.includes(clientId)) {
            return docSnap.id;
          }
        }
        
        // Create new conversation if none exists
        const conversationRef = doc(conversationsRef);
        const conversationId = conversationRef.id;
        
        await setDoc(conversationRef, {
          participants: [adminId, clientId],
          participantRoles: ['admin', 'petOwner'],
          type: 'admin-to-client',
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          messageCount: 0,
          unreadCount: 0,
          lastMessage: '',
          lastMessageAt: serverTimestamp(),
        });
        
        return conversationId;
      })) || ''
    );
  }

  /**
   * Send a message from admin to client
   */
  async sendMessageToClient(
    adminId: string,
    clientId: string,
    messageText: string
  ): Promise<string> {
    return (
      (await withErrorHandling(async () => {
        if (!messageText || !messageText.trim()) {
          throw new Error('Message text is required');
        }
        
        // Get or create conversation
        const conversationId = await this.getOrCreateAdminClientConversation(
          adminId,
          clientId
        );
        
        if (!conversationId) {
          throw new Error('Failed to create or find conversation');
        }
        
        // Send message using MessageService
        const messageId = await messageService.sendMessage(conversationId, {
          conversationId,
          senderId: adminId,
          content: messageText.trim(),
          text: messageText.trim(),
          type: 'text',
          timestamp: new Date(),
          isRead: false,
          read: false,
          readBy: [],
          senderType: 'admin',
        });
        
        return messageId;
      })) || ''
    );
  }
}

export const crmClientsService = new CRMClientsService();


