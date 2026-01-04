/**
 * User Helper Functions
 * 
 * Utility functions for user-related operations.
 */

import type { User } from '@/types';

/**
 * Get user display name with fallback handling
 */
export const getUserDisplayName = (
  userId: string | null | undefined,
  userMap: Map<string, User>,
  allUsers: User[],
  isLoadingUsers: boolean
): string => {
  if (!userId) {
    return 'Unassigned';
  }
  
  let user = userMap.get(userId);
  
  if (!user) {
    user = allUsers.find(u => u.id === userId);
  }
  
  if (!user) {
    if (isLoadingUsers) {
      return 'Loading...';
    }
    return 'Unassigned';
  }
  
  let firstName = (user.firstName && String(user.firstName).trim()) || '';
  let lastName = (user.lastName && String(user.lastName).trim()) || '';
  
  if (firstName.includes('@')) {
    firstName = '';
  }
  if (lastName.includes('@')) {
    lastName = '';
  }
  
  const fullName = `${firstName} ${lastName}`.trim();
  
  if (fullName && fullName.length > 0) {
    return fullName;
  }
  
  if (user.email && typeof user.email === 'string') {
    const emailName = user.email.split('@')[0];
    const extractedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    return extractedName;
  }
  
  return 'Unassigned';
};

/**
 * Get user initials
 */
export const getUserInitials = (userId: string | null | undefined, userMap: Map<string, User>): string => {
  if (!userId) return 'NA';
  const user = userMap.get(userId);
  if (user) {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'NA';
  }
  return 'NA';
};


