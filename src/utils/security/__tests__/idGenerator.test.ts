/**
 * Tests for Secure ID Generation
 */

import { describe, it, expect } from 'vitest';
import { generateSecureId, generateCSRFToken } from '../idGenerator';

describe('generateSecureId', () => {
  it('should generate a unique ID with prefix', () => {
    const id1 = generateSecureId('test');
    const id2 = generateSecureId('test');

    expect(id1).toContain('test-');
    expect(id2).toContain('test-');
    expect(id1).not.toBe(id2);
  });

  it('should generate IDs with different prefixes', () => {
    const id1 = generateSecureId('prefix1');
    const id2 = generateSecureId('prefix2');

    expect(id1).toContain('prefix1-');
    expect(id2).toContain('prefix2-');
  });

  it('should generate IDs of reasonable length', () => {
    const id = generateSecureId('test');
    expect(id.length).toBeGreaterThan(10);
    expect(id.length).toBeLessThan(100);
  });
});

describe('generateCSRFToken', () => {
  it('should generate a CSRF token', () => {
    const token = generateCSRFToken();
    expect(token).toContain('csrf-');
    expect(token.length).toBeGreaterThan(10);
  });

  it('should generate unique tokens', () => {
    const token1 = generateCSRFToken();
    const token2 = generateCSRFToken();
    expect(token1).not.toBe(token2);
  });
});

