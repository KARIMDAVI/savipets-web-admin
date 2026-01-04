import { db } from '@/config/firebase.config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
} from 'firebase/firestore';
import type { User, UserFilters } from '@/types';

/**
 * Service for user query operations
 */
export class UserQueryService {
  private readonly collectionName = 'users';

  /**
   * Get all users with optional filters
   */
  async getAllUsers(filters?: UserFilters): Promise<User[]> {
    try {
      let q = query(collection(db, this.collectionName));

      if (filters?.role && filters.role.length > 0) {
        q = query(q, where('role', 'in', filters.role));
      }

      if (filters?.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      q = query(q, orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);
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
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        return users.filter(user => 
          user.firstName.toLowerCase().includes(searchTerm) ||
          user.lastName.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)
        );
      }

      return users;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error?.code === 'permission-denied') {
        throw new Error('Permission denied: Admin access required to view users');
      } else if (error?.code === 'failed-precondition') {
        throw new Error('Missing Firestore index. Please check the console for index creation link.');
      }
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          email: data.email || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
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
          petNames: data.petNames,
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('role', '==', role),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const users: User[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          email: data.email || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
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
          petNames: data.petNames,
        } as User);
      });

      return users;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }
}

export const userQueryService = new UserQueryService();


