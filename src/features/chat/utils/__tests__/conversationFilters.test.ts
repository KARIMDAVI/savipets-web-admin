/**
 * Unit Tests: Conversation Filters
 * 
 * Tests for conversation filtering utilities including category-based filtering.
 */

import { describe, it, expect } from 'vitest';
import {
  isSupportConversation,
  isOwnerSitterConversation,
  filterByCategory,
} from '../conversationFilters';
import {
  createMockConversation,
  createMockUser,
  createMockConversationByCategory,
} from '@/test/utils/chatTestHelpers';
import type { Conversation } from '@/types';
import {
  ADMIN_INQUIRY_TYPE,
  CLIENT_SITTER_TYPE,
  SITTER_TO_CLIENT_TYPE,
} from '../chatType';

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
});

describe('filterByCategory', () => {
  const admin = createMockUser('admin');
  const sitter = createMockUser('petSitter');
  const owner = createMockUser('petOwner');
  const users = [admin, sitter, owner];

  it('should return all conversations when category is "all"', () => {
    const conv1 = createMockConversationByCategory('admin-sitter', users);
    const conv2 = createMockConversationByCategory('admin-owner', users);
    const conv3 = createMockConversationByCategory('sitter-owner', users);
    const conversations = [conv1, conv2, conv3];

    const filtered = filterByCategory(conversations, 'all', users);

    expect(filtered).toHaveLength(3);
    expect(filtered).toEqual(conversations);
  });

  it('should filter by admin-sitter category', () => {
    const adminSitterConv = createMockConversationByCategory('admin-sitter', users);
    const adminOwnerConv = createMockConversationByCategory('admin-owner', users);
    const sitterOwnerConv = createMockConversationByCategory('sitter-owner', users);
    const conversations = [adminSitterConv, adminOwnerConv, sitterOwnerConv];

    const filtered = filterByCategory(conversations, 'admin-sitter', users);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(adminSitterConv.id);
  });

  it('should filter by admin-owner category', () => {
    const adminSitterConv = createMockConversationByCategory('admin-sitter', users);
    const adminOwnerConv = createMockConversationByCategory('admin-owner', users);
    const sitterOwnerConv = createMockConversationByCategory('sitter-owner', users);
    const conversations = [adminSitterConv, adminOwnerConv, sitterOwnerConv];

    const filtered = filterByCategory(conversations, 'admin-owner', users);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(adminOwnerConv.id);
  });

  it('should filter by sitter-owner category', () => {
    const adminSitterConv = createMockConversationByCategory('admin-sitter', users);
    const adminOwnerConv = createMockConversationByCategory('admin-owner', users);
    const sitterOwnerConv = createMockConversationByCategory('sitter-owner', users);
    const conversations = [adminSitterConv, adminOwnerConv, sitterOwnerConv];

    const filtered = filterByCategory(conversations, 'sitter-owner', users);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(sitterOwnerConv.id);
  });

  it('should filter by unknown category', () => {
    const unknownConv = createMockConversation({ participants: [] });
    const adminSitterConv = createMockConversationByCategory('admin-sitter', users);
    const conversations = [unknownConv, adminSitterConv];

    const filtered = filterByCategory(conversations, 'unknown', users);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(unknownConv.id);
  });

  it('should handle empty conversations array', () => {
    const filtered = filterByCategory([], 'admin-sitter', users);

    expect(filtered).toHaveLength(0);
  });

  it('should handle multiple conversations in same category', () => {
    const conv1 = createMockConversationByCategory('admin-sitter', users);
    const conv2 = createMockConversationByCategory('admin-sitter', users);
    const conv3 = createMockConversationByCategory('admin-owner', users);
    const conversations = [conv1, conv2, conv3];

    const filtered = filterByCategory(conversations, 'admin-sitter', users);

    expect(filtered).toHaveLength(2);
    expect(filtered.map(c => c.id)).toContain(conv1.id);
    expect(filtered.map(c => c.id)).toContain(conv2.id);
  });
});

