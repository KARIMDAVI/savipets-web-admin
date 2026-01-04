/**
 * Unit Tests for Conversation Deduplication
 * 
 * Tests the deduplication logic that groups conversations by participant pairs.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getParticipantPairKey,
  getConversationSortDate,
  deduplicateByParticipantPair,
} from './conversationDeduplication';
import type { Conversation } from '@/types';

describe('getParticipantPairKey', () => {
  it('should create same key for same participants in different order', () => {
    const conv1 = createMockConversation({
      id: 'conv1',
      participants: [{ userId: 'user1' }, { userId: 'user2' }],
    });
    const conv2 = createMockConversation({
      id: 'conv2',
      participants: [{ userId: 'user2' }, { userId: 'user1' }],
    });

    const key1 = getParticipantPairKey(conv1);
    const key2 = getParticipantPairKey(conv2);

    expect(key1).toBe(key2);
    expect(key1).toBe('user1|user2');
  });

  it('should handle string participants', () => {
    const conv = createMockConversation({
      participants: ['user1', 'user2'] as any,
    });

    const key = getParticipantPairKey(conv);
    expect(key).toBe('user1|user2');
  });

  it('should handle object participants with userId', () => {
    const conv = createMockConversation({
      participants: [{ userId: 'user1' }, { userId: 'user2' }],
    });

    const key = getParticipantPairKey(conv);
    expect(key).toBe('user1|user2');
  });

  it('should exclude admin ID when provided', () => {
    const conv = createMockConversation({
      participants: [{ userId: 'user1' }, { userId: 'admin1' }],
    });

    const key = getParticipantPairKey(conv, 'admin1');
    expect(key).toBe('user1');
  });

  it('should use conversation ID when no participants', () => {
    const conv = createMockConversation({
      id: 'fallback-id',
      participants: [],
    });

    const key = getParticipantPairKey(conv);
    expect(key).toBe('fallback-id');
  });

  it('should use conversation ID when participants is not an array', () => {
    const conv = createMockConversation({
      id: 'fallback-id',
      participants: null as any,
    });

    const key = getParticipantPairKey(conv);
    expect(key).toBe('fallback-id');
  });

  it('should filter out invalid participant entries', () => {
    const conv = createMockConversation({
      participants: [
        { userId: 'user1' },
        null as any,
        { userId: 'user2' },
        {} as any,
        'user3',
      ] as any,
    });

    const key = getParticipantPairKey(conv);
    expect(key).toBe('user1|user2|user3');
  });
});

describe('getConversationSortDate', () => {
  it('should use lastMessage.timestamp when available', () => {
    const date = new Date('2025-01-15');
    const conv = createMockConversation({
      lastMessage: {
        id: 'msg1',
        conversationId: 'conv1',
        senderId: 'user1',
        senderType: 'admin',
        content: 'test',
        timestamp: date,
        type: 'text',
        isRead: false,
        readBy: [],
      },
    });

    const sortDate = getConversationSortDate(conv);
    expect(sortDate).toBe(date.getTime());
  });

  it('should use lastMessageAt when available', () => {
    const date = new Date('2025-01-15');
    const conv = createMockConversation({
      lastMessageAt: date,
    } as any);

    const sortDate = getConversationSortDate(conv);
    expect(sortDate).toBe(date.getTime());
  });

  it('should use updatedAt as fallback', () => {
    const date = new Date('2025-01-15');
    const conv = createMockConversation({
      updatedAt: date,
    } as any);

    const sortDate = getConversationSortDate(conv);
    expect(sortDate).toBe(date.getTime());
  });

  it('should use createdAt as final fallback', () => {
    const date = new Date('2025-01-15');
    const conv = createMockConversation({
      createdAt: date,
      updatedAt: undefined,
      lastMessage: undefined,
      lastMessageAt: undefined,
    } as any);

    const sortDate = getConversationSortDate(conv);
    expect(sortDate).toBe(date.getTime());
  });

  it('should return 0 when no dates available', () => {
    const conv = createMockConversation({
      createdAt: undefined,
      updatedAt: undefined,
    } as any);

    const sortDate = getConversationSortDate(conv);
    expect(sortDate).toBe(0);
  });

  it('should handle Firestore Timestamp objects', () => {
    const date = new Date('2025-01-15');
    const firestoreTimestamp = {
      toDate: () => date,
    };

    const conv = createMockConversation({
      lastMessageAt: firestoreTimestamp as any,
    } as any);

    const sortDate = getConversationSortDate(conv);
    expect(sortDate).toBe(date.getTime());
  });
});

describe('deduplicateByParticipantPair', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should return empty array for empty input', () => {
    expect(deduplicateByParticipantPair([])).toEqual([]);
  });

  it('should return same array when no duplicates', () => {
    const convs = [
      createMockConversation({
        id: 'conv1',
        participants: [{ userId: 'user1' }, { userId: 'user2' }],
        updatedAt: new Date('2025-01-15'),
      }),
      createMockConversation({
        id: 'conv2',
        participants: [{ userId: 'user3' }, { userId: 'user4' }],
        updatedAt: new Date('2025-01-16'),
      }),
    ];

    const result = deduplicateByParticipantPair(convs);
    expect(result.length).toBe(2);
  });

  it('should deduplicate conversations with same participants', () => {
    const conv1 = createMockConversation({
      id: 'conv1',
      participants: [{ userId: 'user1' }, { userId: 'user2' }],
      updatedAt: new Date('2025-01-15'),
    });
    const conv2 = createMockConversation({
      id: 'conv2',
      participants: [{ userId: 'user2' }, { userId: 'user1' }], // Same, different order
      updatedAt: new Date('2025-01-16'),
    });

    const result = deduplicateByParticipantPair([conv1, conv2]);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('conv2'); // More recent one
  });

  it('should keep most recent conversation when duplicates exist', () => {
    const older = createMockConversation({
      id: 'older',
      participants: [{ userId: 'user1' }, { userId: 'user2' }],
      updatedAt: new Date('2025-01-15'),
    });
    const newer = createMockConversation({
      id: 'newer',
      participants: [{ userId: 'user1' }, { userId: 'user2' }],
      updatedAt: new Date('2025-01-20'),
    });

    const result = deduplicateByParticipantPair([older, newer]);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('newer');
  });

  it('should sort results by recency (most recent first)', () => {
    const convs = [
      createMockConversation({
        id: 'oldest',
        participants: [{ userId: 'user1' }],
        updatedAt: new Date('2025-01-10'),
      }),
      createMockConversation({
        id: 'newest',
        participants: [{ userId: 'user2' }],
        updatedAt: new Date('2025-01-20'),
      }),
      createMockConversation({
        id: 'middle',
        participants: [{ userId: 'user3' }],
        updatedAt: new Date('2025-01-15'),
      }),
    ];

    const result = deduplicateByParticipantPair(convs);
    expect(result[0].id).toBe('newest');
    expect(result[1].id).toBe('middle');
    expect(result[2].id).toBe('oldest');
  });

  it('should exclude admin from participant matching when provided', () => {
    const conv1 = createMockConversation({
      id: 'conv1',
      participants: [{ userId: 'user1' }, { userId: 'admin1' }],
      updatedAt: new Date('2025-01-15'),
    });
    const conv2 = createMockConversation({
      id: 'conv2',
      participants: [{ userId: 'user1' }], // Same after excluding admin
      updatedAt: new Date('2025-01-16'),
    });

    const result = deduplicateByParticipantPair([conv1, conv2], 'admin1');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('conv2');
  });
});

/**
 * Helper to create mock conversation objects for testing
 */
function createMockConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 'test-conversation-id',
    participants: [{ userId: 'user1' }],
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    requiresApproval: false,
    unreadCount: 0,
    messageCount: 0,
    ...overrides,
  } as Conversation;
}

