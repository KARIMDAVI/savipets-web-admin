/**
 * Revenue Analytics Utilities
 * 
 * Advanced analytics for client lifetime value (LTV), trends, and forecasting.
 */

import type { User, Booking } from '@/types';
import type { ClientSegment } from '../types/crm.types';
import { getClientStats } from './crmHelpers';

export interface ClientLTV {
  clientId: string;
  clientName: string;
  lifetimeValue: number;
  averageOrderValue: number;
  purchaseFrequency: number; // bookings per month
  customerLifespan: number; // months
  totalBookings: number;
  firstBookingDate: Date | null;
  lastBookingDate: Date | null;
  projectedAnnualValue: number;
}

export interface RevenueTrend {
  period: string; // e.g., "2024-01"
  revenue: number;
  bookings: number;
  averageBookingValue: number;
  clientCount: number;
}

export interface ChurnRiskScore {
  clientId: string;
  clientName: string;
  riskScore: number; // 0-100, higher = more risk
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[]; // Reasons for risk
  daysSinceLastBooking: number;
  bookingFrequencyDecline: boolean;
}

/**
 * Calculate client lifetime value (LTV)
 */
export const calculateClientLTV = (
  client: User,
  bookings: Booking[]
): ClientLTV => {
  const stats = getClientStats(client.id, bookings);
  const clientBookings = bookings.filter((b) => b.clientId === client.id);

  // Calculate dates
  const bookingDates = clientBookings
    .map((b) => new Date(b.scheduledDate))
    .sort((a, b) => a.getTime() - b.getTime());

  const firstBookingDate = bookingDates.length > 0 ? bookingDates[0] : null;
  const lastBookingDate =
    bookingDates.length > 0 ? bookingDates[bookingDates.length - 1] : null;

  // Calculate customer lifespan in months
  let customerLifespan = 0;
  if (firstBookingDate && lastBookingDate) {
    const monthsDiff =
      (lastBookingDate.getTime() - firstBookingDate.getTime()) /
      (1000 * 60 * 60 * 24 * 30);
    customerLifespan = Math.max(1, Math.ceil(monthsDiff)); // At least 1 month
  } else if (firstBookingDate) {
    // If only first booking, assume 1 month lifespan
    customerLifespan = 1;
  }

  // Calculate purchase frequency (bookings per month)
  const purchaseFrequency =
    customerLifespan > 0 ? stats.totalBookings / customerLifespan : 0;

  // Average order value
  const averageOrderValue =
    stats.totalBookings > 0 ? stats.totalSpent / stats.totalBookings : 0;

  // Lifetime value = total spent
  const lifetimeValue = stats.totalSpent;

  // Projected annual value = AOV * Purchase Frequency * 12
  const projectedAnnualValue = averageOrderValue * purchaseFrequency * 12;

  return {
    clientId: client.id,
    clientName: `${client.firstName} ${client.lastName}`,
    lifetimeValue,
    averageOrderValue,
    purchaseFrequency,
    customerLifespan,
    totalBookings: stats.totalBookings,
    firstBookingDate,
    lastBookingDate,
    projectedAnnualValue,
  };
};

/**
 * Calculate revenue trends over time periods
 */
export const calculateRevenueTrends = (
  bookings: Booking[],
  period: 'month' | 'week' | 'day' = 'month'
): RevenueTrend[] => {
  const trendsMap = new Map<string, { revenue: number; bookings: number; clients: Set<string> }>();

  bookings.forEach((booking) => {
    const date = new Date(booking.scheduledDate);
    let periodKey: string;

    if (period === 'month') {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      periodKey = `${date.getFullYear()}-${month}`;
    } else if (period === 'week') {
      const weekNumber = Math.ceil(date.getDate() / 7);
      const weekStr = String(weekNumber).padStart(2, '0');
      periodKey = `${date.getFullYear()}-W${weekStr}`;
    } else {
      periodKey = date.toISOString().split('T')[0];
    }

    const existing = trendsMap.get(periodKey) || {
      revenue: 0,
      bookings: 0,
      clients: new Set<string>(),
    };

    existing.revenue += Number(booking.price) || 0;
    existing.bookings += 1;
    existing.clients.add(booking.clientId);

    trendsMap.set(periodKey, existing);
  });

  // Convert to array and sort by period
  return Array.from(trendsMap.entries())
    .map(([period, data]) => ({
      period,
      revenue: data.revenue,
      bookings: data.bookings,
      averageBookingValue: data.bookings > 0 ? data.revenue / data.bookings : 0,
      clientCount: data.clients.size,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
};

/**
 * Calculate churn risk score for clients
 */
export const calculateChurnRisk = (
  client: User,
  bookings: Booking[]
): ChurnRiskScore => {
  const stats = getClientStats(client.id, bookings);
  const clientBookings = bookings.filter((b) => b.clientId === client.id);

  let riskScore = 0;
  const factors: string[] = [];

  // Days since last booking
  const daysSinceLastBooking = stats.lastBooking
    ? Math.floor((Date.now() - new Date(stats.lastBooking).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  if (daysSinceLastBooking > 90) {
    riskScore += 50;
    factors.push('No booking in over 90 days');
  } else if (daysSinceLastBooking > 60) {
    riskScore += 30;
    factors.push('No booking in over 60 days');
  } else if (daysSinceLastBooking > 30) {
    riskScore += 15;
    factors.push('No booking in over 30 days');
  }

  // Booking frequency decline
  if (clientBookings.length >= 4) {
    // Compare last 2 bookings vs previous 2 bookings
    const sortedBookings = [...clientBookings].sort(
      (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );
    const recentBookings = sortedBookings.slice(0, 2);
    const olderBookings = sortedBookings.slice(2, 4);

    if (olderBookings.length === 2 && recentBookings.length === 2) {
      const olderAvgDays = Math.abs(
        (new Date(olderBookings[0].scheduledDate).getTime() -
          new Date(olderBookings[1].scheduledDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const recentAvgDays = Math.abs(
        (new Date(recentBookings[0].scheduledDate).getTime() -
          new Date(recentBookings[1].scheduledDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (recentAvgDays > olderAvgDays * 1.5) {
        riskScore += 25;
        factors.push('Booking frequency declining');
      }
    }
  }

  // Low total bookings
  if (stats.totalBookings === 0) {
    riskScore += 30;
    factors.push('No bookings yet');
  } else if (stats.totalBookings === 1) {
    riskScore += 20;
    factors.push('Only one booking');
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high';
  if (riskScore >= 60) {
    riskLevel = 'high';
  } else if (riskScore >= 30) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  return {
    clientId: client.id,
    clientName: `${client.firstName} ${client.lastName}`,
    riskScore: Math.min(100, riskScore),
    riskLevel,
    factors,
    daysSinceLastBooking,
    bookingFrequencyDecline: riskScore > 30 && factors.includes('Booking frequency declining'),
  };
};

