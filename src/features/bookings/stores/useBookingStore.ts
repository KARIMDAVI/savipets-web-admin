/**
 * Bookings Zustand Store
 * 
 * Centralized state management for the Bookings feature.
 * Consolidates 15+ useState hooks into a single store for better
 * performance and maintainability.
 * 
 * Uses Zustand with devtools and persistence middleware.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { 
  Booking, 
  BookingFilters, 
  BookingViewMode, 
  RecurringFrequency, 
  PaymentMethod 
} from '../types/bookings.types';
import dayjs from 'dayjs';

interface BookingStore {
  // Filter state
  filters: BookingFilters;
  
  // Selected booking state
  selectedBooking: Booking | null;
  
  // UI state - Modals and Drawers
  detailDrawerVisible: boolean;
  assignModalVisible: boolean;
  createBookingModalVisible: boolean;
  
  // View state
  viewMode: BookingViewMode;
  selectedDate: dayjs.Dayjs;
  
  // Create booking form state
  selectedPaymentMethod: PaymentMethod;
  isRecurring: boolean;
  numberOfVisits: number;
  recurringFrequency: RecurringFrequency;
  preferredDays: number[];
  availablePets: string[];
  petOptionsLoading: boolean;
  
  // Loading state
  loading: boolean;
  
  // Actions - Filters
  setFilters: (filters: BookingFilters) => void;
  resetFilters: () => void;
  
  // Actions - Selected Booking
  setSelectedBooking: (booking: Booking | null) => void;
  
  // Actions - UI Visibility
  setDetailDrawerVisible: (visible: boolean) => void;
  setAssignModalVisible: (visible: boolean) => void;
  setCreateBookingModalVisible: (visible: boolean) => void;
  
  // Actions - View Mode
  setViewMode: (mode: BookingViewMode) => void;
  setSelectedDate: (date: dayjs.Dayjs) => void;
  
  // Actions - Create Booking Form
  setSelectedPaymentMethod: (method: PaymentMethod) => void;
  setIsRecurring: (isRecurring: boolean) => void;
  setNumberOfVisits: (visits: number) => void;
  setRecurringFrequency: (frequency: RecurringFrequency) => void;
  setPreferredDays: (days: number[]) => void;
  setAvailablePets: (pets: string[]) => void;
  setPetOptionsLoading: (loading: boolean) => void;
  
  // Actions - Loading
  setLoading: (loading: boolean) => void;
  
  // Actions - Reset
  reset: () => void;
  resetCreateBookingForm: () => void;
}

const initialState = {
  filters: {},
  selectedBooking: null,
  detailDrawerVisible: false,
  assignModalVisible: false,
  createBookingModalVisible: false,
  viewMode: 'table' as BookingViewMode,
  selectedDate: dayjs(),
  selectedPaymentMethod: 'cash' as PaymentMethod,
  isRecurring: false,
  numberOfVisits: 1,
  recurringFrequency: 'weekly' as RecurringFrequency,
  preferredDays: [],
  availablePets: [],
  petOptionsLoading: false,
  loading: false,
};

export const useBookingStore = create<BookingStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        // Filter actions
        setFilters: (filters) =>
          set({ filters }, false, 'setFilters'),
        resetFilters: () =>
          set({ filters: {} }, false, 'resetFilters'),
        
        // Selected booking actions
        setSelectedBooking: (booking) =>
          set({ selectedBooking: booking }, false, 'setSelectedBooking'),
        
        // UI visibility actions
        setDetailDrawerVisible: (visible) =>
          set({ detailDrawerVisible: visible }, false, 'setDetailDrawerVisible'),
        setAssignModalVisible: (visible) =>
          set({ assignModalVisible: visible }, false, 'setAssignModalVisible'),
        setCreateBookingModalVisible: (visible) =>
          set({ createBookingModalVisible: visible }, false, 'setCreateBookingModalVisible'),
        
        // View mode actions
        setViewMode: (mode) =>
          set({ viewMode: mode }, false, 'setViewMode'),
        setSelectedDate: (date) =>
          set({ selectedDate: date }, false, 'setSelectedDate'),
        
        // Create booking form actions
        setSelectedPaymentMethod: (method) =>
          set({ selectedPaymentMethod: method }, false, 'setSelectedPaymentMethod'),
        setIsRecurring: (isRecurring) =>
          set({ isRecurring }, false, 'setIsRecurring'),
        setNumberOfVisits: (visits) =>
          set({ numberOfVisits: visits }, false, 'setNumberOfVisits'),
        setRecurringFrequency: (frequency) =>
          set({ recurringFrequency: frequency }, false, 'setRecurringFrequency'),
        setPreferredDays: (days) =>
          set({ preferredDays: days }, false, 'setPreferredDays'),
        setAvailablePets: (pets) =>
          set({ availablePets: pets }, false, 'setAvailablePets'),
        setPetOptionsLoading: (loading) =>
          set({ petOptionsLoading: loading }, false, 'setPetOptionsLoading'),
        
        // Loading actions
        setLoading: (loading) =>
          set({ loading }, false, 'setLoading'),
        
        // Reset actions
        reset: () =>
          set(initialState, false, 'reset'),
        resetCreateBookingForm: () =>
          set(
            {
              selectedPaymentMethod: 'cash',
              isRecurring: false,
              numberOfVisits: 1,
              recurringFrequency: 'weekly',
              preferredDays: [],
              availablePets: [],
              petOptionsLoading: false,
            },
            false,
            'resetCreateBookingForm'
          ),
      }),
      {
        name: 'booking-store', // localStorage key
        partialize: (state) => ({
          // Only persist non-sensitive state
          filters: state.filters,
          viewMode: state.viewMode,
          selectedDate: state.selectedDate,
        }),
      }
    ),
    { name: 'BookingStore' }
  )
);

