/**
 * Conversation Type Badge Component
 * 
 * Displays a color-coded badge indicating the conversation category:
 * - Admin-Sitter (blue)
 * - Admin-Owner (green)
 * - Sitter-Owner (orange)
 * - Unknown (gray)
 */

import React from 'react';
import { Tag } from 'antd';
import type { ConversationCategory } from '../types/conversation.types';

interface ConversationTypeBadgeProps {
  category: ConversationCategory;
  size?: 'small' | 'default';
}

/**
 * Get badge configuration for conversation category
 */
function getBadgeConfig(category: ConversationCategory): {
  color: string;
  label: string;
} {
  switch (category) {
    case 'admin-sitter':
      return {
        color: 'blue',
        label: 'Admin ↔ Sitter',
      };
    case 'admin-owner':
      return {
        color: 'green',
        label: 'Admin ↔ Owner',
      };
    case 'sitter-owner':
      return {
        color: 'orange',
        label: 'Sitter ↔ Owner',
      };
    case 'unknown':
    default:
      return {
        color: 'default',
        label: 'Unknown',
      };
  }
}

/**
 * Conversation Type Badge
 * 
 * Displays a color-coded badge for conversation categories.
 * Accessible with proper ARIA labels.
 */
export const ConversationTypeBadge: React.FC<ConversationTypeBadgeProps> = ({
  category,
  size = 'default',
}) => {
  const { color, label } = getBadgeConfig(category);

  return (
    <Tag
      color={color}
      aria-label={`Conversation type: ${label}`}
      style={{
        margin: 0,
        fontSize: size === 'small' ? '11px' : '12px',
        lineHeight: size === 'small' ? '18px' : '20px',
        padding: size === 'small' ? '0 6px' : '2px 8px',
      }}
    >
      {label}
    </Tag>
  );
};

