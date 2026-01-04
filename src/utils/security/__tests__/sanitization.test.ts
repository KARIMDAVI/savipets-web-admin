/**
 * Tests for Input Sanitization
 */

import { describe, it, expect } from 'vitest';
import { sanitization } from '../sanitization';

describe('sanitization', () => {
  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitization.sanitizeInput(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Hello');
    });

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert("xss")';
      const result = sanitization.sanitizeInput(input);
      expect(result).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(\'xss\')">Click</div>';
      const result = sanitization.sanitizeInput(input);
      expect(result).not.toContain('onclick=');
    });

    it('should handle empty string', () => {
      expect(sanitization.sanitizeInput('')).toBe('');
    });

    it('should handle non-string input', () => {
      // @ts-expect-error - testing invalid input
      expect(sanitization.sanitizeInput(null)).toBe('');
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove path separators', () => {
      const filename = '../../etc/passwd';
      const result = sanitization.sanitizeFilename(filename);
      expect(result).not.toContain('/');
      expect(result).not.toContain('\\');
    });

    it('should remove dangerous characters', () => {
      const filename = 'file<>:"|?*.txt';
      const result = sanitization.sanitizeFilename(filename);
      expect(result).not.toMatch(/[<>:"|?*]/);
    });

    it('should limit filename length', () => {
      const longFilename = 'a'.repeat(300);
      const result = sanitization.sanitizeFilename(longFilename);
      expect(result.length).toBeLessThanOrEqual(255);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(sanitization.validateEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(sanitization.validateEmail('invalid-email')).toBe(false);
      expect(sanitization.validateEmail('test@')).toBe(false);
      expect(sanitization.validateEmail('@example.com')).toBe(false);
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(sanitization.validateEmail(longEmail)).toBe(false);
    });
  });

  describe('validateURL', () => {
    it('should validate http URLs', () => {
      expect(sanitization.validateURL('http://example.com')).toBe(true);
    });

    it('should validate https URLs', () => {
      expect(sanitization.validateURL('https://example.com')).toBe(true);
    });

    it('should reject javascript: URLs', () => {
      expect(sanitization.validateURL('javascript:alert("xss")')).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(sanitization.validateURL('not-a-url')).toBe(false);
    });
  });

  describe('escapeHTML', () => {
    it('should escape HTML special characters', () => {
      const input = '<div>&"test\'</div>';
      const result = sanitization.escapeHTML(input);
      
      // Check that raw characters are escaped
      expect(result).not.toContain('<div>');
      expect(result).not.toContain('</div>');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&amp;');
      expect(result).toContain('&quot;');
      expect(result).toContain('&#039;');
    });
  });
});

