/**
 * Error State Component
 * Displays error states with retry options
 */

import React from 'react';
import { Result, Button, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { a11y } from '@/design/utils/a11y';

const { Text } = Typography;

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  errorId?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  errorId,
}) => {
  return (
    <Result
      status="error"
      title={title}
      subTitle={message}
      extra={
        onRetry && (
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={onRetry}
            {...a11y.label(retryLabel)}
            {...(errorId ? a11y.describedBy(errorId) : {})}
          >
            {retryLabel}
          </Button>
        )
      }
      {...(errorId ? { id: errorId } : {})}
    />
  );
};

