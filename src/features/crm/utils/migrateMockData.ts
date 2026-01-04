/**
 * Mock Data Migration Utility
 * 
 * Utility to export mock data for manual review before migration to real API.
 * This preserves mock data structure for reference during development.
 */

import type { ClientNote, ClientTag, ClientSegment } from '../types/crm.types';

/**
 * Export mock data structure
 * This can be used to preserve mock data before removing it
 */
export const exportMockData = () => {
  const mockNotes: ClientNote[] = [
    {
      id: 'note1',
      clientId: 'client1',
      content: 'Prefers morning walks for their dog',
      type: 'preference',
      priority: 'medium',
      createdAt: new Date('2024-01-15'),
      createdBy: 'admin',
      isResolved: false,
    },
    {
      id: 'note2',
      clientId: 'client1',
      content: 'Follow up on service satisfaction',
      type: 'follow_up',
      priority: 'high',
      createdAt: new Date('2024-01-18'),
      createdBy: 'admin',
      isResolved: false,
    },
  ];

  const mockTags: ClientTag[] = [
    { id: 'tag1', name: 'VIP', color: 'gold', category: 'status' },
    { id: 'tag2', name: 'Morning Walker', color: 'blue', category: 'preference' },
    { id: 'tag3', name: 'High Value', color: 'green', category: 'behavior' },
    { id: 'tag4', name: 'New Client', color: 'orange', category: 'status' },
  ];

  const mockSegments: ClientSegment[] = [
    {
      id: 'segment1',
      name: 'VIP Clients',
      criteria: { minSpent: 1000, minBookings: 10 },
      clientCount: 15,
    },
    {
      id: 'segment2',
      name: 'At Risk',
      criteria: { maxDaysSinceLastBooking: 30 },
      clientCount: 8,
    },
    {
      id: 'segment3',
      name: 'New Clients',
      criteria: { minBookings: 1, maxDaysSinceLastBooking: 7 },
      clientCount: 23,
    },
  ];

  return {
    notes: mockNotes,
    tags: mockTags,
    segments: mockSegments,
  };
};

/**
 * Save mock data to JSON format
 * Can be used to export data for review or migration
 */
export const saveMockDataToFile = () => {
  const data = exportMockData();
  const json = JSON.stringify(data, null, 2);
  
  // In browser environment, log to console
  // In Node.js environment, could write to file
  console.log('Mock data export:', json);
  
  // For browser: create download link
  if (typeof window !== 'undefined') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-mock-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  return json;
};












