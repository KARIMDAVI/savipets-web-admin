/**
 * CRM Helpers Unit Tests
 * 
 * Tests for CRM utility functions.
 */

import { describe, it, expect } from 'vitest';
import { getClientStats, getClientSegment, calculateCRMStats } from '../../utils/crmHelpers';
import type { User, Booking } from '@/types';
import type { ClientSegment } from '../../types/crm.types';

describe('getClientStats', () => {
  it('should calculate stats for client with bookings', () => {
    const clientId = 'client1';
    const bookings: Booking[] = [
      {
        id: 'booking1',
        clientId: 'client1',
        sitterId: 'sitter1',
        scheduledDate: '2024-01-15',
        price: 100,
        status: 'completed',
        serviceType: 'walking',
      } as Booking,
      {
        id: 'booking2',
        clientId: 'client1',
        sitterId: 'sitter1',
        scheduledDate: '2024-01-20',
        price: 150,
        status: 'completed',
        serviceType: 'walking',
      } as Booking,
    ];

    const stats = getClientStats(clientId, bookings);

    expect(stats.totalBookings).toBe(2);
    expect(stats.totalSpent).toBe(250);
    expect(stats.avgBookingValue).toBe(125);
    expect(stats.lastBooking).toBe('2024-01-20');
  });

  it('should handle client with no bookings', () => {
    const clientId = 'client2';
    const bookings: Booking[] = [];

    const stats = getClientStats(clientId, bookings);

    expect(stats.totalBookings).toBe(0);
    expect(stats.totalSpent).toBe(0);
    expect(stats.avgBookingValue).toBe(0);
    expect(stats.lastBooking).toBeNull();
  });

  it('should filter bookings by clientId', () => {
    const clientId = 'client1';
    const bookings: Booking[] = [
      {
        id: 'booking1',
        clientId: 'client1',
        sitterId: 'sitter1',
        scheduledDate: '2024-01-15',
        price: 100,
        status: 'completed',
        serviceType: 'walking',
      } as Booking,
      {
        id: 'booking2',
        clientId: 'client2',
        sitterId: 'sitter1',
        scheduledDate: '2024-01-20',
        price: 150,
        status: 'completed',
        serviceType: 'walking',
      } as Booking,
    ];

    const stats = getClientStats(clientId, bookings);

    expect(stats.totalBookings).toBe(1);
    expect(stats.totalSpent).toBe(100);
  });

  it('should handle bookings with missing price', () => {
    const clientId = 'client1';
    const bookings: Booking[] = [
      {
        id: 'booking1',
        clientId: 'client1',
        sitterId: 'sitter1',
        scheduledDate: '2024-01-15',
        price: undefined,
        status: 'completed',
        serviceType: 'walking',
      } as Booking,
    ];

    const stats = getClientStats(clientId, bookings);

    expect(stats.totalSpent).toBe(0);
  });
});

describe('getClientSegment', () => {
  const mockBookings: Booking[] = [
    {
      id: 'booking1',
      clientId: 'client1',
      sitterId: 'sitter1',
      scheduledDate: '2024-01-15',
      price: 1000,
      status: 'completed',
      serviceType: 'walking',
    } as Booking,
  ];

  const mockSegments: ClientSegment[] = [
    {
      id: 'segment1',
      name: 'VIP Clients',
      criteria: { minSpent: 500, minBookings: 1 },
      clientCount: 0,
    },
    {
      id: 'segment2',
      name: 'At Risk',
      criteria: { maxDaysSinceLastBooking: 30 },
      clientCount: 0,
    },
    {
      id: 'segment3',
      name: 'New Clients',
      criteria: { minBookings: 1, maxDaysSinceLastBooking: 7 },
      clientCount: 0,
    },
  ];

  it('should match VIP client segment', () => {
    const client: User = {
      id: 'client1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'petOwner',
    } as User;

    const segment = getClientSegment('client1', mockBookings, mockSegments, client);

    expect(segment).toBe('VIP Clients');
  });

  it('should match At Risk segment for inactive clients', () => {
    const oldBooking: Booking[] = [
      {
        id: 'booking1',
        clientId: 'client2',
        sitterId: 'sitter1',
        scheduledDate: '2023-01-01', // Old booking
        price: 100,
        status: 'completed',
        serviceType: 'walking',
      } as Booking,
    ];

    const client: User = {
      id: 'client2',
      email: 'test2@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'petOwner',
    } as User;

    const segment = getClientSegment('client2', oldBooking, mockSegments, client);

    expect(segment).toBe('At Risk');
  });

  it('should return "All Clients" when no segment matches', () => {
    const noBookings: Booking[] = [];
    const client: User = {
      id: 'client3',
      email: 'test3@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'petOwner',
    } as User;

    const segment = getClientSegment('client3', noBookings, mockSegments, client);

    expect(segment).toBe('All Clients');
  });

  it('should prioritize VIP over other segments', () => {
    const client: User = {
      id: 'client1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'petOwner',
      rating: 5,
    } as User;

    const segments: ClientSegment[] = [
      {
        id: 'segment1',
        name: 'At Risk',
        criteria: { maxDaysSinceLastBooking: 30 },
        clientCount: 0,
      },
      {
        id: 'segment2',
        name: 'VIP Clients',
        criteria: { minSpent: 500 },
        clientCount: 0,
      },
    ];

    const segment = getClientSegment('client1', mockBookings, segments, client);

    expect(segment).toBe('VIP Clients');
  });

  it('should check minimum rating criteria', () => {
    const client: User = {
      id: 'client1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'petOwner',
      rating: 4.5,
    } as User;

    const segments: ClientSegment[] = [
      {
        id: 'segment1',
        name: 'High Rating Clients',
        criteria: { minRating: 4.5 },
        clientCount: 0,
      },
    ];

    const segment = getClientSegment('client1', mockBookings, segments, client);

    expect(segment).toBe('High Rating Clients');
  });
});

describe('calculateCRMStats', () => {
  it('should calculate overall CRM statistics', () => {
    const clients: User[] = [
      {
        id: 'client1',
        email: 'test1@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'petOwner',
      } as User,
      {
        id: 'client2',
        email: 'test2@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'petOwner',
      } as User,
    ];

    const bookings: Booking[] = [
      {
        id: 'booking1',
        clientId: 'client1',
        sitterId: 'sitter1',
        scheduledDate: '2024-01-15',
        price: 100,
        status: 'completed',
        serviceType: 'walking',
      } as Booking,
    ];

    const segments: ClientSegment[] = [
      {
        id: 'segment1',
        name: 'VIP Clients',
        criteria: { minSpent: 50 },
        clientCount: 1,
      },
    ];

    const stats = calculateCRMStats(clients, bookings, segments);

    expect(stats.totalClients).toBe(2);
    expect(stats.totalBookings).toBe(1);
    expect(stats.totalRevenue).toBe(100);
    expect(stats.segments.length).toBeGreaterThan(0);
  });

  it('should handle empty data', () => {
    const stats = calculateCRMStats([], [], []);

    expect(stats.totalClients).toBe(0);
    expect(stats.totalBookings).toBe(0);
    expect(stats.totalRevenue).toBe(0);
  });
});











