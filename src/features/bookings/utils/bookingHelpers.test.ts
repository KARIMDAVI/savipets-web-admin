/**
 * Booking Helpers Tests
 */

import { describe, it, expect } from 'vitest';
import { getStatusColor, getServiceTypeDisplayName } from './bookingHelpers';
import type { BookingStatus, ServiceType } from '@/types';

describe('bookingHelpers', () => {
  describe('getStatusColor', () => {
    it('should return correct color for each status', () => {
      expect(getStatusColor('pending')).toBe('orange');
      expect(getStatusColor('approved')).toBe('blue');
      expect(getStatusColor('active')).toBe('green');
      expect(getStatusColor('completed')).toBe('purple');
      expect(getStatusColor('cancelled')).toBe('red');
      expect(getStatusColor('rejected')).toBe('red');
    });

    it('should return default for unknown status', () => {
      expect(getStatusColor('unknown' as BookingStatus)).toBe('default');
    });
  });

  describe('getServiceTypeDisplayName', () => {
    it('should return correct display name for each service type', () => {
      expect(getServiceTypeDisplayName('dog-walking')).toBe('Dog Walking');
      expect(getServiceTypeDisplayName('pet-sitting')).toBe('Pet Sitting');
      expect(getServiceTypeDisplayName('overnight-care')).toBe('Overnight Care');
      expect(getServiceTypeDisplayName('drop-in-visit')).toBe('Drop-in Visit');
      expect(getServiceTypeDisplayName('transport')).toBe('Transport');
    });

    it('should return service type as-is for unknown types', () => {
      expect(getServiceTypeDisplayName('unknown' as ServiceType)).toBe('unknown');
    });
  });
});

