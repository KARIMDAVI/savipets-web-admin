/**
 * AI Status Alert Component
 * 
 * Displays alert when AI assignment is disabled.
 */

import React from 'react';
import { Alert } from 'antd';

interface AIStatusAlertProps {
  aiEnabled: boolean;
}

export const AIStatusAlert: React.FC<AIStatusAlertProps> = ({ aiEnabled }) => {
  if (aiEnabled) return null;

  return (
    <Alert
      message="AI Assignment Disabled"
      description="AI-powered sitter assignment is currently disabled. Enable it to get intelligent recommendations."
      type="warning"
      showIcon
      style={{ marginBottom: '16px' }}
    />
  );
};

