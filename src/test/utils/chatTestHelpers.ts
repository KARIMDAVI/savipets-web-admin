/**
 * Chat Test Helpers
 * 
 * Test utilities and mock data generators for chat feature testing.
 * These helpers provide consistent mock data for conversations, users, and messages.
 */

import type { Conversation, User, Message } from '@/types';
import type { ConversationCategory } from '@/features/chat/types/conversation.types';

/**
 * Test Helper: Create mock conversation
 * 
 * @param overrides - Partial conversation data to override defaults
 * @returns Mock Conversation object
 */
export function createMockConversation(
  overrides?: Partial<Conversation>
): Conversation {
  const randomId = Math.random().toString(36).substring(2, 11);
  return {
    id: `conv-${randomId}`,
    participants: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    requiresApproval: false,
    unreadCount: 0,
    messageCount: 0,
    ...overrides,
  };
}

/**
 * Test Helper: Create mock user
 * 
 * @param role - User role (admin, petOwner, or petSitter)
 * @param overrides - Partial user data to override defaults
 * @returns Mock User object
 */
export function createMockUser(
  role: 'admin' | 'petOwner' | 'petSitter',
  overrides?: Partial<User>
): User {
  const randomId = Math.random().toString(36).substring(2, 11);
  const roleDisplayName = role === 'petOwner' 
    ? 'Owner' 
    : role === 'petSitter' 
    ? 'Sitter' 
    : 'Admin';
  
  return {
    id: `user-${randomId}`,
    email: `test-${role}@example.com`,
    firstName: 'Test',
    lastName: roleDisplayName,
    role,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Test Helper: Create mock message
 * 
 * @param conversationId - ID of the conversation this message belongs to
 * @param senderId - ID of the message sender
 * @param overrides - Partial message data to override defaults
 * @returns Mock Message object
 */
export function createMockMessage(
  conversationId: string,
  senderId: string,
  overrides?: Partial<Message>
): Message {
  const randomId = Math.random().toString(36).substring(2, 11);
  return {
    id: `msg-${randomId}`,
    conversationId,
    senderId,
    senderType: 'admin',
    content: 'Test message content',
    timestamp: new Date(),
    type: 'text',
    isRead: false,
    readBy: [],
    ...overrides,
  };
}

/**
 * Test Helper: Create conversation with specific category
 * 
 * @param category - Desired conversation category
 * @param users - Array of users to use for participants
 * @returns Mock Conversation with appropriate participants and type
 */
export function createMockConversationByCategory(
  category: ConversationCategory,
  users: User[]
): Conversation {
  let participants: { userId: string }[] = [];
  let type: Conversation['type'] | undefined;

  switch (category) {
    case 'admin-sitter': {
      const admin = users.find(u => u.role === 'admin');
      const sitter = users.find(u => u.role === 'petSitter');
      if (admin && sitter) {
        participants = [
          { userId: admin.id },
          { userId: sitter.id },
        ];
        type = 'admin-inquiry';
      }
      break;
    }
    case 'admin-owner': {
      const admin = users.find(u => u.role === 'admin');
      const owner = users.find(u => u.role === 'petOwner');
      if (admin && owner) {
        participants = [
          { userId: admin.id },
          { userId: owner.id },
        ];
        type = 'admin-inquiry';
      }
      break;
    }
    case 'sitter-owner': {
      const sitter = users.find(u => u.role === 'petSitter');
      const owner = users.find(u => u.role === 'petOwner');
      if (sitter && owner) {
        participants = [
          { userId: sitter.id },
          { userId: owner.id },
        ];
        type = 'sitter-to-client';
      }
      break;
    }
    case 'unknown':
    default:
      participants = [];
      type = undefined;
      break;
  }

  return createMockConversation({
    participants,
    type,
  });
}

