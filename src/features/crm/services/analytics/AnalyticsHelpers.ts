import { db } from '@/config/firebase.config';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import type { User, Booking } from '@/types';
import type { ClientNote } from '../../types/crm.types';
import type { AnalyticsQuery } from '../../types/analytics.types';
import dayjs from 'dayjs';

/**
 * Shared helper methods for analytics services
 */
export class AnalyticsHelpers {
  /**
   * Get clients in date range
   */
  static async getClientsInRange(queryParams: AnalyticsQuery): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'petOwner'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as User;
      })
      .filter((client) => {
        if (queryParams.clientIds && !queryParams.clientIds.includes(client.id)) {
          return false;
        }
        return true;
      });
  }

  /**
   * Get bookings in date range
   */
  static async getBookingsInRange(queryParams: AnalyticsQuery): Promise<Booking[]> {
    const q = query(collection(db, 'serviceBookings'), orderBy('scheduledDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          scheduledDate: data.scheduledDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate(),
        } as Booking;
      })
      .filter((booking) => {
        const bookingDate = new Date(booking.scheduledDate);
        if (
          bookingDate < queryParams.dateRange.start ||
          bookingDate > queryParams.dateRange.end
        ) {
          return false;
        }
        if (queryParams.clientIds && !queryParams.clientIds.includes(booking.clientId)) {
          return false;
        }
        if (
          queryParams.serviceTypes &&
          !queryParams.serviceTypes.includes(booking.serviceType)
        ) {
          return false;
        }
        return true;
      });
  }

  /**
   * Get notes in date range
   */
  static async getNotesInRange(queryParams: AnalyticsQuery): Promise<ClientNote[]> {
    const q = query(collection(db, 'crm_notes'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as ClientNote;
      })
      .filter((note) => {
        const noteDate = new Date(note.createdAt);
        return (
          noteDate >= queryParams.dateRange.start && noteDate <= queryParams.dateRange.end
        );
      });
  }

  /**
   * Group items by time period
   */
  static groupByPeriod<T extends { createdAt?: Date; scheduledDate?: Date }>(
    items: T[],
    dateRange: AnalyticsQuery['dateRange'],
    period: string
  ): Array<{ period: string; items: T[] }> {
    const grouped: Record<string, T[]> = {};

    items.forEach((item) => {
      const date = item.createdAt || item.scheduledDate || new Date();
      let periodKey: string;

      switch (period) {
        case 'day':
          periodKey = dayjs(date).format('YYYY-MM-DD');
          break;
        case 'week':
          periodKey = dayjs(date).format('YYYY-[W]WW');
          break;
        case 'month':
          periodKey = dayjs(date).format('YYYY-MM');
          break;
        case 'quarter':
          const quarter = Math.floor(dayjs(date).month() / 3) + 1;
          periodKey = `${dayjs(date).year()}-Q${quarter}`;
          break;
        case 'year':
          periodKey = dayjs(date).format('YYYY');
          break;
        default:
          periodKey = dayjs(date).format('YYYY-MM');
      }

      if (!grouped[periodKey]) {
        grouped[periodKey] = [];
      }
      grouped[periodKey].push(item);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, items]) => ({ period, items }));
  }

  /**
   * Calculate revenue by service type
   */
  static calculateRevenueByServiceType(
    bookings: Booking[]
  ): Array<{ serviceType: string; revenue: number }> {
    const serviceMap = bookings.reduce((acc, booking) => {
      const serviceType = booking.serviceType || 'Unknown';
      if (!acc[serviceType]) {
        acc[serviceType] = 0;
      }
      acc[serviceType] += Number(booking.price) || 0;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(serviceMap).map(([serviceType, revenue]) => ({
      serviceType,
      revenue,
    }));
  }
}


