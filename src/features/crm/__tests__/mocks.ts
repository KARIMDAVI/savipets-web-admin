/**
 * CRM Test Mocks
 * 
 * Mock implementations for CRM services and utilities.
 */

import type {
  ClientNote,
  ClientSegment,
  ClientTag,
  ClientActivity,
} from '../types/crm.types';
import type { User, Booking } from '@/types';

/**
 * Mock client data
 */
export const mockClient: User = {
  id: 'client-1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'petOwner',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  phoneNumber: '+1234567890',
  rating: 4.5,
  totalBookings: 10,
};

/**
 * Mock clients array
 */
export const mockClients: User[] = [
  mockClient,
  {
    ...mockClient,
    id: 'client-2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    rating: 5.0,
    totalBookings: 25,
  },
  {
    ...mockClient,
    id: 'client-3',
    email: 'bob.jones@example.com',
    firstName: 'Bob',
    lastName: 'Jones',
    rating: 3.5,
    totalBookings: 5,
  },
];

/**
 * Mock note data
 */
export const mockNote: ClientNote = {
  id: 'note-1',
  clientId: 'client-1',
  content: 'Test note content',
  type: 'general',
  priority: 'medium',
  createdAt: new Date('2024-01-15'),
  createdBy: 'admin-1',
  isResolved: false,
};

/**
 * Mock notes array
 */
export const mockNotes: ClientNote[] = [
  mockNote,
  {
    ...mockNote,
    id: 'note-2',
    content: 'Another test note',
    type: 'preference',
    priority: 'high',
    createdAt: new Date('2024-01-16'),
  },
  {
    ...mockNote,
    id: 'note-3',
    content: 'Resolved note',
    isResolved: true,
    resolvedAt: new Date('2024-01-17'),
    resolvedBy: 'admin-1',
  },
];

/**
 * Mock segment data
 */
export const mockSegment: ClientSegment = {
  id: 'segment-1',
  name: 'VIP Clients',
  criteria: {
    minBookings: 10,
    minSpent: 1000,
  },
  clientCount: 5,
};

/**
 * Mock segments array
 */
export const mockSegments: ClientSegment[] = [
  mockSegment,
  {
    id: 'segment-2',
    name: 'At Risk',
    criteria: {
      maxDaysSinceLastBooking: 30,
    },
    clientCount: 3,
  },
];

/**
 * Mock tag data
 */
export const mockTag: ClientTag = {
  id: 'tag-1',
  name: 'Preferred',
  color: '#1890ff',
  category: 'preference',
};

/**
 * Mock tags array
 */
export const mockTags: ClientTag[] = [
  mockTag,
  {
    id: 'tag-2',
    name: 'High Value',
    color: '#52c41a',
    category: 'status',
  },
];

/**
 * Mock activity data
 */
export const mockActivity: ClientActivity = {
  id: 'activity-1',
  clientId: 'client-1',
  type: 'note',
  description: 'Note created',
  timestamp: new Date('2024-01-15'),
};

/**
 * Mock activities array
 */
export const mockActivities: ClientActivity[] = [
  mockActivity,
  {
    ...mockActivity,
    id: 'activity-2',
    type: 'booking',
    description: 'Booking created',
    timestamp: new Date('2024-01-16'),
  },
];

/**
 * Mock booking data
 */
export const mockBooking: Booking = {
  id: 'booking-1',
  clientId: 'client-1',
  sitterId: 'sitter-1',
  serviceType: 'dogWalking',
  status: 'confirmed',
  scheduledDate: new Date('2024-01-20').toISOString(),
  price: '50.00',
  createdAt: new Date('2024-01-10').toISOString(),
};

/**
 * Mock bookings array
 */
export const mockBookings: Booking[] = [
  mockBooking,
  {
    ...mockBooking,
    id: 'booking-2',
    scheduledDate: new Date('2024-01-21').toISOString(),
    price: '75.00',
  },
];

/**
 * Mock CRM service
 */
export const createMockCRMService = () => {
  return {
    getClientsPaginated: vi.fn().mockResolvedValue({
      data: mockClients,
      total: mockClients.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasMore: false,
    }),
    getNotesPaginated: vi.fn().mockResolvedValue({
      data: mockNotes,
      total: mockNotes.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasMore: false,
    }),
    getAllNotes: vi.fn().mockResolvedValue(mockNotes),
    getClientNotes: vi.fn().mockResolvedValue(mockNotes),
    createNote: vi.fn().mockResolvedValue(mockNote),
    updateNote: vi.fn().mockResolvedValue(undefined),
    deleteNote: vi.fn().mockResolvedValue(undefined),
    getSegments: vi.fn().mockResolvedValue(mockSegments),
    createSegment: vi.fn().mockResolvedValue(mockSegment),
    updateSegment: vi.fn().mockResolvedValue(undefined),
    deleteSegment: vi.fn().mockResolvedValue(undefined),
    getTags: vi.fn().mockResolvedValue(mockTags),
    createTag: vi.fn().mockResolvedValue(mockTag),
    updateTag: vi.fn().mockResolvedValue(undefined),
    deleteTag: vi.fn().mockResolvedValue(undefined),
    getClientActivities: vi.fn().mockResolvedValue(mockActivities),
    logActivity: vi.fn().mockResolvedValue(mockActivity),
  };
};

