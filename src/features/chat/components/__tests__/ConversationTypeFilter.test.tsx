/**
 * Unit Tests: Conversation Type Filter Component
 * 
 * Tests for ConversationTypeFilter component functionality and accessibility.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversationTypeFilter } from '../ConversationTypeFilter';
import type { ConversationCategory } from '../../types/conversation.types';

describe('ConversationTypeFilter', () => {
  const mockCategoryCounts: Record<ConversationCategory, number> = {
    'admin-sitter': 5,
    'admin-owner': 3,
    'sitter-owner': 7,
    'unknown': 1,
  };

  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render all filter tabs with counts', () => {
      render(
        <ConversationTypeFilter
          activeFilter="all"
          onFilterChange={mockOnFilterChange}
          categoryCounts={mockCategoryCounts}
          totalCount={16}
        />
      );

      expect(screen.getByText('All (16)')).toBeInTheDocument();
      expect(screen.getByText('Admin ↔ Sitter (5)')).toBeInTheDocument();
      expect(screen.getByText('Admin ↔ Owner (3)')).toBeInTheDocument();
      expect(screen.getByText('Sitter ↔ Owner (7)')).toBeInTheDocument();
    });

    it('should highlight active filter', () => {
      const { container } = render(
        <ConversationTypeFilter
          activeFilter="admin-sitter"
          onFilterChange={mockOnFilterChange}
          categoryCounts={mockCategoryCounts}
          totalCount={16}
        />
      );

      const activeTab = container.querySelector('.ant-tabs-tab-active');
      expect(activeTab).toBeInTheDocument();
      expect(activeTab?.textContent).toContain('Admin ↔ Sitter');
    });
  });

  describe('Filter switching', () => {
    it('should call onFilterChange when tab is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ConversationTypeFilter
          activeFilter="all"
          onFilterChange={mockOnFilterChange}
          categoryCounts={mockCategoryCounts}
          totalCount={16}
        />
      );

      const sitterOwnerTab = screen.getByText('Sitter ↔ Owner (7)');
      await user.click(sitterOwnerTab);

      expect(mockOnFilterChange).toHaveBeenCalledWith('sitter-owner');
      expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    });

    it('should switch to admin-owner filter', async () => {
      const user = userEvent.setup();
      render(
        <ConversationTypeFilter
          activeFilter="all"
          onFilterChange={mockOnFilterChange}
          categoryCounts={mockCategoryCounts}
          totalCount={16}
        />
      );

      const adminOwnerTab = screen.getByText('Admin ↔ Owner (3)');
      await user.click(adminOwnerTab);

      expect(mockOnFilterChange).toHaveBeenCalledWith('admin-owner');
    });

    it('should switch back to all filter', async () => {
      const user = userEvent.setup();
      render(
        <ConversationTypeFilter
          activeFilter="sitter-owner"
          onFilterChange={mockOnFilterChange}
          categoryCounts={mockCategoryCounts}
          totalCount={16}
        />
      );

      const allTab = screen.getByText('All (16)');
      await user.click(allTab);

      expect(mockOnFilterChange).toHaveBeenCalledWith('all');
    });
  });

  describe('Counts display', () => {
    it('should display correct counts for each category', () => {
      render(
        <ConversationTypeFilter
          activeFilter="all"
          onFilterChange={mockOnFilterChange}
          categoryCounts={mockCategoryCounts}
          totalCount={16}
        />
      );

      expect(screen.getByText('All (16)')).toBeInTheDocument();
      expect(screen.getByText('Admin ↔ Sitter (5)')).toBeInTheDocument();
      expect(screen.getByText('Admin ↔ Owner (3)')).toBeInTheDocument();
      expect(screen.getByText('Sitter ↔ Owner (7)')).toBeInTheDocument();
    });

    it('should handle zero counts', () => {
      const zeroCounts: Record<ConversationCategory, number> = {
        'admin-sitter': 0,
        'admin-owner': 0,
        'sitter-owner': 0,
        'unknown': 0,
      };

      render(
        <ConversationTypeFilter
          activeFilter="all"
          onFilterChange={mockOnFilterChange}
          categoryCounts={zeroCounts}
          totalCount={0}
        />
      );

      expect(screen.getByText('All (0)')).toBeInTheDocument();
      expect(screen.getByText('Admin ↔ Sitter (0)')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label', () => {
      const { container } = render(
        <ConversationTypeFilter
          activeFilter="all"
          onFilterChange={mockOnFilterChange}
          categoryCounts={mockCategoryCounts}
          totalCount={16}
        />
      );

      const filter = container.querySelector('[aria-label]');
      expect(filter).toBeInTheDocument();
      expect(filter).toHaveAttribute('aria-label', 'Conversation type filter');
    });
  });

  describe('Filter labels', () => {
    it('should display correct labels for all filter types', () => {
      const { rerender } = render(
        <ConversationTypeFilter
          activeFilter="all"
          onFilterChange={mockOnFilterChange}
          categoryCounts={mockCategoryCounts}
          totalCount={16}
        />
      );

      expect(screen.getByText('All (16)')).toBeInTheDocument();
      expect(screen.getByText('Admin ↔ Sitter (5)')).toBeInTheDocument();
      expect(screen.getByText('Admin ↔ Owner (3)')).toBeInTheDocument();
      expect(screen.getByText('Sitter ↔ Owner (7)')).toBeInTheDocument();

      // Test unknown category
      const unknownCounts: Record<ConversationCategory, number> = {
        'admin-sitter': 0,
        'admin-owner': 0,
        'sitter-owner': 0,
        'unknown': 2,
      };

      rerender(
        <ConversationTypeFilter
          activeFilter="unknown"
          onFilterChange={mockOnFilterChange}
          categoryCounts={unknownCounts}
          totalCount={2}
        />
      );

      expect(screen.getByText('All (2)')).toBeInTheDocument();
    });
  });
});

