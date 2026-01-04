/**
 * BookingDetailDrawer Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookingDetailDrawer } from './BookingDetailDrawer';
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
  pets: ['Fluffy', 'Spot'],
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

describe('BookingDetailDrawer', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render drawer when visible and booking exists', () => {
    render(
      <BookingDetailDrawer
        visible={true}
        onClose={mockOnClose}
        booking={mockBooking}
        getUserName={mockGetUserName}
      />
    );

    expect(screen.getByText('Booking Details')).toBeInTheDocument();
    expect(screen.getByText('booking-1')).toBeInTheDocument();
  });

  it('should not render when booking is null', () => {
    render(
      <BookingDetailDrawer
        visible={true}
        onClose={mockOnClose}
        booking={null}
        getUserName={mockGetUserName}
      />
    );

    expect(screen.queryByText('Booking Details')).not.toBeInTheDocument();
  });

  it('should display booking information correctly', () => {
    render(
      <BookingDetailDrawer
        visible={true}
        onClose={mockOnClose}
        booking={mockBooking}
        getUserName={mockGetUserName}
      />
    );

    expect(screen.getByText('booking-1')).toBeInTheDocument();
    expect(screen.getByText('Dog Walking')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('30 minutes')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('should display pets when available', () => {
    render(
      <BookingDetailDrawer
        visible={true}
        onClose={mockOnClose}
        booking={mockBooking}
        getUserName={mockGetUserName}
      />
    );

    expect(screen.getByText('Fluffy')).toBeInTheDocument();
    expect(screen.getByText('Spot')).toBeInTheDocument();
  });

  it('should display client name correctly', () => {
    render(
      <BookingDetailDrawer
        visible={true}
        onClose={mockOnClose}
        booking={mockBooking}
        getUserName={mockGetUserName}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should display unassigned when no sitter', () => {
    render(
      <BookingDetailDrawer
        visible={true}
        onClose={mockOnClose}
        booking={mockBooking}
        getUserName={mockGetUserName}
      />
    );

    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('should display sitter name when assigned', () => {
    const bookingWithSitter: Booking = {
      ...mockBooking,
      sitterId: 'sitter-1',
    };

    render(
      <BookingDetailDrawer
        visible={true}
        onClose={mockOnClose}
        booking={bookingWithSitter}
        getUserName={mockGetUserName}
      />
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should display optional fields when present', () => {
    const bookingWithExtras: Booking = {
      ...mockBooking,
      specialInstructions: 'Feed at 5pm',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      checkInTime: new Date('2024-01-15T10:00:00'),
      checkOutTime: new Date('2024-01-15T11:00:00'),
      visitNotes: 'Pet was happy',
    };

    render(
      <BookingDetailDrawer
        visible={true}
        onClose={mockOnClose}
        booking={bookingWithExtras}
        getUserName={mockGetUserName}
      />
    );

    expect(screen.getByText('Feed at 5pm')).toBeInTheDocument();
    expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
    expect(screen.getByText('Pet was happy')).toBeInTheDocument();
  });
});

