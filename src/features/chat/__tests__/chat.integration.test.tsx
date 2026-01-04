/**
 * Integration Tests: Chat Organization System
 * 
 * Tests the integration between utilities, components, and hooks:
 * - Category detection with grouping
 * - Filtering with category stats
 * - Component integration with utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createMockUser,
  createMockConversationByCategory,
} from '@/test/utils/chatTestHelpers';
import type { User } from '@/types';
import { getConversationCategory } from '../utils/conversationTypeDetection';
import { groupConversationsByCategory, calculateCategoryStats } from '../utils/conversationGrouping';
import { filterByCategory } from '../utils/conversationFilters';

describe('Chat Organization Integration', () => {
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

  describe('Category Detection with Grouping', () => {
    it('should correctly categorize and group conversations', () => {
      const adminSitterConv = createMockConversationByCategory('admin-sitter', users);
      const adminOwnerConv = createMockConversationByCategory('admin-owner', users);
      const sitterOwnerConv = createMockConversationByCategory('sitter-owner', users);
      const conversations = [adminSitterConv, adminOwnerConv, sitterOwnerConv];

      // Test category detection
      expect(getConversationCategory(adminSitterConv, users)).toBe('admin-sitter');
      expect(getConversationCategory(adminOwnerConv, users)).toBe('admin-owner');
      expect(getConversationCategory(sitterOwnerConv, users)).toBe('sitter-owner');

      // Test grouping
      const grouped = groupConversationsByCategory(conversations, users);
      expect(grouped['admin-sitter']).toHaveLength(1);
      expect(grouped['admin-owner']).toHaveLength(1);
      expect(grouped['sitter-owner']).toHaveLength(1);
      expect(grouped['unknown']).toHaveLength(0);
    });
  });

  describe('Filtering with Stats', () => {
    it('should filter conversations and calculate stats correctly', () => {
      const adminSitterConv1 = createMockConversationByCategory('admin-sitter', users);
      const adminSitterConv2 = createMockConversationByCategory('admin-sitter', users);
      const adminOwnerConv = createMockConversationByCategory('admin-owner', users);
      const sitterOwnerConv = createMockConversationByCategory('sitter-owner', users);
      const conversations = [adminSitterConv1, adminSitterConv2, adminOwnerConv, sitterOwnerConv];

      // Add unread counts
      adminSitterConv1.unreadCount = 2;
      adminSitterConv2.unreadCount = 0;
      adminOwnerConv.unreadCount = 1;
      sitterOwnerConv.unreadCount = 0;

      // Calculate stats
      const stats = calculateCategoryStats(conversations, users);
      expect(stats['admin-sitter'].total).toBe(2);
      expect(stats['admin-sitter'].unread).toBe(1); // One has unread
      expect(stats['admin-owner'].total).toBe(1);
      expect(stats['admin-owner'].unread).toBe(1);
      expect(stats['sitter-owner'].total).toBe(1);
      expect(stats['sitter-owner'].unread).toBe(0);

      // Test filtering
      const filtered = filterByCategory(conversations, 'admin-sitter', users);
      expect(filtered).toHaveLength(2);
      expect(filtered.every(c => getConversationCategory(c, users) === 'admin-sitter')).toBe(true);
    });
  });

  describe('End-to-End Flow', () => {
    it('should handle complete filtering workflow', () => {
      const adminSitterConv = createMockConversationByCategory('admin-sitter', users);
      const adminOwnerConv = createMockConversationByCategory('admin-owner', users);
      const sitterOwnerConv = createMockConversationByCategory('sitter-owner', users);
      const conversations = [adminSitterConv, adminOwnerConv, sitterOwnerConv];

      // Step 1: Group conversations
      const grouped = groupConversationsByCategory(conversations, users);
      expect(Object.keys(grouped)).toHaveLength(4); // 4 categories

      // Step 2: Calculate stats
      const stats = calculateCategoryStats(conversations, users);
      expect(stats['admin-sitter'].total).toBe(1);
      expect(stats['admin-owner'].total).toBe(1);
      expect(stats['sitter-owner'].total).toBe(1);

      // Step 3: Filter by category
      const adminSitterFiltered = filterByCategory(conversations, 'admin-sitter', users);
      expect(adminSitterFiltered).toHaveLength(1);
      expect(getConversationCategory(adminSitterFiltered[0], users)).toBe('admin-sitter');

      // Step 4: Filter by another category
      const adminOwnerFiltered = filterByCategory(conversations, 'admin-owner', users);
      expect(adminOwnerFiltered).toHaveLength(1);
      expect(getConversationCategory(adminOwnerFiltered[0], users)).toBe('admin-owner');

      // Step 5: Filter by 'all' should return all
      const allFiltered = filterByCategory(conversations, 'all', users);
      expect(allFiltered).toHaveLength(3);
    });
  });

  describe('Performance with Large Dataset', () => {
    it('should handle large number of conversations efficiently', () => {
      // Create 100 conversations
      const conversations = [];
      for (let i = 0; i < 100; i++) {
        const category = i % 3 === 0 ? 'admin-sitter' : i % 3 === 1 ? 'admin-owner' : 'sitter-owner';
        conversations.push(createMockConversationByCategory(category, users));
      }

      const startTime = performance.now();

      // Group conversations
      const grouped = groupConversationsByCategory(conversations, users);

      // Calculate stats
      const stats = calculateCategoryStats(conversations, users);

      // Filter conversations
      const filtered = filterByCategory(conversations, 'admin-sitter', users);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in less than 50ms
      expect(duration).toBeLessThan(50);

      // Verify results
      expect(grouped['admin-sitter'].length + grouped['admin-owner'].length + grouped['sitter-owner'].length).toBe(100);
      expect(stats['admin-sitter'].total + stats['admin-owner'].total + stats['sitter-owner'].total).toBe(100);
      expect(filtered.length).toBeGreaterThan(0);
    });
  });
});

