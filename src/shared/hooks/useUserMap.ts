/**
 * useUserMap Hook
 * 
 * Custom hook for creating and using a user map for quick lookups.
 * Extracted from Bookings.tsx for reusability across features.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import type { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { formatUserName } from '@/shared/utils/formatters';

/**
 * Hook to create a user map and provide lookup functions
 * 
 * @returns User map, lookup functions, and loading state
 */
export const useUserMap = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const isAuthorized = isAdmin;

  // Fetch all users
  const { data: allUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      try {
        const users = await userService.getAllUsers();
        return users;
      } catch (error) {
        console.error('❌ Error fetching users:', error);
        return [];
      }
    },
    enabled: isAuthorized && !authLoading,
  });

  // Create a map for quick user lookup
  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    allUsers.forEach((user) => {
      map.set(user.id, user);
    });
    return map;
  }, [allUsers]);

  /**
   * Get user name by ID
   * 
   * @param userId - User ID to lookup
   * @returns User's display name or 'Unassigned' if not found
   */
  const getUserName = (userId: string | null | undefined): string => {
    if (!userId) {
      return 'Unassigned';
    }

    let user = userMap.get(userId);

    // If not in map, try to find in allUsers array
    if (!user) {
      user = allUsers.find((u) => u.id === userId);
    }

    if (!user) {
      if (isLoadingUsers) {
        return 'Loading...';
      }
      return 'Unassigned';
    }

    // Get firstName and lastName
    const firstName = (user.firstName && String(user.firstName).trim()) || '';
    const lastName = (user.lastName && String(user.lastName).trim()) || '';

    const fullName = `${firstName} ${lastName}`.trim();

    // Return the name if it exists
    if (fullName && fullName.length > 0) {
      return fullName;
    }

    // If no name provided, extract name from email
    if (user.email && typeof user.email === 'string') {
      return formatUserName(user.email);
    }

    return 'Unassigned';
  };

  /**
   * Get user initials by ID
   * 
   * @param userId - User ID to lookup
   * @returns User's initials or 'NA' if not found
   */
  const getUserInitials = (userId: string | null | undefined): string => {
    if (!userId) return 'NA';
    const user = userMap.get(userId);
    if (user) {
      const firstName = user.firstName?.[0] || '';
      const lastName = user.lastName?.[0] || '';
      return `${firstName}${lastName}`.toUpperCase() || 'NA';
    }
    return 'NA';
  };

  /**
   * Get user by ID
   * 
   * @param userId - User ID to lookup
   * @returns User object or undefined if not found
   */
  const getUser = (userId: string | null | undefined): User | undefined => {
    if (!userId) return undefined;
    return userMap.get(userId) || allUsers.find((u) => u.id === userId);
  };

  return {
    userMap,
    allUsers,
    getUserName,
    getUserInitials,
    getUser,
    isLoadingUsers,
  };
};

