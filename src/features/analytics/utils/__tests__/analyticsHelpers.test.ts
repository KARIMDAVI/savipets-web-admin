/**
 * Analytics Helpers Unit Tests
 * 
 * Tests for analytics calculation functions.
 */

import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import {
  calculateAnalyticsData,
  calculateGrowth,
  calculatePeriodComparison,
  prepareRevenueChartData,
  prepareServiceTypeData,
  calculateTopSitters,
  validateBookingData,
  validateUserData,
} from '../analyticsHelpers';
import type { Booking, User } from '@/types';

// Mock booking data
const createMockBooking = (overrides: Partial<Booking> = {}): Booking => ({
  id: 'booking-1',
  clientId: 'client-1',
  serviceType: 'dog-walking',
  status: 'completed',
  scheduledDate: new Date('2024-01-15'),
  duration: 60,
  price: 50,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-15'),
  ...overrides,
});

// Mock user data
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'petSitter',
  rating: 4.5,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('validateBookingData', () => {
  it('should validate valid booking', () => {
    const booking = createMockBooking();
    expect(validateBookingData(booking)).toBe(true);
  });

  it('should reject invalid booking (missing price)', () => {
    const booking = { ...createMockBooking(), price: undefined as unknown as number };
    expect(validateBookingData(booking)).toBe(false);
  });

  it('should reject non-object', () => {
    expect(validateBookingData(null)).toBe(false);
    expect(validateBookingData('string')).toBe(false);
    expect(validateBookingData(123)).toBe(false);
  });
});

describe('validateUserData', () => {
  it('should validate valid user', () => {
    const user = createMockUser();
    expect(validateUserData(user)).toBe(true);
  });

  it('should reject invalid user (missing role)', () => {
    const user = { ...createMockUser(), role: undefined as unknown as string };
    expect(validateUserData(user)).toBe(false);
  });

  it('should reject non-object', () => {
    expect(validateUserData(null)).toBe(false);
    expect(validateUserData('string')).toBe(false);
  });
});

describe('calculateGrowth', () => {
  it('should calculate positive growth', () => {
    // Growth from 100 to 150 = 50%
    expect(calculateGrowth(150, 100)).toBe(50);
  });

  it('should calculate negative growth', () => {
    // Growth from 100 to 75 = -25%
    expect(calculateGrowth(75, 100)).toBe(-25);
  });

  it('should handle division by zero (previous = 0)', () => {
    // Current > 0, previous = 0 should return 100%
    expect(calculateGrowth(50, 0)).toBe(100);
    // Current = 0, previous = 0 should return 0%
    expect(calculateGrowth(0, 0)).toBe(0);
  });
});

describe('calculateAnalyticsData', () => {
  it('should calculate analytics data correctly', () => {
    const bookings: Booking[] = [
      createMockBooking({ id: 'b1', price: 50, status: 'completed' }),
      createMockBooking({ id: 'b2', price: 75, status: 'pending' }),
      createMockBooking({ id: 'b3', price: 100, status: 'cancelled' }),
    ];

    const users: User[] = [
      createMockUser({ id: 'u1', role: 'petSitter', rating: 4.5 }),
      createMockUser({ id: 'u2', role: 'petSitter', rating: 4.0 }),
      createMockUser({ id: 'u3', role: 'petOwner' }),
    ];

    const result = calculateAnalyticsData(bookings, users);

    expect(result.revenue.total).toBe(225);
    expect(result.bookings.total).toBe(3);
    expect(result.bookings.completed).toBe(1);
    expect(result.bookings.pending).toBe(1);
    expect(result.bookings.cancelled).toBe(1);
    expect(result.users.total).toBe(3);
    expect(result.users.sitters).toBe(2);
    expect(result.users.owners).toBe(1);
    expect(result.performance.avgRating).toBe(4.25); // (4.5 + 4.0) / 2 (only sitters with ratings)
    expect(result.performance.completionRate).toBeCloseTo(33.33, 1);
  });

  it('should handle empty arrays', () => {
    const result = calculateAnalyticsData([], []);

    expect(result.revenue.total).toBe(0);
    expect(result.bookings.total).toBe(0);
    expect(result.users.total).toBe(0);
    expect(result.performance.avgRating).toBe(0);
    expect(result.performance.completionRate).toBe(0);
  });

  it('should handle division by zero for avgRating', () => {
    const bookings: Booking[] = [createMockBooking()];
    const users: User[] = [createMockUser({ role: 'petOwner' })]; // No sitters

    const result = calculateAnalyticsData(bookings, users);

    expect(result.performance.avgRating).toBe(0);
  });

  it('should exclude sitters with no ratings from avgRating calculation', () => {
    const bookings: Booking[] = [createMockBooking()];
    const users: User[] = [
      createMockUser({ id: 'sitter-1', role: 'petSitter', rating: 4.5 }),
      createMockUser({ id: 'sitter-2', role: 'petSitter', rating: undefined }),
      createMockUser({ id: 'sitter-3', role: 'petSitter', rating: 0 }),
      createMockUser({ id: 'sitter-4', role: 'petSitter', rating: 5.0 }),
    ];

    const result = calculateAnalyticsData(bookings, users);

    // Should only average sitters with valid ratings (4.5 and 5.0), not including undefined or 0
    expect(result.performance.avgRating).toBe(4.75); // (4.5 + 5.0) / 2
    expect(result.users.sitters).toBe(4); // Total sitters count should still be 4
  });

  it('should calculate real revenue by period', () => {
    const now = dayjs();
    const today = now.startOf('day').toDate();
    const lastMonth = now.subtract(1, 'month').toDate();

    const bookings: Booking[] = [
      createMockBooking({ scheduledDate: today, price: 50 }),
      createMockBooking({ scheduledDate: lastMonth, price: 200 }), // Not in current periods
    ];

    const result = calculateAnalyticsData(bookings, []);

    // Daily should include today's booking
    expect(result.revenue.daily).toBeGreaterThanOrEqual(50);
    // Weekly should include today's booking (at minimum)
    expect(result.revenue.weekly).toBeGreaterThanOrEqual(50);
    // Monthly should include today's booking (at minimum)
    expect(result.revenue.monthly).toBeGreaterThanOrEqual(50);
    // Total should include all bookings
    expect(result.revenue.total).toBe(250);
  });

  it('should calculate growth with previous period data', () => {
    const bookings: Booking[] = [createMockBooking({ price: 150 })];
    const users: User[] = [createMockUser()];

    const previousPeriodData = {
      revenue: 100,
      bookings: 1,
      users: 1,
    };

    const result = calculateAnalyticsData(bookings, users, previousPeriodData);

    expect(result.revenue.growth).toBe(50); // (150 - 100) / 100 * 100
    expect(result.bookings.growth).toBe(0); // Same number
  });
});

describe('calculatePeriodComparison', () => {
  it('should compare periods correctly', () => {
    const currentBookings: Booking[] = [
      createMockBooking({ price: 150 }),
      createMockBooking({ price: 100 }),
    ];
    const currentUsers: User[] = [createMockUser()];

    const previousBookings: Booking[] = [createMockBooking({ price: 100 })];
    const previousUsers: User[] = [createMockUser()];

    const result = calculatePeriodComparison(
      currentBookings,
      currentUsers,
      previousBookings,
      previousUsers
    );

    expect(result.revenue.current).toBe(250);
    expect(result.revenue.previous).toBe(100);
    expect(result.revenue.growth).toBe(150); // (250 - 100) / 100 * 100

    expect(result.bookings.current).toBe(2);
    expect(result.bookings.previous).toBe(1);
    expect(result.bookings.growth).toBe(100);
  });
});

describe('prepareRevenueChartData', () => {
  it('should prepare daily chart data', () => {
    const now = dayjs();
    const today = now.startOf('day').toDate();
    const yesterday = now.subtract(1, 'day').startOf('day').toDate();

    const bookings: Booking[] = [
      createMockBooking({ scheduledDate: today, price: 50 }),
      createMockBooking({ scheduledDate: yesterday, price: 75 }),
    ];

    const result = prepareRevenueChartData(bookings, 'daily', {
      start: yesterday,
      end: today,
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result.some(d => d.revenue === 50 || d.revenue === 75)).toBe(true);
  });

  it('should handle empty bookings array', () => {
    const result = prepareRevenueChartData([], 'daily');
    expect(result).toEqual([]);
  });

  it('should filter by date range', () => {
    const now = dayjs();
    const inRange = now.subtract(5, 'days').toDate();
    const outOfRange = now.subtract(50, 'days').toDate();

    const bookings: Booking[] = [
      createMockBooking({ scheduledDate: inRange, price: 50 }),
      createMockBooking({ scheduledDate: outOfRange, price: 100 }),
    ];

    const result = prepareRevenueChartData(bookings, 'daily', {
      start: now.subtract(10, 'days').toDate(),
      end: now.toDate(),
    });

    // Should only include in-range booking
    const totalRevenue = result.reduce((sum, d) => sum + d.revenue, 0);
    expect(totalRevenue).toBe(50);
  });
});

describe('prepareServiceTypeData', () => {
  it('should prepare service type data correctly', () => {
    const bookings: Booking[] = [
      createMockBooking({ serviceType: 'dog-walking' }),
      createMockBooking({ serviceType: 'dog-walking' }),
      createMockBooking({ serviceType: 'drop-in-visit' }),
    ];

    const result = prepareServiceTypeData(bookings);

    expect(result.length).toBe(2);
    const dogWalking = result.find(s => s.name.includes('Dog Walking'));
    const dropIn = result.find(s => s.name.includes('Drop In Visit'));

    expect(dogWalking?.value).toBe(2);
    expect(dogWalking?.percentage).toBeCloseTo(66.67, 1);
    expect(dropIn?.value).toBe(1);
    expect(dropIn?.percentage).toBeCloseTo(33.33, 1);
  });

  it('should format service type names correctly', () => {
    const bookings: Booking[] = [
      createMockBooking({ serviceType: 'drop-in-visit' }),
    ];

    const result = prepareServiceTypeData(bookings);

    expect(result[0].name).toBe('Drop In Visit'); // All hyphens replaced, capitalized
  });

  it('should handle empty bookings', () => {
    const result = prepareServiceTypeData([]);
    expect(result).toEqual([]);
  });
});

describe('calculateTopSitters', () => {
  it('should calculate top sitters correctly', () => {
    const users: User[] = [
      createMockUser({
        id: 'sitter-1',
        firstName: 'John',
        lastName: 'Doe',
        role: 'petSitter',
        rating: 4.5,
      }),
      createMockUser({
        id: 'sitter-2',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'petSitter',
        rating: 4.8,
      }),
      createMockUser({
        id: 'owner-1',
        role: 'petOwner',
      }),
    ];

    const bookings: Booking[] = [
      createMockBooking({ sitterId: 'sitter-1', price: 100, status: 'completed' }),
      createMockBooking({ sitterId: 'sitter-1', price: 50, status: 'completed' }),
      createMockBooking({ sitterId: 'sitter-2', price: 200, status: 'completed' }),
      createMockBooking({ sitterId: 'sitter-1', price: 75, status: 'pending' }),
    ];

    const result = calculateTopSitters(users, bookings);

    expect(result.length).toBe(2);
    // Should be sorted by revenue descending
    expect(result[0].id).toBe('sitter-2'); // $200 revenue
    expect(result[0].revenue).toBe(200);
    expect(result[1].id).toBe('sitter-1'); // $150 revenue (only completed)
    expect(result[1].revenue).toBe(150);
    expect(result[1].completionRate).toBeCloseTo(66.67, 1); // 2 completed / 3 total
  });

  it('should handle sitters with no bookings', () => {
    const users: User[] = [
      createMockUser({ id: 'sitter-1', role: 'petSitter' }),
    ];

    const result = calculateTopSitters(users, []);

    expect(result.length).toBe(1);
    expect(result[0].revenue).toBe(0);
    expect(result[0].completionRate).toBe(0);
  });

  it('should limit to top 10 sitters', () => {
    const users: User[] = Array.from({ length: 15 }, (_, i) =>
      createMockUser({
        id: `sitter-${i}`,
        role: 'petSitter',
      })
    );

    const bookings: Booking[] = users.map(user =>
      createMockBooking({ sitterId: user.id, price: 100 })
    );

    const result = calculateTopSitters(users, bookings);

    expect(result.length).toBe(10);
  });
});

