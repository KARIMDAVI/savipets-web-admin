/**
 * Conversation Type Filter Component
 * 
 * Displays filter tabs for conversation categories with counts.
 * Allows filtering conversations by type: All, Admin-Sitter, Admin-Owner, Sitter-Owner.
 */

import React from 'react';
import { Tabs } from 'antd';
import type { ConversationCategory } from '../types/conversation.types';

interface ConversationTypeFilterProps {
  activeFilter: ConversationCategory | 'all';
  onFilterChange: (filter: ConversationCategory | 'all') => void;
  categoryCounts: Record<ConversationCategory, number>;
  totalCount: number;
}

/**
 * Get display label for filter category
 */
function getFilterLabel(category: ConversationCategory | 'all'): string {
  switch (category) {
    case 'all':
      return 'All';
    case 'admin-sitter':
      return 'Admin ↔ Sitter';
    case 'admin-owner':
      return 'Admin ↔ Owner';
    case 'sitter-owner':
      return 'Sitter ↔ Owner';
    case 'unknown':
      return 'Unknown';
    default:
      return 'All';
  }
}

/**
 * Conversation Type Filter
 * 
 * Filter tabs component for organizing conversations by category.
 * Shows counts for each category and allows switching between filters.
 */
export const ConversationTypeFilter: React.FC<ConversationTypeFilterProps> = ({
  activeFilter,
  onFilterChange,
  categoryCounts,
  totalCount,
}) => {
  const tabItems = [
    {
      key: 'all',
      label: `All (${totalCount})`,
    },
    {
      key: 'admin-sitter',
      label: `Admin ↔ Sitter (${categoryCounts['admin-sitter']})`,
    },
    {
      key: 'admin-owner',
      label: `Admin ↔ Owner (${categoryCounts['admin-owner']})`,
    },
    {
      key: 'sitter-owner',
      label: `Sitter ↔ Owner (${categoryCounts['sitter-owner']})`,
    },
  ];

  return (
    <Tabs
      activeKey={activeFilter}
      onChange={(key) => onFilterChange(key as ConversationCategory | 'all')}
      items={tabItems}
      size="small"
      style={{
        marginBottom: '16px',
      }}
      aria-label="Conversation type filter"
    />
  );
};

