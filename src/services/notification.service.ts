import { db } from '@/config/firebase.config';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where,
  limit
} from 'firebase/firestore';
import type { Notification } from '@/types';

class NotificationService {
  private readonly collectionName = 'notifications';

  /**
   * Get recent notifications for all users (admin view)
   * Returns the most recent notifications ordered by creation date
   */
  async getRecentNotifications(count: number = 10): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc'),
        limit(count)
      );

      const snapshot = await getDocs(q);
      const notifications: Notification[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          recipientId: data.recipientId || '',
          type: data.type || '',
          title: data.title || '',
          message: data.message || '',
          bookingId: data.bookingId,
          conversationId: data.conversationId,
          read: data.read || false,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      return [];
    }
  }

  /**
   * Get all notifications
   */
  async getAllNotifications(): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const notifications: Notification[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          recipientId: data.recipientId || '',
          type: data.type || '',
          title: data.title || '',
          message: data.message || '',
          bookingId: data.bookingId,
          conversationId: data.conversationId,
          read: data.read || false,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }
}

export const notificationService = new NotificationService();
