/**
 * Bookings Page
 * 
 * Main entry point that switches between legacy and refactored implementations
 * based on the useNewBookingStore feature flag.
 */

import React from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import BookingsPageRefactored from './BookingsPageRefactored';
import BookingsPageLegacy from './BookingsPageLegacy';

const BookingsPage: React.FC = () => {
  const useNewVersion = useFeatureFlag('useNewBookingStore');
  
  // Switch between refactored and legacy versions based on feature flag
  return useNewVersion ? <BookingsPageRefactored /> : <BookingsPageLegacy />;
};

export default BookingsPage;
