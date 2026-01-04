/**
 * Tests for ThemeToggle Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/design/utils/themeProvider';
import { ThemeToggle } from '../ThemeToggle';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should render theme toggle button', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should show Dark mode initially when in light mode', () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('should toggle theme when clicked', async () => {
    const { user } = await import('@testing-library/user-event');
    const userEvent = user.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    await userEvent.click(button);

    // Theme should toggle (check localStorage was called)
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should have accessible label', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });
});

