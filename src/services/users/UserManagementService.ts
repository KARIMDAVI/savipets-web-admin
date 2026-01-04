import { db, auth, functions } from '@/config/firebase.config';
import { 
  doc, 
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import type { User } from '@/types';

/**
 * Service for user management operations
 */
export class UserManagementService {
  private readonly collectionName = 'users';

  /**
   * Update user active status
   */
  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to perform this action');
      }

      const adminDoc = await getDoc(doc(db, this.collectionName, currentUser.uid));
      const adminData = adminDoc.data();
      
      if (!adminData || adminData.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      const userDocRef = doc(db, this.collectionName, userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      await updateDoc(userDocRef, {
        isActive,
        updatedAt: Timestamp.now(),
      });

      const userData = userDoc.data();
      await addDoc(collection(db, 'auditLog'), {
        type: 'user_status_change',
        userId,
        oldStatus: userData.isActive !== undefined ? userData.isActive : true,
        newStatus: isActive,
        adminId: currentUser.uid,
        adminEmail: currentUser.email,
        timestamp: Timestamp.now(),
      });
    } catch (error: any) {
      console.error('Error updating user status:', error);
      if (error?.code === 'permission-denied') {
        throw new Error('Permission denied: You do not have permission to update user status');
      } else if (error?.code === 'not-found') {
        throw new Error('User not found');
      } else if (error?.message) {
        throw error;
      }
      throw new Error('Failed to update user status. Please try again.');
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(
    userId: string,
    newRole: string,
    reason: string
  ): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to perform this action');
      }

      const adminDoc = await getDoc(doc(db, this.collectionName, currentUser.uid));
      const adminData = adminDoc.data();
      
      if (!adminData || adminData.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      const userDocRef = doc(db, this.collectionName, userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const oldRole = userData.role;

      await updateDoc(userDocRef, {
        role: newRole,
        updatedAt: Timestamp.now(),
        roleChangedBy: currentUser.uid,
        roleChangedAt: Timestamp.now(),
      });

      const publicProfileRef = doc(db, 'publicProfiles', userId);
      await updateDoc(publicProfileRef, {
        role: newRole,
        updatedAt: Timestamp.now(),
      });

      await addDoc(collection(db, 'auditLog'), {
        type: 'role_change',
        userId,
        oldRole,
        newRole,
        reason,
        adminId: currentUser.uid,
        adminEmail: currentUser.email,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: Partial<User>): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to perform this action');
      }

      const adminDoc = await getDoc(doc(db, this.collectionName, currentUser.uid));
      const adminData = adminDoc.data();
      
      if (!adminData || adminData.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      if (!userData.email || !userData.role || !userData.firstName || !userData.lastName) {
        throw new Error('Missing required fields: email, role, firstName, lastName');
      }

      const createUserFn = httpsCallable(functions, 'createUser');
      
      const result: any = await createUserFn({
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        accessType: 'app',
        paymentMethodPreference: userData.paymentMethodPreference,
        emergencyContact: userData.emergencyContact,
        petFirstAidCertified: userData.petFirstAidCertified,
        bio: userData.bio
      });
      
      await addDoc(collection(db, 'auditLog'), {
        type: 'user_created',
        adminId: currentUser.uid,
        adminEmail: currentUser.email,
        newUserEmail: userData.email,
        newUserRole: userData.role,
        timestamp: Timestamp.now(),
      });

      return result.data.uid;
    } catch (error: any) {
      console.error('Create user error:', error);
      let errorMessage = 'Failed to create user';
      if (error?.code === 'already-exists' || error?.code === 'permission-denied' && error?.message?.includes('already')) {
        errorMessage = 'This email is already registered. Please use a different email address.';
      } else if (error?.details || error?.message) {
        errorMessage = error.details || error.message;
      }
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string, reason: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to perform this action');
    }

    try {
      const deleteUserFn = httpsCallable(functions, 'deleteUser');
      await deleteUserFn({ userId, reason });
    } catch (error: any) {
      console.error('Delete user error:', error);
      const errorMessage =
        error?.details ||
        error?.message ||
        'Failed to delete user. Please try again.';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update sitter messaging permission
   */
  async updateSitterMessagingPermission(userId: string, allow: boolean): Promise<void> {
    try {
      const timestamp = Timestamp.now();
      const batch = writeBatch(db);
      const userDocRef = doc(db, this.collectionName, userId);
      batch.update(userDocRef, {
        'directMessaging.allowOwnerChats': allow,
        updatedAt: timestamp,
      });

      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('sitterId', '==', userId),
        where('type', '==', 'client-sitter')
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);
      conversationsSnapshot.forEach((conversationDoc) => {
        batch.update(conversationDoc.ref, {
          directMessagingAllowed: allow,
          updatedAt: timestamp,
        });
      });

      await batch.commit();
    } catch (error) {
      throw error;
    }
  }
}

export const userManagementService = new UserManagementService();

