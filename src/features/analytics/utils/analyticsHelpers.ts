/**
 * Analytics Helper Utilities
 * 
 * Utility functions for calculating analytics data.
 */

import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import type { Booking, User } from '@/types';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import type {
  AnalyticsData,
  RevenueChartDataPoint,
  ServiceTypeDataPoint,
  TopSitter,
  Timeframe,
} from '../types/analytics.types';

/**
 * Validate booking data
 */
export const validateBookingData = (booking: unknown): booking is Booking => {
  if (!booking || typeof booking !== 'object') {
    return false;
  }
  
  const b = booking as Partial<Booking>;
  return (
    typeof b.id === 'string' &&
    typeof b.price === 'number' &&
    !isNaN(b.price) &&
    b.scheduledDate instanceof Date
  );
};

/**
 * Validate user data
 */
export const validateUserData = (user: unknown): user is User => {
  if (!user || typeof user !== 'object') {
    return false;
  }
  
  const u = user as Partial<User>;
  return (
    typeof u.id === 'string' &&
    typeof u.role === 'string'
  );
};

/**
 * Validate bookings array
 */
export const validateBookingsArray = (bookings: unknown): Booking[] => {
  if (!Array.isArray(bookings)) {
    console.warn('[validateBookingsArray] Invalid bookings array, using empty array');
    return [];
  }
  
  return bookings.filter(validateBookingData);
};

/**
 * Validate users array
 */
export const validateUsersArray = (users: unknown): User[] => {
  if (!Array.isArray(users)) {
    console.warn('[validateUsersArray] Invalid users array, using empty array');
    return [];
  }
  
  return users.filter(validateUserData);
};

/**
 * Calculate growth percentage between two values
 */
export const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
};

/**
 * Calculate average response time in hours
 * Note: This is a simplified calculation. For accurate response time,
 * we would need conversation/message data to track when sitter first responded.
 * Currently calculates time from booking creation to first status update (if available).
 */
const calculateResponseTime = (bookings: Booking[]): number => {
  const bookingsWithSitter = bookings.filter(
    b => b.sitterId && b.createdAt && b.updatedAt
  );

  if (bookingsWithSitter.length === 0) {
    return 0;
  }

  const responseTimes = bookingsWithSitter
    .map(b => {
      const created = dayjs(b.createdAt);
      const updated = dayjs(b.updatedAt);
      const diffHours = updated.diff(created, 'hour', true);
      // Only count reasonable response times (within 7 days)
      return diffHours > 0 && diffHours < 168 ? diffHours : null;
    })
    .filter((time): time is number => time !== null);

  if (responseTimes.length === 0) {
    return 0;
  }

  const avgHours = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  return Math.round(avgHours * 10) / 10; // Round to 1 decimal place
};

/**
 * Calculate period-over-period comparison
 * Compares current period metrics with previous equivalent period
 */
export const calculatePeriodComparison = (
  currentBookings: Booking[],
  currentUsers: User[],
  previousBookings: Booking[],
  previousUsers: User[]
): {
  revenue: { current: number; previous: number; growth: number };
  bookings: { current: number; previous: number; growth: number };
  users: { current: number; previous: number; growth: number };
} => {
  const currentRevenue = currentBookings.reduce((sum, b) => sum + (b.price ?? 0), 0);
  const previousRevenue = previousBookings.reduce((sum, b) => sum + (b.price ?? 0), 0);
  
  return {
    revenue: {
      current: currentRevenue,
      previous: previousRevenue,
      growth: calculateGrowth(currentRevenue, previousRevenue),
    },
    bookings: {
      current: currentBookings.length,
      previous: previousBookings.length,
      growth: calculateGrowth(currentBookings.length, previousBookings.length),
    },
    users: {
      current: currentUsers.length,
      previous: previousUsers.length,
      growth: calculateGrowth(currentUsers.length, previousUsers.length),
    },
  };
};

/**
 * Calculate analytics data from bookings and users
 * Note: Growth calculations require previous period data, which should be passed separately
 * For now, growth is set to 0 and can be enhanced with previous period comparison
 */
export const calculateAnalyticsData = (
  bookings: Booking[],
  users: User[],
  previousPeriodData?: {
    revenue: number;
    bookings: number;
    users: number;
  }
): AnalyticsData => {
  // Validate inputs using validation utilities
  const validBookings = validateBookingsArray(bookings);
  const validUsers = validateUsersArray(users);

  // Calculate revenue with null safety (bookings are already validated)
  const totalRevenue = validBookings.reduce((sum, booking) => {
    return sum + (booking.price ?? 0);
  }, 0);

  const completedBookings = validBookings.filter(b => b.status === 'completed');
  const pendingBookings = validBookings.filter(b => b.status === 'pending');
  const cancelledBookings = validBookings.filter(b => b.status === 'cancelled');
  
  const sitters = validUsers.filter(u => u.role === 'petSitter');
  const owners = validUsers.filter(u => u.role === 'petOwner');
  
  // Calculate average rating only from sitters with valid ratings (best practice: exclude 0/null ratings)
  const sittersWithRatings = sitters.filter(sitter => {
    const rating = sitter.rating;
    return typeof rating === 'number' && !isNaN(rating) && rating > 0;
  });

  const avgRating = sittersWithRatings.length > 0
    ? sittersWithRatings.reduce((sum, sitter) => sum + (sitter.rating ?? 0), 0) / sittersWithRatings.length
    : 0;

  const completionRate = validBookings.length > 0 
    ? (completedBookings.length / validBookings.length) * 100 
    : 0;

  // Calculate real revenue by time period (using scheduledDate)
  const now = dayjs();
  const startOfToday = now.startOf('day');
  const startOfWeek = now.startOf('week');
  const startOfMonth = now.startOf('month');

  // Daily revenue (bookings scheduled for today)
  const dailyRevenue = validBookings
    .filter(b => b.scheduledDate && dayjs(b.scheduledDate).isSame(startOfToday, 'day'))
    .reduce((sum, b) => sum + (b.price ?? 0), 0);

  // Weekly revenue (bookings scheduled this week)
  const weeklyRevenue = validBookings
    .filter(b => b.scheduledDate && dayjs(b.scheduledDate).isSameOrAfter(startOfWeek))
    .reduce((sum, b) => sum + (b.price ?? 0), 0);

  // Monthly revenue (bookings scheduled this month)
  const monthlyRevenue = validBookings
    .filter(b => b.scheduledDate && dayjs(b.scheduledDate).isSameOrAfter(startOfMonth))
    .reduce((sum, b) => sum + (b.price ?? 0), 0);

  // Calculate growth percentages (requires previous period data)
  const revenueGrowth = previousPeriodData
    ? calculateGrowth(totalRevenue, previousPeriodData.revenue)
    : 0;
  const bookingsGrowth = previousPeriodData
    ? calculateGrowth(validBookings.length, previousPeriodData.bookings)
    : 0;
  const usersGrowth = previousPeriodData
    ? calculateGrowth(validUsers.length, previousPeriodData.users)
    : 0;

  return {
    revenue: {
      total: totalRevenue,
      monthly: monthlyRevenue,
      weekly: weeklyRevenue,
      daily: dailyRevenue,
      growth: revenueGrowth,
    },
    bookings: {
      total: validBookings.length,
      completed: completedBookings.length,
      pending: pendingBookings.length,
      cancelled: cancelledBookings.length,
      growth: bookingsGrowth,
    },
    users: {
      total: validUsers.length,
      sitters: sitters.length,
      owners: owners.length,
      growth: usersGrowth,
    },
    performance: {
      avgRating: avgRating,
      completionRate: completionRate,
      responseTime: calculateResponseTime(validBookings),
    },
  };
};

/**
 * Prepare revenue chart data with timeframe-based aggregation
 */
export const prepareRevenueChartData = (
  bookings: Booking[],
  timeframe: Timeframe = 'daily',
  dateRange?: { start: Date; end: Date }
): RevenueChartDataPoint[] => {
  const validBookings = validateBookingsArray(bookings);
  
  if (validBookings.length === 0) {
    return [];
  }

  // Filter bookings by date range if provided
  const filteredBookings = dateRange
    ? validBookings.filter(b => {
        if (!b.scheduledDate) return false;
        const bookingDate = dayjs(b.scheduledDate);
        return bookingDate.isSameOrAfter(dayjs(dateRange.start), 'day') &&
               bookingDate.isSameOrBefore(dayjs(dateRange.end), 'day');
      })
    : validBookings;

  const now = dayjs();
  const endDate = dateRange ? dayjs(dateRange.end) : now;
  const startDate = dateRange ? dayjs(dateRange.start) : now.subtract(30, 'days');

  const dataPoints: RevenueChartDataPoint[] = [];

  if (timeframe === 'daily') {
    // Group by day
    let currentDate = startDate.startOf('day');
    while (currentDate.isSameOrBefore(endDate, 'day')) {
      const dayBookings = filteredBookings.filter(b =>
        b.scheduledDate && dayjs(b.scheduledDate).isSame(currentDate, 'day')
      );
      const revenue = dayBookings.reduce((sum, b) => sum + (b.price ?? 0), 0);

      dataPoints.push({
        date: currentDate.format('MMM DD'),
        revenue: revenue,
        bookings: dayBookings.length,
      });

      currentDate = currentDate.add(1, 'day');
    }
  } else if (timeframe === 'weekly') {
    // Group by week
    let currentWeek = startDate.startOf('week');
    while (currentWeek.isSameOrBefore(endDate, 'week')) {
      const weekEnd = currentWeek.endOf('week');
      const weekBookings = filteredBookings.filter(b => {
        if (!b.scheduledDate) return false;
        const bookingDate = dayjs(b.scheduledDate);
        return bookingDate.isSameOrAfter(currentWeek, 'day') &&
               bookingDate.isSameOrBefore(weekEnd, 'day');
      });
      const revenue = weekBookings.reduce((sum, b) => sum + (b.price ?? 0), 0);

      dataPoints.push({
        date: `${currentWeek.format('MMM DD')} - ${weekEnd.format('MMM DD')}`,
        revenue: revenue,
        bookings: weekBookings.length,
      });

      currentWeek = currentWeek.add(1, 'week');
    }
  } else if (timeframe === 'monthly') {
    // Group by month
    let currentMonth = startDate.startOf('month');
    while (currentMonth.isSameOrBefore(endDate, 'month')) {
      const monthEnd = currentMonth.endOf('month');
      const monthBookings = filteredBookings.filter(b => {
        if (!b.scheduledDate) return false;
        const bookingDate = dayjs(b.scheduledDate);
        return bookingDate.isSameOrAfter(currentMonth, 'day') &&
               bookingDate.isSameOrBefore(monthEnd, 'day');
      });
      const revenue = monthBookings.reduce((sum, b) => sum + (b.price ?? 0), 0);

      dataPoints.push({
        date: currentMonth.format('MMM YYYY'),
        revenue: revenue,
        bookings: monthBookings.length,
      });

      currentMonth = currentMonth.add(1, 'month');
    }
  }

  return dataPoints;
};

/**
 * Prepare service type data for pie chart
 */
export const prepareServiceTypeData = (bookings: Booking[]): ServiceTypeDataPoint[] => {
  const validBookings = validateBookingsArray(bookings);
  
  if (validBookings.length === 0) {
    return [];
  }

  const serviceTypes = validBookings.reduce((acc, booking) => {
    const serviceType = booking.serviceType;
    if (serviceType) {
      acc[serviceType] = (acc[serviceType] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(serviceTypes).map(([service, count]) => ({
    name: service.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    percentage: validBookings.length > 0 ? (count / validBookings.length) * 100 : 0,
  }));
};

/**
 * Calculate top performing sitters
 */
export const calculateTopSitters = (
  users: User[],
  bookings: Booking[]
): TopSitter[] => {
  const validUsers = validateUsersArray(users);
  const validBookings = validateBookingsArray(bookings);
  
  const sitterStats = validUsers
    .filter(u => u.role === 'petSitter')
    .map(sitter => {
      const sitterBookings = validBookings.filter(b => b.sitterId === sitter.id);
      const completedBookings = sitterBookings.filter(b => b.status === 'completed');
      const revenue = completedBookings.reduce((sum, b) => sum + (b.price ?? 0), 0);
      
      return {
        id: sitter.id,
        name: `${sitter.firstName || ''} ${sitter.lastName || ''}`.trim() || 'Unknown',
        rating: sitter.rating || 0,
        bookings: sitterBookings.length,
        completed: completedBookings.length,
        revenue: revenue,
        completionRate: sitterBookings.length > 0 ? (completedBookings.length / sitterBookings.length) * 100 : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return sitterStats;
};

/**
 * Export analytics data to CSV
 */
export const exportAnalyticsToCSV = (analyticsData: AnalyticsData): void => {
  const csvContent = [
    ['Metric', 'Value', 'Growth %'],
    ['Total Revenue', `$${analyticsData.revenue.total.toFixed(2)}`, `${analyticsData.revenue.growth}%`],
    ['Total Bookings', analyticsData.bookings.total.toString(), `${analyticsData.bookings.growth}%`],
    ['Completed Bookings', analyticsData.bookings.completed.toString(), ''],
    ['Pending Bookings', analyticsData.bookings.pending.toString(), ''],
    ['Cancelled Bookings', analyticsData.bookings.cancelled.toString(), ''],
    ['Total Users', analyticsData.users.total.toString(), `${analyticsData.users.growth}%`],
    ['Pet Sitters', analyticsData.users.sitters.toString(), ''],
    ['Pet Owners', analyticsData.users.owners.toString(), ''],
    ['Average Rating', analyticsData.performance.avgRating.toFixed(1), ''],
    ['Completion Rate', `${analyticsData.performance.completionRate.toFixed(1)}%`, ''],
    ['Response Time', `${analyticsData.performance.responseTime} hours`, ''],
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-${dayjs().format('YYYY-MM-DD')}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

