/**
 * Compact Control Button Component
 * 
 * A compact button designed for control panels that matches
 * the height of Switch and Select components (22-24px).
 * 
 * Best for: Control panels, toolbar actions, secondary actions
 */

import React from 'react';
import { Button, ButtonProps } from 'antd';
import { spacing, typography } from '@/design/tokens';

interface CompactControlButtonProps extends Omit<ButtonProps, 'size'> {
  /**
   * Whether to show only icon (most compact)
   * @default true
   */
  iconOnly?: boolean;
}

/**
 * Compact button for control panels
 * 
 * Height: 22px (matches Ant Design Switch small)
 * Use in: Control panels, toolbars, secondary actions
 * 
 * @example
 * ```tsx
 * <CompactControlButton
 *   icon={<ReloadOutlined />}
 *   onClick={handleRefresh}
 *   title="Refresh"
 * />
 * ```
 */
export const CompactControlButton: React.FC<CompactControlButtonProps> = ({
  iconOnly = true,
  icon,
  children,
  style,
  className = '',
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    height: '22px', // Match Switch small height (22px)
    padding: iconOnly ? 0 : `0 ${spacing.xs}`, // 0 for icon-only, 4px horizontal for text
    minHeight: '22px', // Override global min-height
    minWidth: iconOnly ? '22px' : 'auto', // Square for icon-only
    fontSize: typography.fontSize.xs, // 12px for compact text
    lineHeight: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  return (
    <Button
      type="text"
      size="small"
      icon={icon}
      style={baseStyle}
      className={`compact-control-button ${className}`}
      {...props}
    >
      {!iconOnly && children}
    </Button>
  );
};

