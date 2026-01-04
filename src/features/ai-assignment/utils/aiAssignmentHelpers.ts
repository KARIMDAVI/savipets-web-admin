/**
 * AI Assignment Helper Utilities
 * 
 * Utility functions for AI-powered sitter assignment.
 */

import React from 'react';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/config/firebase.config';
import type { Booking, User } from '@/types';
import type { AISitterAssignment, AISitterRecommendation } from '../types/ai-assignment.types';

// Extended Sitter type with optional location and pet type properties
interface SitterWithLocation extends User {
  lat?: number;
  lng?: number;
  petTypes?: string[];
}

const scoreSitterFunction = httpsCallable(functions, 'scoreSitterFunction');

/**
 * Generate AI recommendations for a booking
 */
const generateLocalScore = (
  booking: Booking,
  sitter: SitterWithLocation
): AISitterRecommendation => {
  let score = 0;
  const reasons: string[] = [];
  
  // Rating factor (40% weight, max 40 points)
  const ratingScore = (sitter.rating || 0) * 8;
  score += ratingScore;
  if (sitter.rating && sitter.rating >= 4.5) {
    reasons.push(`High rating (${sitter.rating.toFixed(1)}⭐)`);
  }
  
  // Experience factor (30% weight, max 30 points)
  const experienceScore = Math.min((sitter.totalBookings || 0) * 0.5, 30);
  score += experienceScore;
  if ((sitter.totalBookings || 0) > 50) {
    reasons.push(`Experienced (${sitter.totalBookings} bookings)`);
  }
  
  // Location factor (20% weight, max 20 points)
  const hasLocationData = !!(sitter.address?.coordinates || (sitter.lat && sitter.lng));
  const locationScore = hasLocationData ? 15 : 0;
  score += locationScore;
  if (locationScore > 0) {
    reasons.push('Location data available');
  }
  
  // Availability factor (10% weight)
  const availabilityScore = sitter.isActive ? 8 : 0;
  score += availabilityScore;
  if (availabilityScore > 0) {
    reasons.push('Active and available');
  }
  
  // Pet type match bonus (up to 10 points)
  if (booking.pets && booking.pets.length > 0 && sitter.petTypes) {
    const matchingPetTypes = booking.pets.filter((pet: string) => 
      sitter.petTypes!.some((type: string) => type.toLowerCase() === pet.toLowerCase())
    );
    const petMatchScore = (matchingPetTypes.length / booking.pets.length) * 10;
    score += petMatchScore;
    if (matchingPetTypes.length === booking.pets.length) {
      reasons.push(`Handles all required pet types`);
    }
  }
  
  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (score >= 80) confidence = 'high';
  else if (score >= 60) confidence = 'medium';
  
  return {
    sitter,
    score: Math.round(score),
    reasons,
    confidence,
  };
};

export const generateAIRecommendations = async (
  booking: Booking,
  sitters: User[]
): Promise<AISitterAssignment> => {
  const availableSitters = sitters.filter(sitter => sitter.isActive) as SitterWithLocation[];
  
  const recommendations: AISitterRecommendation[] = (await Promise.all(
    availableSitters.map(async sitter => {
      try {
        const petTypeMatches = booking.pets && sitter.petTypes
          ? booking.pets.filter((pet: string) =>
              sitter.petTypes!.some((type: string) => type.toLowerCase() === pet.toLowerCase())
            ).length
          : 0;
        
        const totalPetTypes = booking.pets?.length || 0;
        const result = await scoreSitterFunction({
          sitterId: sitter.id,
          rating: sitter.rating || 0,
          totalBookings: sitter.totalBookings || 0,
          hasLocationData: !!(sitter.address?.coordinates || (sitter.lat && sitter.lng)),
          petTypeMatches,
          totalPetTypes,
          isPreferred: false, // TODO: wire preferred sitter when available
        });
        
        const data = result.data as { score: number; reasons: string[]; confidence: 'high' | 'medium' | 'low' };
        return {
          sitter,
          score: Math.round(data.score),
          reasons: data.reasons,
          confidence: data.confidence,
        };
      } catch (error) {
        console.warn('scoreSitterFunction failed, using local scoring', error);
        return generateLocalScore(booking, sitter);
      }
    })
  ))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  
  return {
    bookingId: booking.id,
    booking,
    recommendations,
    currentAssignment: booking.sitterId || undefined,
    status: booking.sitterId ? 'assigned' : 'pending',
  };
};

/**
 * Get confidence color
 */
export const getConfidenceColor = (confidence: 'high' | 'medium' | 'low'): string => {
  switch (confidence) {
    case 'high': return 'green';
    case 'medium': return 'orange';
    case 'low': return 'red';
  }
};

/**
 * Get confidence icon component
 */
export const getConfidenceIcon = (confidence: 'high' | 'medium' | 'low'): React.ReactNode => {
  switch (confidence) {
    case 'high': return React.createElement(CheckCircleOutlined);
    case 'medium': return React.createElement(ClockCircleOutlined);
    case 'low': return React.createElement(CloseCircleOutlined);
  }
};

/**
 * Calculate AI assignment statistics
 */
export const calculateAIAssignmentStats = (
  assignments: AISitterAssignment[]
): {
  totalPending: number;
  highConfidence: number;
  autoAssigned: number;
  overridden: number;
} => {
  return {
    totalPending: assignments.length,
    highConfidence: assignments.filter(a => a.recommendations[0]?.confidence === 'high').length,
    autoAssigned: assignments.filter(a => a.status === 'assigned').length,
    overridden: assignments.filter(a => a.status === 'overridden').length,
  };
};

