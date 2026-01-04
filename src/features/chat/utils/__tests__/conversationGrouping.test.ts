/**
 * Unit Tests: Conversation Grouping
 * 
 * Tests for grouping conversations by category and calculating category stats.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  groupConversationsByCategory,
  calculateCategoryStats,
} from '../conversationGrouping';
import {
  createMockConversation,
  createMockUser,
  createMockConversationByCategory,
} from '@/test/utils/chatTestHelpers';
import type { Conversation, User } from '@/types';

describe('groupConversationsByCategory', () => {
  let admin: User;
  let sitter: User;
  let owner: User;
  let users: User[];

  beforeEach(() => {
    admin = createMockUser('admin');
    sitter = createMockUser('petSitter');
    owner = createMockUser('petOwner');
    users = [admin, sitter, owner];
  });

  it('should group conversations by category correctly', () => {
    const adminSitterConv = createMockConversationByCategory('admin-sitter', users);
    const adminOwnerConv = createMockConversationByCategory('admin-owner', users);
    const sitterOwnerConv = createMockConversationByCategory('sitter-owner', users);
    const unknownConv = createMockConversation({ participants: [] });

    const conversations = [adminSitterConv, adminOwnerConv, sitterOwnerConv, unknownConv];

    const grouped = groupConversationsByCategory(conversations, users);

    expect(grouped['admin-sitter']).toHaveLength(1);
    expect(grouped['admin-sitter'][0].id).toBe(adminSitterConv.id);
    expect(grouped['admin-owner']).toHaveLength(1);
    expect(grouped['admin-owner'][0].id).toBe(adminOwnerConv.id);
    expect(grouped['sitter-owner']).toHaveLength(1);
    expect(grouped['sitter-owner'][0].id).toBe(sitterOwnerConv.id);
    expect(grouped['unknown']).toHaveLength(1);
    expect(grouped['unknown'][0].id).toBe(unknownConv.id);
  });

  it('should handle empty conversations array', () => {
    const grouped = groupConversationsByCategory([], users);

    expect(grouped['admin-sitter']).toHaveLength(0);
    expect(grouped['admin-owner']).toHaveLength(0);
    expect(grouped['sitter-owner']).toHaveLength(0);
    expect(grouped['unknown']).toHaveLength(0);
  });

  it('should handle multiple conversations in same category', () => {
    const conv1 = createMockConversationByCategory('admin-sitter', users);
    const conv2 = createMockConversationByCategory('admin-sitter', users);
    const conv3 = createMockConversationByCategory('admin-sitter', users);

    const conversations = [conv1, conv2, conv3];
    const grouped = groupConversationsByCategory(conversations, users);

    expect(grouped['admin-sitter']).toHaveLength(3);
    expect(grouped['admin-owner']).toHaveLength(0);
    expect(grouped['sitter-owner']).toHaveLength(0);
    expect(grouped['unknown']).toHaveLength(0);
  });

  it('should handle conversations with missing users', () => {
    const conv = createMockConversation({
      participants: [{ userId: 'non-existent' }],
    });

    const grouped = groupConversationsByCategory([conv], users);

    expect(grouped['unknown']).toHaveLength(1);
  });
});

describe('calculateCategoryStats', () => {
  let admin: User;
  let sitter: User;
  let owner: User;
  let users: User[];

  beforeEach(() => {
    admin = createMockUser('admin');
    sitter = createMockUser('petSitter');
    owner = createMockUser('petOwner');
    users = [admin, sitter, owner];
  });

  it('should calculate stats correctly for each category', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000); // 25 hours ago

    // Active conversation (message in last 24 hours)
    const activeConv = createMockConversationByCategory('admin-sitter', users);
    activeConv.lastMessage = {
      id: 'msg-1',
      conversationId: activeConv.id,
      senderId: admin.id,
      senderType: 'admin',
      content: 'Test',
      timestamp: now,
      type: 'text',
      isRead: false,
      readBy: [],
    };
    activeConv.unreadCount = 2;

    // Inactive conversation (message older than 24 hours)
    const inactiveConv = createMockConversationByCategory('admin-owner', users);
    inactiveConv.lastMessage = {
      id: 'msg-2',
      conversationId: inactiveConv.id,
      senderId: admin.id,
      senderType: 'admin',
      content: 'Test',
      timestamp: yesterday,
      type: 'text',
      isRead: false,
      readBy: [],
    };
    inactiveConv.unreadCount = 0;

    // Conversation with unread messages
    const unreadConv = createMockConversationByCategory('sitter-owner', users);
    unreadConv.unreadCount = 5;
    unreadConv.lastMessage = {
      id: 'msg-3',
      conversationId: unreadConv.id,
      senderId: sitter.id,
      senderType: 'petSitter',
      content: 'Test',
      timestamp: now,
      type: 'text',
      isRead: false,
      readBy: [],
    };

    const conversations = [activeConv, inactiveConv, unreadConv];
    const stats = calculateCategoryStats(conversations, users);

    expect(stats['admin-sitter'].total).toBe(1);
    expect(stats['admin-sitter'].unread).toBe(1); // activeConv has unread
    expect(stats['admin-sitter'].active).toBe(1); // activeConv is active

    expect(stats['admin-owner'].total).toBe(1);
    expect(stats['admin-owner'].unread).toBe(0);
    expect(stats['admin-owner'].active).toBe(0); // inactiveConv is not active

    expect(stats['sitter-owner'].total).toBe(1);
    expect(stats['sitter-owner'].unread).toBe(1); // unreadConv has unread
    expect(stats['sitter-owner'].active).toBe(1); // unreadConv is active

    expect(stats['unknown'].total).toBe(0);
  });

  it('should handle empty conversations array', () => {
    const stats = calculateCategoryStats([], users);

    expect(stats['admin-sitter'].total).toBe(0);
    expect(stats['admin-sitter'].unread).toBe(0);
    expect(stats['admin-sitter'].active).toBe(0);

    expect(stats['admin-owner'].total).toBe(0);
    expect(stats['sitter-owner'].total).toBe(0);
    expect(stats['unknown'].total).toBe(0);
  });

  it('should correctly identify active conversations (within 24 hours)', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const activeConv = createMockConversationByCategory('admin-sitter', users);
    activeConv.lastMessage = {
      id: 'msg-1',
      conversationId: activeConv.id,
      senderId: admin.id,
      senderType: 'admin',
      content: 'Test',
      timestamp: oneHourAgo,
      type: 'text',
      isRead: false,
      readBy: [],
    };

    const inactiveConv = createMockConversationByCategory('admin-sitter', users);
    inactiveConv.lastMessage = {
      id: 'msg-2',
      conversationId: inactiveConv.id,
      senderId: admin.id,
      senderType: 'admin',
      content: 'Test',
      timestamp: twoDaysAgo,
      type: 'text',
      isRead: false,
      readBy: [],
    };

    const conversations = [activeConv, inactiveConv];
    const stats = calculateCategoryStats(conversations, users);

    expect(stats['admin-sitter'].active).toBe(1); // Only activeConv is active
  });

  it('should count unread messages correctly', () => {
    const conv1 = createMockConversationByCategory('admin-sitter', users);
    conv1.unreadCount = 3;

    const conv2 = createMockConversationByCategory('admin-sitter', users);
    conv2.unreadCount = 5;

    const conv3 = createMockConversationByCategory('admin-sitter', users);
    conv3.unreadCount = 0;

    const conversations = [conv1, conv2, conv3];
    const stats = calculateCategoryStats(conversations, users);

    expect(stats['admin-sitter'].unread).toBe(2); // conv1 and conv2 have unread
  });
});

