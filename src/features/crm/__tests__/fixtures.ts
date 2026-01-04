/**
 * CRM Test Fixtures
 * 
 * Test data fixtures for CRM module tests.
 */

import type {
  ClientNote,
  ClientSegment,
  ClientTag,
  ClientActivity,
  PaginationParams,
  PaginatedResponse,
} from '../types/crm.types';
import type { User, Booking } from '@/types';

/**
 * Create a mock client
 */
export const createMockClient = (overrides?: Partial<User>): User => {
  return {
    id: `client-${Date.now()}`,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'petOwner',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

/**
 * Create multiple mock clients
 */
export const createMockClients = (count: number): User[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockClient({
      id: `client-${i + 1}`,
      email: `client${i + 1}@example.com`,
      firstName: `Client${i + 1}`,
      lastName: 'Test',
    })
  );
};

/**
 * Create a mock note
 */
export const createMockNote = (overrides?: Partial<ClientNote>): ClientNote => {
  return {
    id: `note-${Date.now()}`,
    clientId: 'client-1',
    content: 'Test note content',
    type: 'general',
    priority: 'medium',
    createdAt: new Date(),
    createdBy: 'admin-1',
    isResolved: false,
    ...overrides,
  };
};

/**
 * Create multiple mock notes
 */
export const createMockNotes = (count: number, clientId?: string): ClientNote[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockNote({
      id: `note-${i + 1}`,
      clientId: clientId || `client-${i + 1}`,
      content: `Test note ${i + 1}`,
    })
  );
};

/**
 * Create a mock segment
 */
export const createMockSegment = (
  overrides?: Partial<ClientSegment>
): ClientSegment => {
  return {
    id: `segment-${Date.now()}`,
    name: 'Test Segment',
    criteria: {
      minBookings: 5,
    },
    clientCount: 0,
    ...overrides,
  };
};

/**
 * Create a mock tag
 */
export const createMockTag = (overrides?: Partial<ClientTag>): ClientTag => {
  return {
    id: `tag-${Date.now()}`,
    name: 'Test Tag',
    color: '#1890ff',
    category: 'custom',
    ...overrides,
  };
};

/**
 * Create a mock activity
 */
export const createMockActivity = (
  overrides?: Partial<ClientActivity>
): ClientActivity => {
  return {
    id: `activity-${Date.now()}`,
    clientId: 'client-1',
    type: 'note',
    description: 'Test activity',
    timestamp: new Date(),
    ...overrides,
  };
};

/**
 * Create a mock booking
 */
export const createMockBooking = (overrides?: Partial<Booking>): Booking => {
  return {
    id: `booking-${Date.now()}`,
    clientId: 'client-1',
    serviceType: 'dogWalking',
    status: 'pending',
    scheduledDate: new Date().toISOString(),
    price: '50.00',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
};

/**
 * Create paginated response
 */
export const createPaginatedResponse = <T>(
  data: T[],
  params: PaginationParams
): PaginatedResponse<T> => {
  const total = data.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    total,
    page,
    pageSize,
    totalPages,
    hasMore: page < totalPages,
  };
};

/**
 * Wait for async operations
 */
export const waitFor = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

