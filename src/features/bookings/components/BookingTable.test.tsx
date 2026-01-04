/**
 * BookingTable Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BookingTable } from './BookingTable';
import type { Booking } from '@/types';

const mockBooking: Booking = {
  id: 'booking-1',
  clientId: 'client-1',
  clientName: 'John Doe',
  serviceType: 'dog-walking',
  scheduledDate: new Date('2024-01-15T10:00:00'),
  duration: 30,
  price: 50,
  status: 'pending',
  pets: ['Fluffy'],
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  paymentMethod: 'cash',
  paymentStatus: 'pending',
};

const mockGetUserName = vi.fn((userId: string) => {
  if (userId === 'client-1') return 'John Doe';
  if (userId === 'sitter-1') return 'Jane Smith';
  return 'Unknown User';
});

describe('BookingTable', () => {
  let queryClient: QueryClient;
  const mockOnViewBooking = vi.fn();
  const mockOnApproveBooking = vi.fn();
  const mockOnRejectBooking = vi.fn();
  const mockOnAssignSitter = vi.fn();
  const mockOnUnassignSitter = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('should render table with bookings', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BookingTable
          bookings={[mockBooking]}
          getUserName={mockGetUserName}
          onViewBooking={mockOnViewBooking}
          onApproveBooking={mockOnApproveBooking}
          onRejectBooking={mockOnRejectBooking}
          onAssignSitter={mockOnAssignSitter}
          onUnassignSitter={mockOnUnassignSitter}
        />
      </QueryClientProvider>
    );

    // Check for table headers (may appear multiple times in DOM)
    const bookingIdHeaders = screen.getAllByText('Booking ID');
    expect(bookingIdHeaders.length).toBeGreaterThan(0);
    
    // Table should render successfully
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should display empty state when no bookings', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BookingTable
          bookings={[]}
          getUserName={mockGetUserName}
          onViewBooking={mockOnViewBooking}
          onApproveBooking={mockOnApproveBooking}
          onRejectBooking={mockOnRejectBooking}
          onAssignSitter={mockOnAssignSitter}
          onUnassignSitter={mockOnUnassignSitter}
        />
      </QueryClientProvider>
    );

    expect(screen.getByText(/no bookings found/i)).toBeInTheDocument();
  });

  it('should render action buttons for bookings', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BookingTable
          bookings={[mockBooking]}
          getUserName={mockGetUserName}
          onViewBooking={mockOnViewBooking}
          onApproveBooking={mockOnApproveBooking}
          onRejectBooking={mockOnRejectBooking}
          onAssignSitter={mockOnAssignSitter}
          onUnassignSitter={mockOnUnassignSitter}
        />
      </QueryClientProvider>
    );

    // Table should render with action buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render pending booking correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BookingTable
          bookings={[mockBooking]}
          getUserName={mockGetUserName}
          onViewBooking={mockOnViewBooking}
          onApproveBooking={mockOnApproveBooking}
          onRejectBooking={mockOnRejectBooking}
          onAssignSitter={mockOnAssignSitter}
          onUnassignSitter={mockOnUnassignSitter}
        />
      </QueryClientProvider>
    );

    // Should display booking information
    expect(screen.getByText(/#booking-1/i)).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should render approved booking correctly', () => {
    const approvedBooking: Booking = {
      ...mockBooking,
      status: 'approved',
      sitterId: undefined,
    };

    render(
      <QueryClientProvider client={queryClient}>
        <BookingTable
          bookings={[approvedBooking]}
          getUserName={mockGetUserName}
          onViewBooking={mockOnViewBooking}
          onApproveBooking={mockOnApproveBooking}
          onRejectBooking={mockOnRejectBooking}
          onAssignSitter={mockOnAssignSitter}
          onUnassignSitter={mockOnUnassignSitter}
        />
      </QueryClientProvider>
    );

    // Should display approved status
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });
});

