/**
 * CRM Helper Utilities
 * 
 * Utility functions for CRM calculations and client analysis.
 */

import type { User, Booking } from '@/types';
import type { ClientSegment } from '../types/crm.types';

/**
 * Get client statistics
 */
export const getClientStats = (clientId: string, bookings: Booking[]) => {
  const clientBookings = bookings.filter(b => b.clientId === clientId);
  const totalBookings = clientBookings.length;
  const totalSpent = clientBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
  const avgBookingValue = totalBookings > 0 ? totalSpent / totalBookings : 0;
  const lastBooking = clientBookings.length > 0
    ? clientBookings.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())[0].scheduledDate
    : null;

  return {
    totalBookings,
    totalSpent,
    avgBookingValue,
    lastBooking,
  };
};

/**
 * Get client segment based on criteria
 * FIXED: Proper prioritization, rating criteria, and consistent field naming
 */
export const getClientSegment = (
  clientId: string,
  bookings: Booking[],
  segments: ClientSegment[],
  client?: User
): string => {
  const stats = getClientStats(clientId, bookings);

  // Sort segments by priority (VIP first, then others)
  const sortedSegments = [...segments].sort((a, b) => {
    const aPriority = a.name === 'VIP Clients' ? 1 : a.name === 'At Risk' ? 2 : 3;
    const bPriority = b.name === 'VIP Clients' ? 1 : b.name === 'At Risk' ? 2 : 3;
    return aPriority - bPriority;
  });

  for (const segment of sortedSegments) {
    const { criteria } = segment;
    let matches = true;

    // Minimum bookings check
    if (criteria.minBookings !== undefined && stats.totalBookings < criteria.minBookings) {
      matches = false;
      continue;
    }

    // Minimum spent check
    if (criteria.minSpent !== undefined && stats.totalSpent < criteria.minSpent) {
      matches = false;
      continue;
    }

    // Days since last booking (FIXED: Use maxDaysSinceLastBooking)
    if (criteria.maxDaysSinceLastBooking !== undefined && stats.lastBooking) {
      const daysSince = Math.floor(
        (Date.now() - new Date(stats.lastBooking).getTime()) / (1000 * 60 * 60 * 24)
      );
      // If maxDaysSinceLastBooking is 30, match clients with >30 days (at risk)
      if (daysSince <= criteria.maxDaysSinceLastBooking) {
        matches = false;
        continue;
      }
    }

    // Minimum rating check (NEW)
    if (criteria.minRating !== undefined && client?.rating !== undefined) {
      if (client.rating < criteria.minRating) {
        matches = false;
        continue;
      }
    }

    // Tags check (NEW - placeholder for future implementation)
    if (criteria.tags && criteria.tags.length > 0 && client) {
      // TODO: Implement getClientTags when tags system is ready
      // const clientTags = getClientTags(client.id);
      // const hasRequiredTags = criteria.tags.every(tag => clientTags.includes(tag));
      // if (!hasRequiredTags) matches = false;
    }

    if (matches) {
      return segment.name;
    }
  }

  return 'All Clients';
};

/**
 * Calculate CRM statistics
 * OPTIMIZED: Cache client stats to avoid redundant calculations
 */
export const calculateCRMStats = (
  clients: User[],
  bookings: Booking[],
  segments: ClientSegment[]
) => {
  // Pre-calculate all client stats once (performance optimization)
  const clientStatsCache = new Map<string, ReturnType<typeof getClientStats>>();
  clients.forEach((client) => {
    if (!clientStatsCache.has(client.id)) {
      clientStatsCache.set(client.id, getClientStats(client.id, bookings));
    }
  });

  let vipCount = 0;
  let atRiskCount = 0;
  let newClientsCount = 0;
  let totalRevenue = 0;

  clients.forEach((client) => {
    const stats = clientStatsCache.get(client.id)!;
    const segment = getClientSegment(client.id, bookings, segments, client);
    
    if (segment === 'VIP Clients') vipCount++;
    if (segment === 'At Risk') atRiskCount++;
    if (segment === 'New Clients') newClientsCount++;
    
    totalRevenue += stats.totalSpent;
  });

  return {
    totalClients: clients.length,
    vipClients: vipCount,
    atRiskClients: atRiskCount,
    newClients: newClientsCount,
    totalRevenue,
    avgClientValue: clients.length > 0 ? totalRevenue / clients.length : 0,
  };
};

