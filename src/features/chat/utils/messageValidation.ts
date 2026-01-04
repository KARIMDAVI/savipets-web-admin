/**
 * Message Validation Utilities
 * 
 * Validates messages according to Firestore security rules and best practices.
 */

const MAX_MESSAGE_LENGTH = 1000;
const SCRIPT_TAG_PATTERN = /.*<script.*>.*<\/script>.*/i;
const JAVASCRIPT_PROTOCOL_PATTERN = /.*javascript:.*/i;

export interface MessageValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates message text according to Firestore security rules.
 * Matches the isValidMessage() function in firestore.rules.
 */
export function validateMessageText(text: string): MessageValidationResult {
  if (typeof text !== 'string') {
    return {
      isValid: false,
      error: 'Message must be a string',
    };
  }

  if (text.length === 0) {
    return {
      isValid: false,
      error: 'Message cannot be empty',
    };
  }

  if (text.length > MAX_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters (current: ${text.length})`,
    };
  }

  if (SCRIPT_TAG_PATTERN.test(text)) {
    return {
      isValid: false,
      error: 'Message contains invalid content',
    };
  }

  if (JAVASCRIPT_PROTOCOL_PATTERN.test(text)) {
    return {
      isValid: false,
      error: 'Message contains invalid content',
    };
  }

  return { isValid: true };
}

/**
 * Sanitizes message text by trimming whitespace.
 * Note: We don't escape HTML here as React handles that automatically.
 */
export function sanitizeMessageText(text: string): string {
  return text.trim();
}

