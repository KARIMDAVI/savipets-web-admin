/**
 * Unit Tests for Chat Permissions
 * 
 * Tests the permission evaluation logic for admin send permissions.
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateAdminSendPermission,
  type ChatSendPermissionResult,
  type ChatSendBlockReason,
} from './chatPermissions';
import { ADMIN_INQUIRY_TYPE } from './chatType';
import type { Conversation } from '@/types';

describe('evaluateAdminSendPermission', () => {
  describe('null/undefined conversation', () => {
    it('should block send when conversation is null', () => {
      const result = evaluateAdminSendPermission(null);
      
      expect(result.canSend).toBe(false);
      expect(result.reason).toBe('no-conversation');
    });

    it('should block send when conversation is undefined', () => {
      const result = evaluateAdminSendPermission(undefined);
      
      expect(result.canSend).toBe(false);
      expect(result.reason).toBe('no-conversation');
    });
  });

  describe('admin-inquiry conversations', () => {
    it('should allow send for admin-inquiry type', () => {
      const conversation = createMockConversation({
        type: ADMIN_INQUIRY_TYPE,
      });

      const result = evaluateAdminSendPermission(conversation);
      
      expect(result.canSend).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should allow send even if admin-inquiry is marked inactive', () => {
      const conversation = createMockConversation({
        type: ADMIN_INQUIRY_TYPE,
        isActive: false,
      });

      const result = evaluateAdminSendPermission(conversation);
      
      expect(result.canSend).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });

  describe('inactive conversations', () => {
    it('should block send when isActive is explicitly false', () => {
      const conversation = createMockConversation({
        type: 'client-sitter',
        isActive: false,
      });

      const result = evaluateAdminSendPermission(conversation);
      
      expect(result.canSend).toBe(false);
      expect(result.reason).toBe('inactive-conversation');
    });

    it('should allow send when isActive is true', () => {
      const conversation = createMockConversation({
        type: 'client-sitter',
        isActive: true,
      });

      const result = evaluateAdminSendPermission(conversation);
      
      expect(result.canSend).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should allow send when isActive is undefined (defaults to active)', () => {
      const conversation = createMockConversation({
        type: 'client-sitter',
        // isActive not set
      });

      const result = evaluateAdminSendPermission(conversation);
      
      expect(result.canSend).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });

  describe('other conversation types', () => {
    it('should allow send for client-sitter type', () => {
      const conversation = createMockConversation({
        type: 'client-sitter',
      });

      const result = evaluateAdminSendPermission(conversation);
      
      expect(result.canSend).toBe(true);
    });

    it('should allow send for sitter-to-client type', () => {
      const conversation = createMockConversation({
        type: 'sitter-to-client',
      });

      const result = evaluateAdminSendPermission(conversation);
      
      expect(result.canSend).toBe(true);
    });

    it('should allow send when type is undefined', () => {
      const conversation = createMockConversation({
        // type not set
      });

      const result = evaluateAdminSendPermission(conversation);
      
      expect(result.canSend).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle conversation with minimal fields', () => {
      const conversation = {
        id: 'test-id',
        participants: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        requiresApproval: false,
        unreadCount: 0,
        messageCount: 0,
      } as Conversation;

      const result = evaluateAdminSendPermission(conversation);
      
      expect(result.canSend).toBe(true);
    });

    it('should prioritize admin-inquiry over inactive status', () => {
      const conversation = createMockConversation({
        type: ADMIN_INQUIRY_TYPE,
        isActive: false,
      });

      const result = evaluateAdminSendPermission(conversation);
      
      // Admin inquiries should always be sendable
      expect(result.canSend).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });
});

/**
 * Helper to create mock conversation objects for testing
 */
function createMockConversation(overrides: {
  type?: string;
  isActive?: boolean;
  id?: string;
} = {}): Conversation & { type?: string; isActive?: boolean } {
  return {
    id: overrides.id || 'test-conversation-id',
    participants: [{ userId: 'user1' }],
    isActive: overrides.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
    requiresApproval: false,
    unreadCount: 0,
    messageCount: 0,
    ...overrides,
  } as Conversation & { type?: string; isActive?: boolean };
}

