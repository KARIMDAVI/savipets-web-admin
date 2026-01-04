import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { useLiveTracking } from './useLiveTracking';
import { useQuery } from '@tanstack/react-query';
import { trackingService, type VisitTrackingData } from '@/services/tracking.service';
import type { Booking, User } from '@/types';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@/services/booking.service', () => ({
  bookingService: {
    getActiveBookings: vi.fn(),
  },
}));

vi.mock('@/services/user.service', () => ({
  userService: {
    getUsersByRole: vi.fn(),
  },
}));

vi.mock('@/services/tracking.service', () => ({
  trackingService: {
    subscribeToActiveVisitTracking: vi.fn(),
    subscribeToSitterLocation: vi.fn(),
  },
}));

type MutableState<T> = { current: T };

const createBooking = (overrides: Partial<Booking> = {}): Booking => {
  const now = new Date();
  return {
    id: 'booking-1',
    clientId: 'client-1',
    sitterId: 'sitter-1',
    serviceType: 'dog-walking',
    status: 'active',
    scheduledDate: now,
    duration: 60,
    price: 25,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

const createSitter = (overrides: Partial<User> = {}): User => {
  const now = new Date();
  return {
    id: 'sitter-1',
    email: 'sitter@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'petSitter',
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

describe('useLiveTracking', () => {
  const useQueryMock = useQuery as unknown as Mock;
  const subscribeToActiveVisitTrackingMock = trackingService.subscribeToActiveVisitTracking as unknown as Mock;
  const subscribeToSitterLocationMock = trackingService.subscribeToSitterLocation as unknown as Mock;

  const activeBookingsState: MutableState<Booking[]> = { current: [] };
  const sittersState: MutableState<User[]> = { current: [] };

  type LocationCallback = (location: { lat: number; lng: number; accuracy?: number; speed?: number; heading?: number; timestamp: Date } | null) => void;

  const sitterLocationCallbacks = new Map<string, LocationCallback>();
  const sitterUnsubscribes = new Map<string, Mock>();
  let visitTrackingCallback: ((trackings: VisitTrackingData[]) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    activeBookingsState.current = [];
    sittersState.current = [];
    sitterLocationCallbacks.clear();
    sitterUnsubscribes.clear();
    visitTrackingCallback = null;

    useQueryMock.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      if (queryKey[0] === 'activeBookings') {
        return {
          data: activeBookingsState.current,
          isLoading: false,
          refetch: vi.fn(),
        };
      }
      if (queryKey[0] === 'sitters') {
        return {
          data: sittersState.current,
          isLoading: false,
          refetch: vi.fn(),
        };
      }
      return {
        data: undefined,
        isLoading: false,
        refetch: vi.fn(),
      };
    });

    subscribeToActiveVisitTrackingMock.mockImplementation((callback: (trackings: VisitTrackingData[]) => void) => {
      visitTrackingCallback = callback;
      return vi.fn();
    });

    subscribeToSitterLocationMock.mockImplementation((sitterId: string, callback: LocationCallback) => {
      sitterLocationCallbacks.set(sitterId, callback);
      const unsubscribe = vi.fn();
      sitterUnsubscribes.set(sitterId, unsubscribe);
      return unsubscribe;
    });
  });

  const emitTrackingData = (trackings: VisitTrackingData[]) => {
    act(() => {
      visitTrackingCallback?.(trackings);
    });
  };

  const emitSitterLocation = (sitterId: string, location: { lat: number; lng: number; accuracy?: number; speed?: number; heading?: number; timestamp: Date } | null) => {
    act(() => {
      sitterLocationCallbacks.get(sitterId)?.(location);
    });
  };

  it('clears sitter and visit tracking state when active bookings become empty', () => {
    const booking = createBooking();
    const sitterId = booking.sitterId as string;
    const sitter = createSitter({ id: sitterId });
    activeBookingsState.current = [booking];
    sittersState.current = [sitter];

    const { result, rerender } = renderHook(() => useLiveTracking(true, 30));

    const trackingSample: VisitTrackingData = {
      visitId: booking.id,
      sitterId,
      clientId: booking.clientId,
      isActive: true,
      routePoints: [],
      totalDistance: 0,
    };

    emitTrackingData([trackingSample]);
    emitSitterLocation(sitterId, {
      lat: 37.0,
      lng: -122.0,
      timestamp: new Date(),
    });

    expect(result.current.visitTrackings.size).toBe(1);
    expect(result.current.sitterLocations.size).toBe(1);

    activeBookingsState.current = [];
    sittersState.current = [];

    act(() => {
      rerender();
    });

    expect(result.current.visitTrackings.size).toBe(0);
    expect(result.current.sitterLocations.size).toBe(0);
    sitterUnsubscribes.forEach(unsubscribe => {
      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  it('removes sitter location when location stream emits null', () => {
    const booking = createBooking();
    const sitterId = booking.sitterId as string;
    const sitter = createSitter({ id: sitterId });
    activeBookingsState.current = [booking];
    sittersState.current = [sitter];

    const { result } = renderHook(() => useLiveTracking(true, 30));

    emitSitterLocation(sitterId, {
      lat: 37.5,
      lng: -121.9,
      timestamp: new Date(),
    });

    expect(result.current.sitterLocations.size).toBe(1);

    emitSitterLocation(sitterId, null);

    expect(result.current.sitterLocations.size).toBe(0);
    const unsubscribe = sitterUnsubscribes.get(sitterId);
    expect(unsubscribe).toBeDefined();
  });
});


