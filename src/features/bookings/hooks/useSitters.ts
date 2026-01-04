/**
 * useSitters Hook
 * 
 * Custom hook for fetching sitters (pet sitters) for booking assignment.
 * Extracted from Bookings.tsx to avoid duplicate queries.
 */

import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to fetch sitters (pet sitters) for assignment
 * 
 * @returns Sitters data and loading state
 */
export const useSitters = () => {
  const { isAdmin, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['sitters'],
    queryFn: async () => {
      try {
        return await userService.getUsersByRole('petSitter');
      } catch (error) {
        console.error('Error fetching sitters:', error);
        return [];
      }
    },
    enabled: isAdmin && !authLoading,
  });
};

