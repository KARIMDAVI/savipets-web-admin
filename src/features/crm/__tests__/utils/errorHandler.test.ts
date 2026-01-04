/**
 * Error Handler Unit Tests
 * 
 * Tests for CRM error handling utilities.
 */

import { describe, it, expect, vi } from 'vitest';
import { handleCRMError, withErrorHandling, CRMError } from '../../utils/errorHandler';

describe('CRMError', () => {
  it('should create CRMError with message', () => {
    const error = new CRMError('Test error', 'VALIDATION_ERROR');

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error).toBeInstanceOf(Error);
  });

  it('should create CRMError with default code', () => {
    const error = new CRMError('Test error', 'UNKNOWN_ERROR');

    expect(error.code).toBe('UNKNOWN_ERROR');
  });
});

describe('handleCRMError', () => {
  it('should handle CRMError', () => {
    const error = new CRMError('Test error', 'VALIDATION_ERROR');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    handleCRMError(error);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle generic Error', () => {
    const error = new Error('Generic error');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    handleCRMError(error);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle unknown error types', () => {
    const error = 'String error';
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    handleCRMError(error as any);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('withErrorHandling', () => {
  it('should return result when function succeeds', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withErrorHandling(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalled();
  });

  it('should return null when function throws', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Test error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await withErrorHandling(fn);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle errors gracefully', async () => {
    const fn = vi.fn().mockRejectedValue(new CRMError('CRM error', 'VALIDATION_ERROR'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await withErrorHandling(fn);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});



