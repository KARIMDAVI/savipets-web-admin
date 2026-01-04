/**
 * useAIAssignment Hook
 * 
 * Hook for fetching AI assignment data.
 */

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import { userService } from '@/services/user.service';
import type { AISitterAssignment } from '../types/ai-assignment.types';
import { generateAIRecommendations } from '../utils/aiAssignmentHelpers';
import { useAIAssignmentActions } from './useAIAssignmentActions';

const AI_SETTINGS_KEY = 'ai-assignment-settings';

interface AISettings {
  aiEnabled: boolean;
  autoAssign: boolean;
  confidenceThreshold: 'high' | 'medium' | 'low';
}

const loadAISettings = (): AISettings => {
  try {
    const saved = localStorage.getItem(AI_SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load AI settings:', error);
  }
  return {
    aiEnabled: true,
    autoAssign: false,
    confidenceThreshold: 'high',
  };
};

const saveAISettings = (settings: AISettings) => {
  try {
    localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save AI settings:', error);
  }
};

export const useAIAssignment = () => {
  const [settings, setSettings] = useState<AISettings>(loadAISettings());
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const autoAssignLockRef = useRef(false); // ✅ Prevent concurrent auto-assigns
  
  // Save settings whenever they change
  useEffect(() => {
    saveAISettings(settings);
  }, [settings]);
  
  const { assignSitter } = useAIAssignmentActions({
    onAssignSuccess: () => {
      // Refresh will happen via query invalidation
    },
  });

  // Fetch pending and scheduled bookings
  const {
    data: pendingBookings = [],
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ['ai-assignment-bookings'],
    queryFn: async () => {
      // Fetch both pending and scheduled bookings
      const [pending, scheduled] = await Promise.all([
        bookingService.getBookingsByStatus('pending'),
        bookingService.getBookingsByStatus('scheduled'),
      ]);
      
      // Filter out bookings that already have sitters assigned
      const unassignedBookings = [...pending, ...scheduled].filter(
        booking => !booking.sitterId
      );
      
      return unassignedBookings;
    },
    refetchInterval: 60000, // Refetch every 60 seconds (optimized for performance)
  });

  // Fetch sitters
  const {
    data: sitters = [],
    isLoading: sittersLoading,
  } = useQuery({
    queryKey: ['ai-assignment-sitters'],
    queryFn: () => userService.getUsersByRole('petSitter'),
  });

  // Generate AI assignments (async, centralized scoring with fallback)
  const {
    data: aiAssignments = [],
    isLoading: aiAssignmentsLoading,
  } = useQuery({
    queryKey: [
      'ai-assignments',
      settings.aiEnabled,
      pendingBookings.map(b => b.id),
      sitters.map(s => s.id),
    ],
    enabled: !bookingsLoading && !sittersLoading,
    queryFn: async (): Promise<AISitterAssignment[]> => {
      if (!settings.aiEnabled || sitters.length === 0) {
        return pendingBookings.map(booking => ({
          bookingId: booking.id,
          booking,
          recommendations: [],
          currentAssignment: booking.sitterId || undefined,
          status: booking.sitterId ? 'assigned' : 'pending',
        }));
      }
      
      return Promise.all(
        pendingBookings.map(booking => generateAIRecommendations(booking, sitters))
      );
    },
  });
  
  // ✅ Auto-assign logic with conflict detection
  useEffect(() => {
    if (!settings.autoAssign || !settings.aiEnabled || isAutoAssigning || bookingsLoading || sittersLoading || aiAssignmentsLoading || autoAssignLockRef.current) {
      return;
    }
    
    const assignmentsToAutoAssign = aiAssignments.filter(assignment => {
      if (assignment.status === 'assigned') return false;
      if (assignment.recommendations.length === 0) return false;
      
      const topRec = assignment.recommendations[0];
      if (settings.confidenceThreshold === 'high' && topRec.confidence !== 'high') return false;
      if (settings.confidenceThreshold === 'medium' && topRec.confidence === 'low') return false;
      
      return true;
    });
    
    if (assignmentsToAutoAssign.length > 0) {
      autoAssignLockRef.current = true; // ✅ Lock to prevent concurrent execution
      setIsAutoAssigning(true);
      
      // Auto-assign sequentially to avoid race conditions
      const assignSequentially = async () => {
        for (const assignment of assignmentsToAutoAssign) {
          try {
            // ✅ CONFLICT DETECTION: Check if booking still needs assignment
            const booking = await bookingService.getBookingById(assignment.bookingId);
            if (!booking) {
              console.warn(`Booking ${assignment.bookingId} not found, skipping`);
              continue;
            }
            if (booking.sitterId) {
              console.log(`Booking ${assignment.bookingId} already assigned, skipping`);
              continue;
            }
            
            await assignSitter(
              assignment.bookingId,
              assignment.recommendations[0].sitter.id
            );
            
            // Small delay between assignments to prevent overwhelming Firestore
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error(`Failed to auto-assign booking ${assignment.bookingId}:`, error);
            // Continue with next assignment even if one fails
          }
        }
        setIsAutoAssigning(false);
        autoAssignLockRef.current = false; // ✅ Release lock
      };
      
      assignSequentially();
    }
  }, [
    settings.autoAssign,
    settings.aiEnabled,
    settings.confidenceThreshold,
    aiAssignments,
    bookingsLoading,
    sittersLoading,
    aiAssignmentsLoading,
    assignSitter,
    isAutoAssigning,
  ]);
  
  const isLoading = bookingsLoading || sittersLoading || aiAssignmentsLoading || isAutoAssigning;
  
  return {
    aiAssignments,
    sitters,
    aiEnabled: settings.aiEnabled,
    autoAssign: settings.autoAssign,
    confidenceThreshold: settings.confidenceThreshold,
    isLoading,
    setAiEnabled: (enabled: boolean) => setSettings(prev => ({ ...prev, aiEnabled: enabled })),
    setAutoAssign: (enabled: boolean) => setSettings(prev => ({ ...prev, autoAssign: enabled })),
    setConfidenceThreshold: (threshold: 'high' | 'medium' | 'low') => 
      setSettings(prev => ({ ...prev, confidenceThreshold: threshold })),
    refetchBookings,
  };
};
