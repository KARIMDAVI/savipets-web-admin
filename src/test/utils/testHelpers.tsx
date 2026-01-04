/**
 * Test Helpers and Utilities
 * 
 * Common utilities for testing React components with React Query and Router
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Create a test QueryClient with sensible defaults for testing
 */
export const createTestQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

/**
 * Mock Auth Context values for testing
 */
export const mockAuthContext = {
  user: {
    id: 'test-admin',
    role: 'admin',
    email: 'admin@test.com',
    name: 'Test Admin',
  },
  isAuthenticated: true,
  isAdmin: true,
  loading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
};

/**
 * Wrapper component for testing components that need React Query and Router
 */
interface TestWrapperProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  queryClient = createTestQueryClient(),
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Custom render function that includes common providers
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient }
) => {
  const { queryClient, ...renderOptions } = options || {};

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestWrapper queryClient={queryClient}>{children}</TestWrapper>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

