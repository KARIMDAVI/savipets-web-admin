/**
 * Input Sanitization Utility
 * Prevents XSS and injection attacks
 */

import DOMPurify from 'dompurify';
import type { Config } from 'dompurify';

export const sanitization = {
  /**
   * Sanitize HTML content to prevent XSS
   * @param dirty - Unsanitized HTML string
   * @param options - DOMPurify options
   * @returns Sanitized HTML string
   */
  sanitizeHTML: (dirty: string, options?: Config): string => {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
      ...options,
    }) as string;
  },

  /**
   * Sanitize user input (remove script tags, event handlers, etc.)
   * @param input - User input string
   * @returns Sanitized string
   */
  sanitizeInput: (input: string): string => {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove javascript: protocol
      .replace(/javascript:/gi, '')
      // Remove event handlers (onclick, onerror, etc.)
      .replace(/on\w+\s*=/gi, '')
      // Remove data URIs that could contain scripts
      .replace(/data:text\/html/gi, '')
      // Trim whitespace
      .trim();
  },

  /**
   * Sanitize filename to prevent path traversal
   * @param filename - Original filename
   * @returns Sanitized filename
   */
  sanitizeFilename: (filename: string): string => {
    return filename
      // Remove path separators
      .replace(/[\/\\]/g, '')
      // Remove dangerous characters
      .replace(/[<>:"|?*]/g, '')
      // Remove leading dots
      .replace(/^\.+/, '')
      // Limit length
      .substring(0, 255)
      // Remove trailing dots/spaces (Windows)
      .replace(/[\.\s]+$/, '');
  },

  /**
   * Validate email address
   * @param email - Email string to validate
   * @returns True if valid email
   */
  validateEmail: (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) && email.length <= 254;
  },

  /**
   * Validate URL
   * @param url - URL string to validate
   * @returns True if valid URL
   */
  validateURL: (url: string): boolean => {
    try {
      const parsed = new URL(url);
      // Only allow http and https protocols
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },

  /**
   * Escape HTML special characters
   * @param text - Text to escape
   * @returns Escaped HTML string
   */
  escapeHTML: (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  },
};

