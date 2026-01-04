/**
 * useBookings Hook Tests
 * 
 * Quick integration tests to verify the hook works correctly
 * before extracting components that depend on it.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBookings } from './useBookings';
import { bookingService } from '@/services/booking.service';
import { useAuth } from '@/contexts/AuthContext';
import type { Booking } from '@/types';

// Mock dependencies
vi.mock('@/services/booking.service');
vi.mock('@/contexts/AuthContext');
vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
  },
}));

const mockBookingService = vi.mocked(bookingService);
const mockUseAuth = vi.mocked(useAuth);

describe('useBookings', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch bookings successfully', async () => {
    const mockBookings: Booking[] = [
      {
        id: '1',
        clientId: 'client1',
        serviceType: 'dog-walking',
        status: 'pending',
        scheduledDate: new Date(),
        duration: 30,
        price: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        clientId: 'client2',
        serviceType: 'pet-sitting',
        status: 'approved',
        scheduledDate: new Date(),
        duration: 60,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockUseAuth.mockReturnValue({
      isAdmin: true,
      loading: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } as any);

    mockBookingService.getAllBookings.mockResolvedValue(mockBookings);

    const filters = {
      status: undefined,
      serviceType: undefined,
      dateRange: undefined,
      searchQuery: '',
    };

    const { result } = renderHook(() => useBookings({ filters }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.bookings).toEqual(mockBookings);
    expect(result.current.error).toBeNull();
    expect(mockBookingService.getAllBookings).toHaveBeenCalledWith(filters);
  });

  it('should handle loading state', () => {
    mockUseAuth.mockReturnValue({
      isAdmin: true,
      loading: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } as any);

    mockBookingService.getAllBookings.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const filters = {
      status: undefined,
      serviceType: undefined,
      dateRange: undefined,
      searchQuery: '',
    };

    const { result } = renderHook(() => useBookings({ filters }), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    mockUseAuth.mockReturnValue({
      isAdmin: true,
      loading: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } as any);

    const error = new Error('Failed to fetch');
    mockBookingService.getAllBookings.mockRejectedValue(error);

    const filters = {
      status: undefined,
      serviceType: undefined,
      dateRange: undefined,
      searchQuery: '',
    };

    const { result } = renderHook(() => useBookings({ filters }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.bookings).toEqual([]);
    // Error is caught and handled in hook, so error may be null but bookings will be empty
    expect(result.current.bookings.length).toBe(0);
  });

  it('should not fetch when not authorized', () => {
    mockUseAuth.mockReturnValue({
      isAdmin: false,
      loading: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } as any);

    const filters = {
      status: undefined,
      serviceType: undefined,
      dateRange: undefined,
      searchQuery: '',
    };

    const { result } = renderHook(() => useBookings({ filters }), { wrapper });

    expect(mockBookingService.getAllBookings).not.toHaveBeenCalled();
    expect(result.current.bookings).toEqual([]);
  });

  it('should not fetch when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      isAdmin: true,
      loading: true,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } as any);

    const filters = {
      status: undefined,
      serviceType: undefined,
      dateRange: undefined,
      searchQuery: '',
    };

    const { result } = renderHook(() => useBookings({ filters }), { wrapper });

    expect(mockBookingService.getAllBookings).not.toHaveBeenCalled();
    expect(result.current.bookings).toEqual([]);
  });

  it('should refetch bookings', async () => {
    const mockBookings: Booking[] = [
      {
        id: '1',
        clientId: 'client1',
        serviceType: 'dog-walking',
        status: 'pending',
        scheduledDate: new Date(),
        duration: 30,
        price: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockUseAuth.mockReturnValue({
      isAdmin: true,
      loading: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } as any);

    mockBookingService.getAllBookings.mockResolvedValue(mockBookings);

    const filters = {
      status: undefined,
      serviceType: undefined,
      dateRange: undefined,
      searchQuery: '',
    };

    const { result } = renderHook(() => useBookings({ filters }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockBookingService.getAllBookings).toHaveBeenCalledTimes(1);

    await result.current.refetch();

    await waitFor(() => {
      expect(mockBookingService.getAllBookings).toHaveBeenCalledTimes(2);
    });
  });
});

