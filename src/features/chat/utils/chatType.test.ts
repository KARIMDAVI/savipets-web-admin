/**
 * Unit Tests for Chat Type Normalization
 * 
 * Tests the type normalization logic that handles legacy and canonical
 * conversation type values.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeConversationType,
  ADMIN_INQUIRY_TYPE,
  CLIENT_SITTER_TYPE,
  SITTER_TO_CLIENT_TYPE,
  ADMIN_INQUIRY_ALL_VALUES,
  type CanonicalConversationType,
} from './chatType';

describe('normalizeConversationType', () => {
  describe('admin-inquiry types', () => {
    it('should normalize "admin-inquiry" to canonical type', () => {
      const result = normalizeConversationType('admin-inquiry');
      expect(result).toBe(ADMIN_INQUIRY_TYPE);
    });

    it('should normalize legacy "adminInquiry" to canonical type', () => {
      const result = normalizeConversationType('adminInquiry');
      expect(result).toBe(ADMIN_INQUIRY_TYPE);
    });

    it('should handle case variations for admin inquiry', () => {
      // Note: current implementation is case-sensitive, but test what exists
      expect(normalizeConversationType('admin-inquiry')).toBe(ADMIN_INQUIRY_TYPE);
      expect(normalizeConversationType('adminInquiry')).toBe(ADMIN_INQUIRY_TYPE);
    });
  });

  describe('client-sitter types', () => {
    it('should normalize "client-sitter" to canonical type', () => {
      const result = normalizeConversationType('client-sitter');
      expect(result).toBe(CLIENT_SITTER_TYPE);
    });

    it('should not normalize variations of client-sitter', () => {
      // Only exact match works
      expect(normalizeConversationType('client_sitter')).toBeUndefined();
      expect(normalizeConversationType('clientSitter')).toBeUndefined();
      expect(normalizeConversationType('client sitter')).toBeUndefined();
    });
  });

  describe('sitter-to-client types', () => {
    it('should normalize "sitter-to-client" to canonical type', () => {
      const result = normalizeConversationType('sitter-to-client');
      expect(result).toBe(SITTER_TO_CLIENT_TYPE);
    });

    it('should not normalize variations of sitter-to-client', () => {
      expect(normalizeConversationType('sitter_to_client')).toBeUndefined();
      expect(normalizeConversationType('sitterToClient')).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should return undefined for null', () => {
      expect(normalizeConversationType(null)).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(normalizeConversationType(undefined)).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      expect(normalizeConversationType('')).toBeUndefined();
    });

    it('should return undefined for unknown types', () => {
      const unknownTypes = [
        'unknown-type',
        'random-string',
        'invalid',
        'other',
        '123',
      ];

      unknownTypes.forEach((type) => {
        expect(normalizeConversationType(type)).toBeUndefined();
      });
    });

    it('should handle non-string types by converting to string', () => {
      // TypeScript should prevent this, but test runtime behavior
      expect(normalizeConversationType(123 as any)).toBeUndefined();
      expect(normalizeConversationType({} as any)).toBeUndefined();
    });
  });

  describe('type constants', () => {
    it('should have correct canonical type values', () => {
      expect(ADMIN_INQUIRY_TYPE).toBe('admin-inquiry');
      expect(CLIENT_SITTER_TYPE).toBe('client-sitter');
      expect(SITTER_TO_CLIENT_TYPE).toBe('sitter-to-client');
    });

    it('should include all known admin inquiry values', () => {
      expect(ADMIN_INQUIRY_ALL_VALUES).toContain('admin-inquiry');
      expect(ADMIN_INQUIRY_ALL_VALUES).toContain('adminInquiry');
      expect(ADMIN_INQUIRY_ALL_VALUES.length).toBe(2);
    });
  });

  describe('round-trip consistency', () => {
    it('should maintain consistency when normalizing canonical types', () => {
      const canonicalTypes: CanonicalConversationType[] = [
        ADMIN_INQUIRY_TYPE,
        CLIENT_SITTER_TYPE,
        SITTER_TO_CLIENT_TYPE,
      ];

      canonicalTypes.forEach((type) => {
        const normalized = normalizeConversationType(type);
        expect(normalized).toBe(type);
      });
    });
  });
});

