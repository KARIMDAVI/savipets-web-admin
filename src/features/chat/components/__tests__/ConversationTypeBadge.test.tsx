/**
 * Unit Tests: Conversation Type Badge Component
 * 
 * Tests for ConversationTypeBadge component rendering and accessibility.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConversationTypeBadge } from '../ConversationTypeBadge';
import type { ConversationCategory } from '../../types/conversation.types';

describe('ConversationTypeBadge', () => {
  const categories: ConversationCategory[] = [
    'admin-sitter',
    'admin-owner',
    'sitter-owner',
    'unknown',
  ];

  describe('Rendering', () => {
    it('should render admin-sitter badge with blue color', () => {
      render(<ConversationTypeBadge category="admin-sitter" />);
      const badge = screen.getByText('Admin ↔ Sitter');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'Conversation type: Admin ↔ Sitter');
    });

    it('should render admin-owner badge with green color', () => {
      render(<ConversationTypeBadge category="admin-owner" />);
      const badge = screen.getByText('Admin ↔ Owner');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'Conversation type: Admin ↔ Owner');
    });

    it('should render sitter-owner badge with orange color', () => {
      render(<ConversationTypeBadge category="sitter-owner" />);
      const badge = screen.getByText('Sitter ↔ Owner');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'Conversation type: Sitter ↔ Owner');
    });

    it('should render unknown badge with default color', () => {
      render(<ConversationTypeBadge category="unknown" />);
      const badge = screen.getByText('Unknown');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'Conversation type: Unknown');
    });
  });

  describe('Size variants', () => {
    it('should render with default size', () => {
      render(<ConversationTypeBadge category="admin-sitter" />);
      const badge = screen.getByText('Admin ↔ Sitter');
      expect(badge).toHaveStyle({ fontSize: '12px' });
    });

    it('should render with small size', () => {
      render(<ConversationTypeBadge category="admin-sitter" size="small" />);
      const badge = screen.getByText('Admin ↔ Sitter');
      expect(badge).toHaveStyle({ fontSize: '11px' });
    });
  });

  describe('Accessibility', () => {
    it.each(categories)('should have aria-label for %s category', (category) => {
      const { container } = render(<ConversationTypeBadge category={category} />);
      const badge = container.querySelector('[aria-label]');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label');
      expect(badge?.getAttribute('aria-label')).toContain('Conversation type:');
    });
  });
});

