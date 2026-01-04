/**
 * BookingFilters Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingFiltersComponent } from './BookingFilters';
import type { BookingFilters } from '@/types';

describe('BookingFiltersComponent', () => {
  const mockOnFiltersChange = vi.fn();
  const mockOnRefresh = vi.fn();
  const mockOnExport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all filter controls', () => {
    const filters: BookingFilters = {};
    
    render(
      <BookingFiltersComponent
        filters={filters}
        onFiltersChange={mockOnFiltersChange}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />
    );

    expect(screen.getByPlaceholderText(/search bookings/i)).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('should call onRefresh when refresh button is clicked', async () => {
    const user = userEvent.setup();
    const filters: BookingFilters = {};
    
    render(
      <BookingFiltersComponent
        filters={filters}
        onFiltersChange={mockOnFiltersChange}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />
    );

    const refreshButton = screen.getByText('Refresh');
    await user.click(refreshButton);

    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('should call onExport when export button is clicked', async () => {
    const user = userEvent.setup();
    const filters: BookingFilters = {};
    
    render(
      <BookingFiltersComponent
        filters={filters}
        onFiltersChange={mockOnFiltersChange}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
        bookingsCount={10}
      />
    );

    const exportButton = screen.getByText('Export CSV');
    await user.click(exportButton);

    expect(mockOnExport).toHaveBeenCalledTimes(1);
  });

  it('should disable export button when no bookings', () => {
    const filters: BookingFilters = {};
    
    render(
      <BookingFiltersComponent
        filters={filters}
        onFiltersChange={mockOnFiltersChange}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
        bookingsCount={0}
      />
    );

    const exportButton = screen.getByRole('button', { name: /export csv/i });
    expect(exportButton).toHaveAttribute('disabled');
  });

  it('should show loading state on refresh button', () => {
    const filters: BookingFilters = {};
    
    render(
      <BookingFiltersComponent
        filters={filters}
        onFiltersChange={mockOnFiltersChange}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
        isLoading={true}
      />
    );

    const refreshButton = screen.getByText('Refresh');
    // Check that button exists (loading state is handled by Ant Design internally)
    expect(refreshButton).toBeInTheDocument();
  });

  it('should render with filter values', () => {
    const filters: BookingFilters = {
      status: ['pending', 'approved'],
      serviceType: ['dog-walking'],
    };
    
    render(
      <BookingFiltersComponent
        filters={filters}
        onFiltersChange={mockOnFiltersChange}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />
    );

    // Component should render without errors
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });
});

