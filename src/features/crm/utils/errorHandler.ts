/**
 * CRM Error Handling Utilities
 * 
 * Standardized error handling for CRM module.
 */

import { message } from 'antd';

/**
 * Custom error class for CRM-specific errors
 */
export class CRMError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'CRMError';
    Object.setPrototypeOf(this, CRMError.prototype);
  }
}

/**
 * Handle CRM errors and display user-friendly messages
 */
export const handleCRMError = (error: unknown): void => {
  if (error instanceof CRMError) {
    message.error(error.userMessage || error.message);
  } else if (error instanceof Error) {
    message.error('An unexpected error occurred');
    console.error('CRM Error:', error);
  } else {
    message.error('An unknown error occurred');
    console.error('CRM Unknown Error:', error);
  }
};

/**
 * Wrapper for async operations with error handling
 * 
 * @param fn - Async function to execute
 * @param errorMessage - Optional custom error message
 * @returns Result of the function or null if error occurred
 */
export const withErrorHandling = async <T,>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    if (errorMessage) {
      handleCRMError(new CRMError(errorMessage, 'OPERATION_ERROR', errorMessage));
    } else {
      handleCRMError(error);
    }
    return null;
  }
};












