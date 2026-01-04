/**
 * Client Helper Functions
 * 
 * Utility functions for client-related operations.
 */

import type { User } from '@/types';

/**
 * Filter clients from all users
 */
export const filterClients = (allUsers: User[], isAuthorized: boolean): User[] => {
  if (!isAuthorized) {
    return [];
  }
  return allUsers.filter((user) => {
    const normalizedRole = (user.role || '').toLowerCase();
    return normalizedRole === 'petowner' || normalizedRole === 'owner' || normalizedRole === 'client';
  });
};

/**
 * Generate client options for select dropdown
 */
export const generateClientOptions = (clients: User[]) => {
  return clients.map((client) => {
    const firstName = (client.firstName || '').trim();
    const lastName = (client.lastName || '').trim();
    const displayName = (client as any).displayName ? String((client as any).displayName).trim() : '';
    const computedName =
      [firstName, lastName].filter(Boolean).join(' ') ||
      displayName ||
      '';
    const email = (client.email || '').trim();
    const labelParts = [];
    if (computedName) {
      labelParts.push(computedName);
    }
    if (email) {
      labelParts.push(`(${email})`);
    }
    const label = labelParts.length > 0 ? labelParts.join(' ') : 'Unnamed Pet Owner';
    return {
      value: client.id,
      label,
      disabled: client.isActive === false,
    };
  });
};


