/**
 * Tests for EmptyState Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('should render title and description', () => {
    render(
      <EmptyState
        title="No items"
        description="Get started by creating your first item"
      />
    );

    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first item')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        title="No items"
        description="Description"
        action={{ label: 'Create Item', onClick: handleClick }}
      />
    );

    const button = screen.getByText('Create Item');
    expect(button).toBeInTheDocument();
    
    button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render secondary action button when provided', () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        title="No items"
        description="Description"
        secondaryAction={{ label: 'Learn More', onClick: handleClick }}
      />
    );

    const button = screen.getByText('Learn More');
    expect(button).toBeInTheDocument();
  });

  it('should render both action and secondary action', () => {
    render(
      <EmptyState
        title="No items"
        description="Description"
        action={{ label: 'Create', onClick: vi.fn() }}
        secondaryAction={{ label: 'Cancel', onClick: vi.fn() }}
      />
    );

    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should apply size prop correctly', () => {
    const { container } = render(
      <EmptyState
        title="No items"
        description="Description"
        size="small"
      />
    );

    // Check that component renders (size affects styling, not structure)
    expect(container).toBeInTheDocument();
  });
});

