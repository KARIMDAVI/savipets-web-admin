import { db } from '@/config/firebase.config';
import { 
  collection, 
  query, 
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import type { User } from '@/types';

/**
 * Service for user subscription operations
 */
export class UserSubscriptionService {
  private readonly collectionName = 'users';

  /**
   * Subscribe to users with real-time updates
   */
  subscribeToUsers(callback: (users: User[]) => void): () => void {
    const q = query(
      collection(db, this.collectionName),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const users: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const firstName = data.firstName || '';
        const lastName = data.lastName || '';
        const email = data.email || '';
        
        const userData: any = {
          id: doc.id,
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: data.role,
          isActive: data.isActive !== undefined ? data.isActive : true,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          profileImage: data.profileImage,
          phoneNumber: data.phoneNumber,
          address: data.address,
          pets: data.pets,
          certifications: data.certifications,
          rating: data.rating,
          totalBookings: data.totalBookings,
          directMessaging: data.directMessaging,
        };
        
        if (data.petNames) {
          userData.petNames = data.petNames;
        }
        
        users.push(userData);
      });
      callback(users);
    });
  }
}

export const userSubscriptionService = new UserSubscriptionService();


