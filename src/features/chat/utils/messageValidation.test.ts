/**
 * Unit Tests for Message Validation
 * 
 * Tests the security-critical message validation logic that matches
 * Firestore security rules.
 */

import { describe, it, expect } from 'vitest';
import {
  validateMessageText,
  sanitizeMessageText,
  type MessageValidationResult,
} from './messageValidation';

describe('validateMessageText', () => {
  it('should accept valid messages', () => {
    const validMessages = [
      'Hello, how are you?',
      'This is a normal message.',
      '123',
      'A'.repeat(1000), // Max length
    ];

    validMessages.forEach((text) => {
      const result = validateMessageText(text);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it('should reject non-string inputs', () => {
    const invalidInputs = [
      null,
      undefined,
      123,
      {},
      [],
      true,
    ];

    invalidInputs.forEach((input) => {
      const result = validateMessageText(input as any);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Message must be a string');
    });
  });

  it('should reject empty strings', () => {
    const result = validateMessageText('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message cannot be empty');
  });

  it('should reject messages exceeding max length', () => {
    const longMessage = 'A'.repeat(1001); // One over max
    const result = validateMessageText(longMessage);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Message cannot exceed 1000 characters');
    expect(result.error).toContain('current: 1001');
  });

  it('should reject messages with script tags', () => {
    const maliciousMessages = [
      '<script>alert("xss")</script>',
      'Hello <script>bad()</script> world',
      '<SCRIPT>EVIL()</SCRIPT>', // Case insensitive
      'Text before <script src="evil.js"></script> text after',
    ];

    maliciousMessages.forEach((text) => {
      const result = validateMessageText(text);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Message contains invalid content');
    });
  });

  it('should reject messages with javascript: protocol', () => {
    const maliciousMessages = [
      'javascript:alert("xss")',
      'Click here: javascript:void(0)',
      'JAVASCRIPT:EVIL()', // Case insensitive
      'Link: javascript:location.href="evil.com"',
    ];

    maliciousMessages.forEach((text) => {
      const result = validateMessageText(text);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Message contains invalid content');
    });
  });

  it('should accept messages with safe HTML-like text', () => {
    const safeMessages = [
      'I <3 you',
      'Use < and > symbols',
      'Price: $<100>',
      'Check out <example>',
    ];

    safeMessages.forEach((text) => {
      const result = validateMessageText(text);
      expect(result.isValid).toBe(true);
    });
  });

  it('should handle edge cases', () => {
    // Single character
    expect(validateMessageText('a').isValid).toBe(true);
    
    // Exactly max length
    expect(validateMessageText('A'.repeat(1000)).isValid).toBe(true);
    
    // Whitespace-only (should be invalid after sanitization, but validation allows it)
    const whitespaceResult = validateMessageText('   ');
    expect(whitespaceResult.isValid).toBe(true); // Validation allows, sanitization will trim
  });
});

describe('sanitizeMessageText', () => {
  it('should trim whitespace from both ends', () => {
    expect(sanitizeMessageText('  hello  ')).toBe('hello');
    expect(sanitizeMessageText('  test message  ')).toBe('test message');
    expect(sanitizeMessageText('\t\n  text  \n\t')).toBe('text');
  });

  it('should preserve internal whitespace', () => {
    expect(sanitizeMessageText('hello   world')).toBe('hello   world');
    expect(sanitizeMessageText('  multi   word   message  ')).toBe('multi   word   message');
  });

  it('should handle already-trimmed strings', () => {
    expect(sanitizeMessageText('hello')).toBe('hello');
    expect(sanitizeMessageText('test message')).toBe('test message');
  });

  it('should handle empty strings after trimming', () => {
    expect(sanitizeMessageText('   ')).toBe('');
    expect(sanitizeMessageText('\t\n')).toBe('');
  });
});

describe('Integration: validateMessageText + sanitizeMessageText', () => {
  it('should work together correctly', () => {
    const messages = [
      { input: '  hello  ', shouldBeValid: true },
      { input: '  <script>bad</script>  ', shouldBeValid: false },
      { input: '  normal message  ', shouldBeValid: true },
    ];

    messages.forEach(({ input, shouldBeValid }) => {
      const sanitized = sanitizeMessageText(input);
      const validation = validateMessageText(sanitized);
      expect(validation.isValid).toBe(shouldBeValid);
    });
  });
});

