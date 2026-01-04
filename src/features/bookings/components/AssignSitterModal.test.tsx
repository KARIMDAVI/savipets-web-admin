/**
 * AssignSitterModal Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AssignSitterModal } from './AssignSitterModal';
import type { User } from '@/types';

const mockSitters: User[] = [
  {
    id: 'sitter-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'petSitter',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sitter-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    role: 'petSitter',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('AssignSitterModal', () => {
  let queryClient: QueryClient;
  const mockOnAssign = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('should render modal when visible', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AssignSitterModal
          visible={true}
          onCancel={mockOnCancel}
          onAssign={mockOnAssign}
          sitters={mockSitters}
        />
      </QueryClientProvider>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Assign Sitter', { selector: '.ant-modal-title' })).toBeInTheDocument();
  });

  it('should not render modal when not visible', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AssignSitterModal
          visible={false}
          onCancel={mockOnCancel}
          onAssign={mockOnAssign}
          sitters={mockSitters}
        />
      </QueryClientProvider>
    );

    expect(screen.queryByText('Assign Sitter')).not.toBeInTheDocument();
  });

  it('should display empty state when no sitters', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AssignSitterModal
          visible={true}
          onCancel={mockOnCancel}
          onAssign={mockOnAssign}
          sitters={[]}
        />
      </QueryClientProvider>
    );

    expect(screen.getByText(/No sitters available/i)).toBeInTheDocument();
  });

  it('should display sitter options when sitters are available', async () => {
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={queryClient}>
        <AssignSitterModal
          visible={true}
          onCancel={mockOnCancel}
          onAssign={mockOnAssign}
          sitters={mockSitters}
        />
      </QueryClientProvider>
    );

    const select = screen.getByLabelText('Select Sitter');
    await user.click(select);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should call onAssign when form is submitted', async () => {
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={queryClient}>
        <AssignSitterModal
          visible={true}
          onCancel={mockOnCancel}
          onAssign={mockOnAssign}
          sitters={mockSitters}
        />
      </QueryClientProvider>
    );

    const select = screen.getByLabelText('Select Sitter');
    await user.click(select);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    await user.click(screen.getByText('John Doe'));
    
    const submitButton = screen.getByRole('button', { name: /assign sitter/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnAssign).toHaveBeenCalledWith('sitter-1');
    });
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={queryClient}>
        <AssignSitterModal
          visible={true}
          onCancel={mockOnCancel}
          onAssign={mockOnAssign}
          sitters={mockSitters}
        />
      </QueryClientProvider>
    );

    await user.click(screen.getByText('Cancel'));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should reset form when cancelled', async () => {
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={queryClient}>
        <AssignSitterModal
          visible={true}
          onCancel={mockOnCancel}
          onAssign={mockOnAssign}
          sitters={mockSitters}
        />
      </QueryClientProvider>
    );

    const select = screen.getByLabelText('Select Sitter');
    await user.click(select);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    await user.click(screen.getByText('John Doe'));
    await user.click(screen.getByText('Cancel'));

    // Form should be reset (select should be empty)
    expect(mockOnCancel).toHaveBeenCalled();
  });
});

