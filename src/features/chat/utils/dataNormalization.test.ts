/**
 * Unit Tests for Data Normalization
 * 
 * Tests the data normalization utilities that handle edge cases
 * and malformed data from Firestore.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  normalizeParticipants,
  normalizeTimestamp,
  normalizeMessageText,
} from './dataNormalization';

describe('normalizeParticipants', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return empty array for null', () => {
    expect(normalizeParticipants(null)).toEqual([]);
  });

  it('should return empty array for undefined', () => {
    expect(normalizeParticipants(undefined)).toEqual([]);
  });

  it('should return empty array for empty array', () => {
    expect(normalizeParticipants([])).toEqual([]);
  });

  describe('string array format', () => {
    it('should convert string array to object array', () => {
      const result = normalizeParticipants(['user1', 'user2']);
      expect(result).toEqual([
        { userId: 'user1' },
        { userId: 'user2' },
      ]);
    });

    it('should filter out invalid string entries', () => {
      const result = normalizeParticipants(['user1', '', null, 'user2', undefined]);
      expect(result).toEqual([
        { userId: 'user1' },
        { userId: 'user2' },
      ]);
    });

    it('should handle single string', () => {
      const result = normalizeParticipants(['user1']);
      expect(result).toEqual([{ userId: 'user1' }]);
    });
  });

  describe('object array format', () => {
    it('should normalize object array with userId', () => {
      const result = normalizeParticipants([
        { userId: 'user1' },
        { userId: 'user2' },
      ]);
      expect(result).toEqual([
        { userId: 'user1' },
        { userId: 'user2' },
      ]);
    });

    it('should filter out objects without userId', () => {
      const result = normalizeParticipants([
        { userId: 'user1' },
        { name: 'user2' },
        { userId: 'user3' },
        {},
        null,
      ]);
      expect(result).toEqual([
        { userId: 'user1' },
        { userId: 'user3' },
      ]);
    });

    it('should filter out objects with non-string userId', () => {
      const result = normalizeParticipants([
        { userId: 'user1' },
        { userId: 123 },
        { userId: null },
        { userId: 'user2' },
      ]);
      expect(result).toEqual([
        { userId: 'user1' },
        { userId: 'user2' },
      ]);
    });
  });

  describe('invalid formats', () => {
    it('should return empty array for non-array input', () => {
      expect(normalizeParticipants({})).toEqual([]);
      expect(normalizeParticipants('string')).toEqual([]);
      expect(normalizeParticipants(123)).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should return empty array for mixed invalid format', () => {
      const result = normalizeParticipants([123, {}, null]);
      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });
  });
});

describe('normalizeTimestamp', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return null for null', () => {
    expect(normalizeTimestamp(null)).toBeNull();
  });

  it('should return null for undefined', () => {
    expect(normalizeTimestamp(undefined)).toBeNull();
  });

  describe('Firestore Timestamp', () => {
    it('should convert Firestore Timestamp to Date', () => {
      const date = new Date('2025-01-15');
      const firestoreTimestamp = {
        toDate: () => date,
      };

      const result = normalizeTimestamp(firestoreTimestamp);
      expect(result).toEqual(date);
    });

    it('should handle Firestore Timestamp conversion errors', () => {
      const firestoreTimestamp = {
        toDate: () => {
          throw new Error('Conversion error');
        },
      };

      const result = normalizeTimestamp(firestoreTimestamp);
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('Date objects', () => {
    it('should return Date as-is', () => {
      const date = new Date('2025-01-15');
      const result = normalizeTimestamp(date);
      expect(result).toEqual(date);
    });
  });

  describe('number timestamps', () => {
    it('should convert valid number to Date', () => {
      const timestamp = new Date('2025-01-15').getTime();
      const result = normalizeTimestamp(timestamp);
      expect(result).toEqual(new Date('2025-01-15'));
    });

    it('should return null for invalid number', () => {
      expect(normalizeTimestamp(NaN)).toBeNull();
      expect(normalizeTimestamp(Infinity)).toBeNull();
    });
  });

  describe('string timestamps', () => {
    it('should convert valid date string to Date', () => {
      const dateString = '2025-01-15T00:00:00Z';
      const result = normalizeTimestamp(dateString);
      expect(result).toEqual(new Date(dateString));
    });

    it('should return null for invalid date string', () => {
      expect(normalizeTimestamp('invalid-date')).toBeNull();
      expect(normalizeTimestamp('not-a-date')).toBeNull();
    });
  });

  describe('unknown formats', () => {
    it('should return null and warn for unknown format', () => {
      const result = normalizeTimestamp({ custom: 'format' });
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });

    it('should return null for boolean', () => {
      expect(normalizeTimestamp(true)).toBeNull();
      expect(normalizeTimestamp(false)).toBeNull();
    });
  });
});

describe('normalizeMessageText', () => {
  it('should extract text from content field', () => {
    const messageData = { content: 'Hello world' };
    expect(normalizeMessageText(messageData)).toBe('Hello world');
  });

  it('should extract text from text field', () => {
    const messageData = { text: 'Hello world' };
    expect(normalizeMessageText(messageData)).toBe('Hello world');
  });

  it('should prefer content over text when both exist', () => {
    const messageData = { content: 'from content', text: 'from text' };
    expect(normalizeMessageText(messageData)).toBe('from content');
  });

  it('should return empty string when neither field exists', () => {
    expect(normalizeMessageText({})).toBe('');
    expect(normalizeMessageText({ other: 'field' })).toBe('');
  });

  it('should return empty string for null', () => {
    expect(normalizeMessageText(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(normalizeMessageText(undefined)).toBe('');
  });

  it('should handle non-string content/text', () => {
    expect(normalizeMessageText({ content: 123 })).toBe('');
    expect(normalizeMessageText({ text: null })).toBe('');
    expect(normalizeMessageText({ content: {} })).toBe('');
  });
});

