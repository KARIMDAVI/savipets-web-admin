/**
 * useBookingActions Hook Tests
 * 
 * Quick integration tests to verify the hook works correctly
 * before extracting components that depend on it.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBookingActions } from './useBookingActions';
import { bookingService } from '@/services/booking.service';
import { useBookingStore } from '../stores/useBookingStore';
import type { AdminBookingCreate, Booking } from '@/types';

// Mock dependencies
vi.mock('@/services/booking.service');
vi.mock('../stores/useBookingStore');
vi.mock('antd', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockBookingService = vi.mocked(bookingService);
const mockUseBookingStore = vi.mocked(useBookingStore);

describe('useBookingActions', () => {
  let queryClient: QueryClient;
  let mockStoreActions: {
    setAssignModalVisible: ReturnType<typeof vi.fn>;
    setDetailDrawerVisible: ReturnType<typeof vi.fn>;
    setCreateBookingModalVisible: ReturnType<typeof vi.fn>;
    setSelectedBooking: ReturnType<typeof vi.fn>;
    resetCreateBookingForm: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();

    // Mock store - Zustand stores return a selector function
    mockStoreActions = {
      setAssignModalVisible: vi.fn(),
      setDetailDrawerVisible: vi.fn(),
      setCreateBookingModalVisible: vi.fn(),
      setSelectedBooking: vi.fn(),
      resetCreateBookingForm: vi.fn(),
    };
    
    mockUseBookingStore.mockImplementation((selector?: any) => {
      if (selector) {
        return selector(mockStoreActions);
      }
      return mockStoreActions;
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('assignSitter', () => {
    it('should assign sitter successfully', async () => {
      mockBookingService.assignSitter.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBookingActions(), { wrapper });

      result.current.handleAssignSitter('booking1', 'sitter1');

      await waitFor(() => {
        expect(result.current.isAssigning).toBe(false);
      });

      expect(mockBookingService.assignSitter).toHaveBeenCalledWith('booking1', 'sitter1');
      expect(mockStoreActions.setAssignModalVisible).toHaveBeenCalledWith(false);
    });

    it('should handle assign error', async () => {
      mockBookingService.assignSitter.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useBookingActions(), { wrapper });

      result.current.handleAssignSitter('booking1', 'sitter1');

      await waitFor(() => {
        expect(result.current.isAssigning).toBe(false);
      });

      expect(mockBookingService.assignSitter).toHaveBeenCalled();
    });

    it('should unassign sitter successfully', async () => {
      mockBookingService.assignSitter.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBookingActions(), { wrapper });

      result.current.handleUnassignSitter('booking1');

      await waitFor(() => {
        expect(result.current.isAssigning).toBe(false);
      });

      expect(mockBookingService.assignSitter).toHaveBeenCalledWith('booking1', null);
      expect(mockStoreActions.setAssignModalVisible).toHaveBeenCalledWith(false);
    });
  });

  describe('approveBooking', () => {
    it('should approve booking successfully', async () => {
      mockBookingService.updateBookingStatus.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBookingActions(), { wrapper });

      result.current.handleApproveBooking('booking1');

      await waitFor(() => {
        expect(result.current.isApproving).toBe(false);
      });

      expect(mockBookingService.updateBookingStatus).toHaveBeenCalledWith('booking1', 'approved');
    });
  });

  describe('rejectBooking', () => {
    it('should reject booking successfully', async () => {
      mockBookingService.updateBookingStatus.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBookingActions(), { wrapper });

      result.current.handleRejectBooking('booking1');

      await waitFor(() => {
        expect(result.current.isRejecting).toBe(false);
      });

      expect(mockBookingService.updateBookingStatus).toHaveBeenCalledWith('booking1', 'rejected');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking successfully', async () => {
      mockBookingService.updateBookingStatus.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBookingActions(), { wrapper });

      result.current.handleCancelBooking('booking1');

      await waitFor(() => {
        expect(result.current.isCancelling).toBe(false);
      });

      expect(mockBookingService.updateBookingStatus).toHaveBeenCalledWith('booking1', 'cancelled');
    });
  });

  describe('createBooking', () => {
    it('should create booking successfully', async () => {
      const bookingData: AdminBookingCreate = {
        clientId: 'client1',
        clientName: 'Test Client',
        serviceType: 'dog-walking',
        scheduledDate: new Date('2025-01-15'),
        duration: 30,
        pets: ['pet1'],
        price: 50,
        paymentMethod: 'cash',
      };

      mockBookingService.createAdminBooking.mockResolvedValue('booking-id-123');

      const { result } = renderHook(() => useBookingActions(), { wrapper });

      result.current.handleCreateBooking(bookingData);

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });

      expect(mockBookingService.createAdminBooking).toHaveBeenCalledWith(bookingData);
      expect(mockStoreActions.setCreateBookingModalVisible).toHaveBeenCalledWith(false);
      expect(mockStoreActions.resetCreateBookingForm).toHaveBeenCalled();
    });
  });

  describe('viewBooking', () => {
    it('should view booking successfully', async () => {
      const mockBooking: Booking = {
        id: 'booking1',
        clientId: 'client1',
        serviceType: 'dog-walking',
        status: 'pending',
        scheduledDate: new Date(),
        duration: 30,
        price: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBookingService.getBookingById.mockResolvedValue(mockBooking);

      const { result } = renderHook(() => useBookingActions(), { wrapper });

      result.current.handleViewBooking('booking1');

      await waitFor(() => {
        expect(result.current.isViewing).toBe(false);
      });

      expect(mockBookingService.getBookingById).toHaveBeenCalledWith('booking1');
      expect(mockStoreActions.setSelectedBooking).toHaveBeenCalledWith(mockBooking);
      expect(mockStoreActions.setDetailDrawerVisible).toHaveBeenCalledWith(true);
    });

    it('should handle booking not found', async () => {
      mockBookingService.getBookingById.mockResolvedValue(null);

      const { result } = renderHook(() => useBookingActions(), { wrapper });

      result.current.handleViewBooking('booking1');

      await waitFor(() => {
        expect(result.current.isViewing).toBe(false);
      });

      expect(mockBookingService.getBookingById).toHaveBeenCalledWith('booking1');
      expect(mockStoreActions.setSelectedBooking).not.toHaveBeenCalled();
    });
  });

  describe('loading states', () => {
    it('should track loading states correctly', async () => {
      mockBookingService.updateBookingStatus.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useBookingActions(), { wrapper });

      result.current.handleApproveBooking('booking1');

      // Wait for loading state to become true (React Query mutations are async)
      await waitFor(() => {
        expect(result.current.isApproving).toBe(true);
      }, { timeout: 1000 });
      
      expect(mockBookingService.updateBookingStatus).toHaveBeenCalledWith('booking1', 'approved');
    });
  });
});

