/**
 * Empty State Component
 * Displays helpful empty states with actions
 */

import React from 'react';
import { Empty, Button, Typography, Space } from 'antd';
import { EmptyStateIllustration } from './EmptyStateIllustration';
import { spacing } from '@/design/tokens';

const { Title, Text } = Typography;

interface EmptyStateProps {
  title: string;
  description: string;
  illustration?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'small' | 'default' | 'large';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  illustration,
  action,
  secondaryAction,
  size = 'default',
}) => {
  return (
    <Empty
      image={illustration || <EmptyStateIllustration />}
      imageStyle={{
        height: size === 'small' ? 80 : size === 'large' ? 200 : 120,
      }}
      description={
        <Space direction="vertical" size="small" align="center">
          <Title level={size === 'small' ? 5 : 4} style={{ margin: 0 }}>
            {title}
          </Title>
          <Text type="secondary" style={{ fontSize: size === 'small' ? '12px' : '14px' }}>
            {description}
          </Text>
          {(action || secondaryAction) && (
            <Space style={{ marginTop: spacing.md }}>
              {action && (
                <Button type="primary" onClick={action.onClick} aria-label={action.label}>
                  {action.label}
                </Button>
              )}
              {secondaryAction && (
                <Button onClick={secondaryAction.onClick} aria-label={secondaryAction.label}>
                  {secondaryAction.label}
                </Button>
              )}
            </Space>
          )}
        </Space>
      }
    />
  );
};

