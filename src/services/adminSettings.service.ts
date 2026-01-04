/**
 * Admin Settings Service
 * 
 * Manages admin-level settings like auto-assignment preferences
 */

import { db, auth } from '@/config/firebase.config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface AdminSettings {
  autoAssignSittersOnApproval: boolean;
  updatedAt: Date;
  updatedBy: string;
}

const SETTINGS_DOC_ID = 'admin_settings';

/**
 * Get admin settings
 */
export async function getAdminSettings(): Promise<AdminSettings> {
  try {
    const settingsRef = doc(db, 'adminSettings', SETTINGS_DOC_ID);
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      return {
        autoAssignSittersOnApproval: data.autoAssignSittersOnApproval ?? false,
        updatedAt: data.updatedAt?.toDate() ?? new Date(),
        updatedBy: data.updatedBy ?? '',
      };
    }
    
    // Return default settings if document doesn't exist
    return {
      autoAssignSittersOnApproval: false,
      updatedAt: new Date(),
      updatedBy: '',
    };
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    // Return default settings on error
    return {
      autoAssignSittersOnApproval: false,
      updatedAt: new Date(),
      updatedBy: '',
    };
  }
}

/**
 * Update admin settings
 */
export async function updateAdminSettings(settings: Partial<AdminSettings>): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Admin not authenticated');
    }
    
    const settingsRef = doc(db, 'adminSettings', SETTINGS_DOC_ID);
    const currentSettings = await getAdminSettings();
    
    await setDoc(settingsRef, {
      ...currentSettings,
      ...settings,
      updatedAt: serverTimestamp(),
      updatedBy: currentUser.uid,
    }, { merge: true });
    
    console.log('✅ Admin settings updated:', settings);
  } catch (error) {
    console.error('Error updating admin settings:', error);
    throw error;
  }
}

/**
 * Toggle auto-assignment setting
 */
export async function toggleAutoAssignment(enabled: boolean): Promise<void> {
  await updateAdminSettings({ autoAssignSittersOnApproval: enabled });
}

