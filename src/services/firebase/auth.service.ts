import { auth, db, functions } from '@/config/firebase.config';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import type { User } from '@/types';

class AuthService {
  private setPlatformClaims = httpsCallable(functions, 'setPlatformClaims');

  async signIn(email: string, password: string): Promise<User> {
    try {
      console.log('🔐 Step 1: Signing in with Firebase Auth...');
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('✅ Step 1: Firebase Auth successful, user ID:', firebaseUser.uid);

      console.log('🔐 Step 2: Setting platform claims...');
      // Set platform claims
      try {
        await this.setPlatformClaims({ platform: 'web' });
        console.log('✅ Step 2: Platform claims set');
      } catch (claimsError) {
        console.warn('⚠️ Platform claims error (may already be set):', claimsError);
        // Continue even if claims fail (might already be set)
      }

      console.log('🔐 Step 3: Fetching user data from Firestore...');
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        console.error('❌ User document not found for:', firebaseUser.uid);
        throw new Error('User document not found in database');
      }

      const userData = userDoc.data();
      console.log('✅ User data retrieved:', { role: userData.role, firstName: userData.firstName });
      
      // Check if user is admin
      if (userData.role !== 'admin') {
        console.error('❌ User is not an admin. Role:', userData.role);
        throw new Error('Access denied. Admin role required.');
      }

      console.log('✅ Sign in complete, returning user data');
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isActive: userData.isActive,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
        profileImage: userData.profileImage,
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        pets: userData.pets,
        certifications: userData.certifications,
        rating: userData.rating,
        totalBookings: userData.totalBookings,
      };
    } catch (error) {
      console.error('❌ Sign in error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error message:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            callback({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role,
              isActive: userData.isActive,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
              profileImage: userData.profileImage,
              phoneNumber: userData.phoneNumber,
              address: userData.address,
              pets: userData.pets,
              certifications: userData.certifications,
              rating: userData.rating,
              totalBookings: userData.totalBookings,
            });
          } else {
            callback(null);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  async refreshToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    return await user.getIdToken(true);
  }
}

export const authService = new AuthService();
