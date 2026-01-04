/**
 * CRM Validation Utilities
 * 
 * Input validation and sanitization for CRM module.
 * Uses DOMPurify for comprehensive XSS protection.
 */

import DOMPurify from 'dompurify';
import type { ClientNote } from '../types/crm.types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate note content
 */
export const validateNoteContent = (content: string): ValidationResult => {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Note content cannot be empty' };
  }
  if (content.length > 5000) {
    return { valid: false, error: 'Note content cannot exceed 5000 characters' };
  }
  return { valid: true };
};

/**
 * Sanitize note content using DOMPurify for comprehensive XSS protection
 * Allows safe HTML tags for rich text formatting
 */
export const sanitizeNoteContent = (content: string): string => {
  // Use DOMPurify to sanitize HTML content
  // Allows safe formatting tags but removes dangerous scripts and attributes
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'ul',
      'ol',
      'li',
      'a',
      'blockquote',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
    // Remove all event handlers
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });

  return sanitized;
};

/**
 * Sanitize plain text (removes all HTML)
 */
export const sanitizePlainText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/**
 * Validate segment name
 */
export const validateSegmentName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Segment name cannot be empty' };
  }
  if (name.length > 100) {
    return { valid: false, error: 'Segment name cannot exceed 100 characters' };
  }
  // Allow alphanumeric, spaces, hyphens, and underscores
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    return {
      valid: false,
      error: 'Segment name contains invalid characters. Only letters, numbers, spaces, hyphens, and underscores are allowed.',
    };
  }
  return { valid: true };
};

/**
 * Validate segment criteria
 */
export const validateSegmentCriteria = (
  criteria: Partial<{
    minBookings?: number;
    minSpent?: number;
    maxDaysSinceLastBooking?: number;
    minRating?: number;
    tags?: string[];
  }>
): ValidationResult => {
  if (criteria.minBookings !== undefined && criteria.minBookings < 0) {
    return { valid: false, error: 'Minimum bookings cannot be negative' };
  }
  if (criteria.minSpent !== undefined && criteria.minSpent < 0) {
    return { valid: false, error: 'Minimum spent cannot be negative' };
  }
  if (
    criteria.maxDaysSinceLastBooking !== undefined &&
    criteria.maxDaysSinceLastBooking < 0
  ) {
    return {
      valid: false,
      error: 'Days since last booking cannot be negative',
    };
  }
  if (
    criteria.minRating !== undefined &&
    (criteria.minRating < 0 || criteria.minRating > 5)
  ) {
    return { valid: false, error: 'Rating must be between 0 and 5' };
  }
  return { valid: true };
};

/**
 * Validate note type
 */
export const validateNoteType = (
  type: string
): type is ClientNote['type'] => {
  return ['general', 'preference', 'issue', 'follow_up'].includes(type);
};

/**
 * Validate note priority
 */
export const validateNotePriority = (
  priority: string
): priority is ClientNote['priority'] => {
  return ['low', 'medium', 'high'].includes(priority);
};

