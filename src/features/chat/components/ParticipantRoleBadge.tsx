/**
 * Participant Role Badge Component
 * 
 * Displays a badge indicating user roles (Admin, Sitter, Owner).
 * Uses icons and color coding for visual distinction.
 */

import React from 'react';
import { Tag } from 'antd';
import { UserOutlined, SafetyOutlined, TeamOutlined } from '@ant-design/icons';
import type { User } from '@/types';

interface ParticipantRoleBadgeProps {
  role: User['role'];
  size?: 'small' | 'default';
}

/**
 * Get badge configuration for user role
 */
function getRoleConfig(role: User['role']): {
  color: string;
  label: string;
  icon: React.ReactNode;
} {
  switch (role) {
    case 'admin':
      return {
        color: 'red',
        label: 'Admin',
        icon: <SafetyOutlined />,
      };
    case 'petSitter':
      return {
        color: 'blue',
        label: 'Sitter',
        icon: <UserOutlined />,
      };
    case 'petOwner':
      return {
        color: 'green',
        label: 'Owner',
        icon: <TeamOutlined />,
      };
    default:
      return {
        color: 'default',
        label: 'Unknown',
        icon: <UserOutlined />,
      };
  }
}

/**
 * Participant Role Badge
 * 
 * Displays a badge with icon and label for user roles.
 * Accessible with proper ARIA labels.
 */
export const ParticipantRoleBadge: React.FC<ParticipantRoleBadgeProps> = ({
  role,
  size = 'default',
}) => {
  const { color, label, icon } = getRoleConfig(role);

  return (
    <Tag
      color={color}
      icon={icon}
      aria-label={`User role: ${label}`}
      style={{
        margin: 0,
        fontSize: size === 'small' ? '11px' : '12px',
        lineHeight: size === 'small' ? '18px' : '20px',
        padding: size === 'small' ? '0 6px' : '2px 8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {label}
    </Tag>
  );
};

