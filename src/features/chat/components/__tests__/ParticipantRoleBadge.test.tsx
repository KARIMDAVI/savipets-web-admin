/**
 * Unit Tests: Participant Role Badge Component
 * 
 * Tests for ParticipantRoleBadge component rendering and accessibility.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ParticipantRoleBadge } from '../ParticipantRoleBadge';
import type { User } from '@/types';

describe('ParticipantRoleBadge', () => {
  const roles: User['role'][] = ['admin', 'petSitter', 'petOwner'];

  describe('Rendering', () => {
    it('should render admin badge with red color', () => {
      const { container } = render(<ParticipantRoleBadge role="admin" />);
      expect(screen.getByText('Admin')).toBeInTheDocument();
      const badge = container.querySelector('[aria-label]');
      expect(badge).toHaveAttribute('aria-label', 'User role: Admin');
    });

    it('should render sitter badge with blue color', () => {
      const { container } = render(<ParticipantRoleBadge role="petSitter" />);
      expect(screen.getByText('Sitter')).toBeInTheDocument();
      const badge = container.querySelector('[aria-label]');
      expect(badge).toHaveAttribute('aria-label', 'User role: Sitter');
    });

    it('should render owner badge with green color', () => {
      const { container } = render(<ParticipantRoleBadge role="petOwner" />);
      expect(screen.getByText('Owner')).toBeInTheDocument();
      const badge = container.querySelector('[aria-label]');
      expect(badge).toHaveAttribute('aria-label', 'User role: Owner');
    });
  });

  describe('Size variants', () => {
    it('should render with default size', () => {
      const { container } = render(<ParticipantRoleBadge role="admin" />);
      const badge = container.querySelector('.ant-tag');
      expect(badge).toHaveStyle({ fontSize: '12px' });
    });

    it('should render with small size', () => {
      const { container } = render(<ParticipantRoleBadge role="admin" size="small" />);
      const badge = container.querySelector('.ant-tag');
      expect(badge).toHaveStyle({ fontSize: '11px' });
    });
  });

  describe('Icons', () => {
    it('should display icon for admin role', () => {
      const { container } = render(<ParticipantRoleBadge role="admin" />);
      const icon = container.querySelector('.anticon');
      expect(icon).toBeInTheDocument();
    });

    it('should display icon for sitter role', () => {
      const { container } = render(<ParticipantRoleBadge role="petSitter" />);
      const icon = container.querySelector('.anticon');
      expect(icon).toBeInTheDocument();
    });

    it('should display icon for owner role', () => {
      const { container } = render(<ParticipantRoleBadge role="petOwner" />);
      const icon = container.querySelector('.anticon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it.each(roles)('should have aria-label for %s role', (role) => {
      const { container } = render(<ParticipantRoleBadge role={role} />);
      const badge = container.querySelector('[aria-label]');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label');
      expect(badge?.getAttribute('aria-label')).toContain('User role:');
    });
  });
});

