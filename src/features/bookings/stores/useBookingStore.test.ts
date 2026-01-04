/**
 * Tests for useBookingStore
 * 
 * Tests Zustand store state management, persistence, and actions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBookingStore } from './useBookingStore';
import dayjs from 'dayjs';

describe('useBookingStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useBookingStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useBookingStore());
      
      expect(result.current.filters).toEqual({});
      expect(result.current.selectedBooking).toBeNull();
      expect(result.current.detailDrawerVisible).toBe(false);
      expect(result.current.viewMode).toBe('table');
      expect(result.current.selectedPaymentMethod).toBe('cash');
      expect(result.current.isRecurring).toBe(false);
      expect(result.current.numberOfVisits).toBe(1);
    });
  });

  describe('Filter Actions', () => {
    it('should update filters', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setFilters({ status: ['pending', 'approved'] });
      });
      
      expect(result.current.filters.status).toEqual(['pending', 'approved']);
    });

    it('should reset filters', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setFilters({ status: ['pending'] });
        result.current.resetFilters();
      });
      
      expect(result.current.filters).toEqual({});
    });
  });

  describe('Selected Booking Actions', () => {
    it('should set selected booking', () => {
      const { result } = renderHook(() => useBookingStore());
      const mockBooking = {
        id: 'test-id',
        clientId: 'client-1',
        status: 'pending',
      } as any;
      
      act(() => {
        result.current.setSelectedBooking(mockBooking);
      });
      
      expect(result.current.selectedBooking).toEqual(mockBooking);
    });

    it('should clear selected booking', () => {
      const { result } = renderHook(() => useBookingStore());
      const mockBooking = { id: 'test-id' } as any;
      
      act(() => {
        result.current.setSelectedBooking(mockBooking);
        result.current.setSelectedBooking(null);
      });
      
      expect(result.current.selectedBooking).toBeNull();
    });
  });

  describe('UI Visibility Actions', () => {
    it('should toggle detail drawer visibility', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setDetailDrawerVisible(true);
      });
      
      expect(result.current.detailDrawerVisible).toBe(true);
      
      act(() => {
        result.current.setDetailDrawerVisible(false);
      });
      
      expect(result.current.detailDrawerVisible).toBe(false);
    });

    it('should toggle assign modal visibility', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setAssignModalVisible(true);
      });
      
      expect(result.current.assignModalVisible).toBe(true);
    });

    it('should toggle create booking modal visibility', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setCreateBookingModalVisible(true);
      });
      
      expect(result.current.createBookingModalVisible).toBe(true);
    });
  });

  describe('View Mode Actions', () => {
    it('should change view mode', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setViewMode('calendar');
      });
      
      expect(result.current.viewMode).toBe('calendar');
      
      act(() => {
        result.current.setViewMode('list');
      });
      
      expect(result.current.viewMode).toBe('list');
    });

    it('should update selected date', () => {
      const { result } = renderHook(() => useBookingStore());
      const newDate = dayjs('2025-01-15');
      
      act(() => {
        result.current.setSelectedDate(newDate);
      });
      
      expect(result.current.selectedDate.format('YYYY-MM-DD')).toBe('2025-01-15');
    });
  });

  describe('Create Booking Form Actions', () => {
    it('should update payment method', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setSelectedPaymentMethod('square');
      });
      
      expect(result.current.selectedPaymentMethod).toBe('square');
    });

    it('should toggle recurring status', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setIsRecurring(true);
      });
      
      expect(result.current.isRecurring).toBe(true);
    });

    it('should update number of visits', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setNumberOfVisits(5);
      });
      
      expect(result.current.numberOfVisits).toBe(5);
    });

    it('should update recurring frequency', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setRecurringFrequency('daily');
      });
      
      expect(result.current.recurringFrequency).toBe('daily');
    });

    it('should update preferred days', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setPreferredDays([1, 3, 5]);
      });
      
      expect(result.current.preferredDays).toEqual([1, 3, 5]);
    });

    it('should update available pets', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setAvailablePets(['pet-1', 'pet-2']);
      });
      
      expect(result.current.availablePets).toEqual(['pet-1', 'pet-2']);
    });

    it('should reset create booking form', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setSelectedPaymentMethod('square');
        result.current.setIsRecurring(true);
        result.current.setNumberOfVisits(5);
        result.current.resetCreateBookingForm();
      });
      
      expect(result.current.selectedPaymentMethod).toBe('cash');
      expect(result.current.isRecurring).toBe(false);
      expect(result.current.numberOfVisits).toBe(1);
    });
  });

  describe('Reset Action', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useBookingStore());
      
      act(() => {
        result.current.setFilters({ status: ['pending'] });
        result.current.setViewMode('calendar');
        result.current.setIsRecurring(true);
        result.current.setNumberOfVisits(5);
        result.current.reset();
      });
      
      expect(result.current.filters).toEqual({});
      expect(result.current.viewMode).toBe('table');
      expect(result.current.isRecurring).toBe(false);
      expect(result.current.numberOfVisits).toBe(1);
    });
  });
});

