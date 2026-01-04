/**
 * useSitters Hook Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSitters } from './useSitters';
import { userService } from '@/services/user.service';
import { useAuth } from '@/contexts/AuthContext';

// Mock dependencies
vi.mock('@/services/user.service');
vi.mock('@/contexts/AuthContext');

const mockUserService = vi.mocked(userService);
const mockUseAuth = vi.mocked(useAuth);

describe('useSitters', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch sitters successfully', async () => {
    const mockSitters = [
      {
        id: 'sitter1',
        email: 'sitter1@test.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'petSitter' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockUseAuth.mockReturnValue({
      isAdmin: true,
      loading: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } as any);

    mockUserService.getUsersByRole.mockResolvedValue(mockSitters);

    const { result } = renderHook(() => useSitters(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockSitters);
    expect(mockUserService.getUsersByRole).toHaveBeenCalledWith('petSitter');
  });

  it('should not fetch when not authorized', () => {
    mockUseAuth.mockReturnValue({
      isAdmin: false,
      loading: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } as any);

    renderHook(() => useSitters(), { wrapper });

    expect(mockUserService.getUsersByRole).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    mockUseAuth.mockReturnValue({
      isAdmin: true,
      loading: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } as any);

    mockUserService.getUsersByRole.mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => useSitters(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });
});

