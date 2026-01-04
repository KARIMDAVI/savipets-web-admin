/**
 * Unit Tests for Conversation Filters
 * 
 * Tests the conversation type filtering utilities.
 */

import { describe, it, expect } from 'vitest';
import {
  isSupportConversation,
  isOwnerSitterConversation,
} from './conversationFilters';
import {
  ADMIN_INQUIRY_TYPE,
  CLIENT_SITTER_TYPE,
  SITTER_TO_CLIENT_TYPE,
} from './chatType';
import type { Conversation } from '@/types';

describe('isSupportConversation', () => {
  it('should return true for admin-inquiry type', () => {
    const conversation = createMockConversation({
      type: ADMIN_INQUIRY_TYPE,
    });

    expect(isSupportConversation(conversation)).toBe(true);
  });

  it('should return false for client-sitter type', () => {
    const conversation = createMockConversation({
      type: CLIENT_SITTER_TYPE,
    });

    expect(isSupportConversation(conversation)).toBe(false);
  });

  it('should return false for sitter-to-client type', () => {
    const conversation = createMockConversation({
      type: SITTER_TO_CLIENT_TYPE,
    });

    expect(isSupportConversation(conversation)).toBe(false);
  });

  it('should return false when type is undefined', () => {
    const conversation = createMockConversation({
      // type not set
    });

    expect(isSupportConversation(conversation)).toBe(false);
  });

  it('should return false for unknown types', () => {
    const conversation = createMockConversation({
      type: 'unknown-type',
    });

    expect(isSupportConversation(conversation)).toBe(false);
  });
});

describe('isOwnerSitterConversation', () => {
  it('should return true for client-sitter type', () => {
    const conversation = createMockConversation({
      type: CLIENT_SITTER_TYPE,
    });

    expect(isOwnerSitterConversation(conversation)).toBe(true);
  });

  it('should return true for sitter-to-client type', () => {
    const conversation = createMockConversation({
      type: SITTER_TO_CLIENT_TYPE,
    });

    expect(isOwnerSitterConversation(conversation)).toBe(true);
  });

  it('should return false for admin-inquiry type', () => {
    const conversation = createMockConversation({
      type: ADMIN_INQUIRY_TYPE,
    });

    expect(isOwnerSitterConversation(conversation)).toBe(false);
  });

  it('should return false when type is undefined', () => {
    const conversation = createMockConversation({
      // type not set
    });

    expect(isOwnerSitterConversation(conversation)).toBe(false);
  });

  it('should return false for unknown types', () => {
    const conversation = createMockConversation({
      type: 'unknown-type',
    });

    expect(isOwnerSitterConversation(conversation)).toBe(false);
  });
});

describe('filter consistency', () => {
  it('should have mutually exclusive filters for known types', () => {
    const types = [
      ADMIN_INQUIRY_TYPE,
      CLIENT_SITTER_TYPE,
      SITTER_TO_CLIENT_TYPE,
    ];

    types.forEach((type) => {
      const conversation = createMockConversation({ type });
      const isSupport = isSupportConversation(conversation);
      const isOwnerSitter = isOwnerSitterConversation(conversation);

      // For known types, exactly one should be true
      if (type === ADMIN_INQUIRY_TYPE) {
        expect(isSupport).toBe(true);
        expect(isOwnerSitter).toBe(false);
      } else {
        expect(isSupport).toBe(false);
        expect(isOwnerSitter).toBe(true);
      }
    });
  });
});

/**
 * Helper to create mock conversation objects for testing
 */
function createMockConversation(overrides: {
  type?: string;
  id?: string;
} = {}): Conversation & { type?: string } {
  return {
    id: overrides.id || 'test-conversation-id',
    participants: [{ userId: 'user1' }],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    requiresApproval: false,
    unreadCount: 0,
    messageCount: 0,
    ...overrides,
  } as Conversation & { type?: string };
}

